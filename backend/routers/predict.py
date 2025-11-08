"""
Prediction Router - Handles image upload and prediction endpoints
"""
import logging
import io
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from PIL import Image

from services.model_service import model_service
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/predict", tags=["prediction"])


@router.post("/")
async def predict_image(file: UploadFile = File(...)):
    """
    Predict brain tumor from uploaded image
    
    Args:
        file: Uploaded image file (JPG, JPEG, or PNG)
        
    Returns:
        JSON response with prediction results
    """
    try:
        # Check if model is loaded
        if model_service.model is None:
            raise HTTPException(
                status_code=503,
                detail="Model is still loading. Please wait a moment and try again."
            )
        
        # Validate file extension
        file_ext = f".{file.filename.split('.')[-1].lower()}"
        if file_ext not in settings.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(settings.allowed_extensions)}"
            )
        
        # Read and validate file size
        contents = await file.read()
        if len(contents) > settings.max_upload_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {settings.max_upload_size / (1024*1024)}MB"
            )
        
        # Open image
        image = Image.open(io.BytesIO(contents))
        
        # Make prediction
        result = model_service.predict(image)
        
        return JSONResponse(content={
            "success": True,
            "data": result,
            "filename": file.filename
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/batch")
async def predict_batch(files: List[UploadFile] = File(...)):
    """
    Predict brain tumor from multiple images
    
    Args:
        files: List of uploaded image files
        
    Returns:
        JSON response with batch prediction results
    """
    try:
        if len(files) > 10:
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 images allowed per batch"
            )
        
        results = []
        errors = []
        
        for file in files:
            try:
                # Validate file
                file_ext = f".{file.filename.split('.')[-1].lower()}"
                if file_ext not in settings.allowed_extensions:
                    errors.append({
                        "filename": file.filename,
                        "error": "Invalid file type"
                    })
                    continue
                
                contents = await file.read()
                if len(contents) > settings.max_upload_size:
                    errors.append({
                        "filename": file.filename,
                        "error": "File too large"
                    })
                    continue
                
                # Make prediction
                image = Image.open(io.BytesIO(contents))
                result = model_service.predict(image)
                
                results.append({
                    "filename": file.filename,
                    "prediction": result
                })
                
            except Exception as e:
                errors.append({
                    "filename": file.filename,
                    "error": str(e)
                })
        
        return JSONResponse(content={
            "success": True,
            "total": len(files),
            "successful": len(results),
            "failed": len(errors),
            "results": results,
            "errors": errors
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during batch prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")


@router.get("/model-info")
async def get_model_info():
    """
    Get information about the loaded model
    
    Returns:
        JSON response with model information
    """
    try:
        info = model_service.get_model_info()
        return JSONResponse(content={
            "success": True,
            "data": info
        })
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
