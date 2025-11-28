"""
Gallery Router - Handles test images gallery and file listing
"""
import logging
import os
from typing import Optional
from pathlib import Path
from urllib.parse import unquote
from fastapi import APIRouter, HTTPException, Query, Request, Response
from fastapi.responses import JSONResponse, FileResponse

from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/gallery", tags=["gallery"])


# Debug endpoint to check image paths
@router.get("/debug")
async def debug_paths():
    """Debug endpoint to check image paths on server"""
    test_images_path = settings.get_absolute_path(settings.test_images_path)
    
    # Check if directory exists and list files
    exists = test_images_path.exists()
    is_dir = test_images_path.is_dir() if exists else False
    
    files = []
    if exists and is_dir:
        files = [f.name for f in list(test_images_path.iterdir())[:10]]  # First 10 files
    
    return {
        "test_images_path_config": settings.test_images_path,
        "test_images_path_resolved": str(test_images_path),
        "exists": exists,
        "is_directory": is_dir,
        "sample_files": files,
        "base_dir": str(Path(__file__).parent),
    }


# Handle OPTIONS preflight requests for images
@router.options("/image/{image_path:path}")
async def options_image(image_path: str, request: Request):
    """Handle CORS preflight for image requests"""
    origin = request.headers.get("origin", "*")
    # URL-decode for logging
    decoded_path = unquote(image_path)
    logger.info(f"OPTIONS preflight for image: {decoded_path}")
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400",
        }
    )


@router.get("/images")
async def get_gallery_images(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    filter_correct: Optional[bool] = Query(None, description="Filter by correct predictions"),
    search: Optional[str] = Query(None, description="Search by filename")
):
    """
    Get paginated list of test images with metadata
    
    Args:
        page: Page number (default: 1)
        page_size: Items per page (default: 20, max: 100)
        filter_correct: Filter by correct/incorrect predictions
        search: Search term for filename filtering
        
    Returns:
        JSON response with paginated image list
    """
    try:
        test_images_path = settings.get_absolute_path(settings.test_images_path)
        
        if not test_images_path.exists():
            # Try to unzip if zip file exists
            zip_path = test_images_path.parent / "test_image.zip"
            if zip_path.exists():
                return JSONResponse(content={
                    "success": False,
                    "message": "Test images need to be extracted. Please extract test_image.zip first.",
                    "zip_path": str(zip_path)
                })
            raise HTTPException(status_code=404, detail="Test images directory not found")
        
        # Get all image files
        image_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
        all_images = []
        
        for ext in image_extensions:
            all_images.extend(test_images_path.glob(f"**/*{ext}"))
            all_images.extend(test_images_path.glob(f"**/*{ext.upper()}"))
        
        # Apply search filter
        if search:
            all_images = [img for img in all_images if search.lower() in img.name.lower()]
        
        # Sort by name
        all_images.sort(key=lambda x: x.name)
        
        # Calculate pagination
        total_images = len(all_images)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_images = all_images[start_idx:end_idx]
        
        # Build response
        images_data = []
        for img_path in page_images:
            relative_path = img_path.relative_to(test_images_path)
            
            # Extract label from filename pattern
            filename = img_path.name.lower()
            if filename.startswith('cancer_') or 'tumor' in filename:
                label = "tumor"
            elif filename.startswith('not_cancer_') or 'healthy' in filename or 'normal' in filename:
                label = "healthy"
            else:
                # Try to get from folder structure if available
                parts = relative_path.parts
                label = parts[0] if len(parts) > 1 else "unknown"
            
            images_data.append({
                "filename": img_path.name,
                "path": str(relative_path),
                "label": label,
                "size": img_path.stat().st_size,
                "url": f"/api/gallery/image/{relative_path}"
            })
        
        return JSONResponse(content={
            "success": True,
            "data": {
                "images": images_data,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_items": total_images,
                    "total_pages": (total_images + page_size - 1) // page_size,
                    "has_next": end_idx < total_images,
                    "has_prev": page > 1
                }
            }
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting gallery images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/image/{image_path:path}")
async def get_image(image_path: str, request: Request):
    """
    Serve a specific test image
    
    Args:
        image_path: Relative path to the image (URL-encoded)
        request: FastAPI request object
        
    Returns:
        Image file with CORS headers
    """
    try:
        # URL-decode the path to handle special characters like parentheses
        decoded_path = unquote(image_path)
        logger.info(f"Serving image: original='{image_path}', decoded='{decoded_path}'")
        
        test_images_path = settings.get_absolute_path(settings.test_images_path)
        full_path = test_images_path / decoded_path
        
        # Security check: ensure path is within test images directory
        if not str(full_path.resolve()).startswith(str(test_images_path.resolve())):
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not full_path.exists() or not full_path.is_file():
            logger.error(f"Image not found: {full_path}")
            raise HTTPException(status_code=404, detail=f"Image not found: {decoded_path}")
        
        # Get origin from request headers
        origin = request.headers.get("origin", "")
        
        # Determine the correct media type based on file extension
        ext = full_path.suffix.lower()
        media_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg', 
            '.png': 'image/png',
            '.bmp': 'image/bmp',
            '.gif': 'image/gif'
        }
        media_type = media_types.get(ext, 'image/jpeg')
        
        # Create FileResponse with CORS headers
        response = FileResponse(
            path=str(full_path),
            media_type=media_type
        )
        
        # Add CORS headers manually (FileResponse doesn't inherit from middleware)
        # Allow the requesting origin if it's in our allowed list, otherwise use wildcard for images
        allowed_origin = "*"
        if origin:
            for allowed in settings.allowed_origins:
                if origin == allowed or (allowed.endswith('.onrender.com') and origin.endswith('.onrender.com')):
                    allowed_origin = origin
                    break
        
        response.headers["Access-Control-Allow-Origin"] = allowed_origin
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Cache-Control"] = "public, max-age=86400"  # Cache images for 1 day
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_gallery_stats():
    """
    Get statistics about test images
    
    Returns:
        JSON response with gallery statistics
    """
    try:
        test_images_path = settings.get_absolute_path(settings.test_images_path)
        
        if not test_images_path.exists():
            return JSONResponse(content={
                "success": False,
                "message": "Test images directory not found"
            })
        
        # Count images by category
        image_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
        all_images = []
        
        for ext in image_extensions:
            all_images.extend(test_images_path.glob(f"**/*{ext}"))
            all_images.extend(test_images_path.glob(f"**/*{ext.upper()}"))
        
        # Group by label (extracted from filename)
        label_counts = {}
        for img_path in all_images:
            filename = img_path.name.lower()
            if filename.startswith('cancer_') or 'tumor' in filename:
                label = "tumor"
            elif filename.startswith('not_cancer_') or 'healthy' in filename or 'normal' in filename:
                label = "healthy"
            else:
                relative_path = img_path.relative_to(test_images_path)
                parts = relative_path.parts
                label = parts[0] if len(parts) > 1 else "unknown"
            label_counts[label] = label_counts.get(label, 0) + 1
        
        return JSONResponse(content={
            "success": True,
            "data": {
                "total_images": len(all_images),
                "labels": label_counts,
                "test_images_path": str(test_images_path)
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting gallery stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
