"""
Precomputed Predictions Router - Serves pre-analyzed predictions from CSV
"""
import logging
import pandas as pd
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/precomputed", tags=["precomputed"])


def load_predictions_csv():
    """Load and process the model predictions CSV file"""
    try:
        csv_path = settings.get_absolute_path(settings.model_predictions_path)
        
        if not csv_path.exists():
            logger.error(f"Predictions CSV not found: {csv_path}")
            return None
        
        # Load CSV
        df = pd.read_csv(csv_path)
        
        # Extract filename from filepath
        df['filename'] = df['filepath'].apply(lambda x: Path(x).name)
        
        # Convert to list of dicts
        predictions = []
        for _, row in df.iterrows():
            # Determine prediction label based on predicted_class
            pred_label = 'tumor' if row['predicted_class'] == 1 else 'healthy'
            
            # Convert confidence to percentage (multiply by 100)
            confidence_pct = row['confidence'] * 100
            
            predictions.append({
                'filename': row['filename'],
                'label': row['label'],
                'prediction': pred_label,
                'confidence': round(confidence_pct, 2),
                'isCorrect': row['correct'],
                'class_id': int(row['class_id']),
                'predicted_class': int(row['predicted_class'])
            })
        
        logger.info(f"Loaded {len(predictions)} predictions from CSV")
        return predictions
        
    except Exception as e:
        logger.error(f"Error loading predictions CSV: {str(e)}")
        return None


@router.get("/predictions")
async def get_precomputed_predictions(limit: int = None):
    """
    Get precomputed predictions from CSV file, filtered to only include
    images that actually exist in the test images directory
    
    Args:
        limit: Optional limit on number of results
        
    Returns:
        JSON response with precomputed predictions
    """
    try:
        predictions = load_predictions_csv()
        
        if predictions is None:
            raise HTTPException(
                status_code=500, 
                detail="Failed to load precomputed predictions"
            )
        
        # Get available image files
        test_images_path = settings.get_absolute_path(settings.test_images_path)
        available_files = set()
        for ext in ['.jpg', '.jpeg', '.png', '.bmp']:
            available_files.update([f.name for f in test_images_path.glob(f"**/*{ext}")])
            available_files.update([f.name for f in test_images_path.glob(f"**/*{ext.upper()}")])
        
        logger.info(f"Found {len(available_files)} available image files")
        
        # Filter predictions to only include files that exist
        filtered_predictions = [p for p in predictions if p['filename'] in available_files]
        logger.info(f"Filtered to {len(filtered_predictions)} predictions with matching files")
        
        # Apply limit if specified
        if limit:
            filtered_predictions = filtered_predictions[:limit]
        
        # Separate into correct and incorrect
        correct = [p for p in filtered_predictions if p['isCorrect']]
        incorrect = [p for p in filtered_predictions if not p['isCorrect']]
        
        logger.info(f"Returning {len(correct)} correct and {len(incorrect)} incorrect predictions")
        
        return JSONResponse(content={
            "success": True,
            "data": {
                "total": len(filtered_predictions),
                "correct_count": len(correct),
                "incorrect_count": len(incorrect),
                "accuracy": round((len(correct) / len(filtered_predictions)) * 100, 2) if filtered_predictions else 0,
                "predictions": filtered_predictions,
                "correct": correct,  # Return ALL matching correct predictions
                "incorrect": incorrect  # Return ALL matching incorrect predictions
            }
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting precomputed predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predictions/by-filename/{filename}")
async def get_prediction_by_filename(filename: str):
    """
    Get prediction for a specific filename
    
    Args:
        filename: Image filename
        
    Returns:
        JSON response with prediction data
    """
    try:
        predictions = load_predictions_csv()
        
        if predictions is None:
            raise HTTPException(
                status_code=500, 
                detail="Failed to load precomputed predictions"
            )
        
        # Find prediction by filename
        pred = next((p for p in predictions if p['filename'] == filename), None)
        
        if pred is None:
            raise HTTPException(
                status_code=404, 
                detail=f"Prediction not found for filename: {filename}"
            )
        
        return JSONResponse(content={
            "success": True,
            "data": pred
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting prediction by filename: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_prediction_stats():
    """
    Get statistics about precomputed predictions
    
    Returns:
        JSON response with stats
    """
    try:
        predictions = load_predictions_csv()
        
        if predictions is None:
            raise HTTPException(
                status_code=500, 
                detail="Failed to load precomputed predictions"
            )
        
        correct = [p for p in predictions if p['isCorrect']]
        incorrect = [p for p in predictions if not p['isCorrect']]
        
        # Calculate confidence stats
        all_confidences = [p['confidence'] for p in predictions]
        correct_confidences = [p['confidence'] for p in correct]
        incorrect_confidences = [p['confidence'] for p in incorrect]
        
        return JSONResponse(content={
            "success": True,
            "data": {
                "total_predictions": len(predictions),
                "correct_predictions": len(correct),
                "incorrect_predictions": len(incorrect),
                "accuracy": round((len(correct) / len(predictions)) * 100, 2),
                "avg_confidence": round(sum(all_confidences) / len(all_confidences), 2),
                "avg_correct_confidence": round(sum(correct_confidences) / len(correct_confidences), 2) if correct_confidences else 0,
                "avg_incorrect_confidence": round(sum(incorrect_confidences) / len(incorrect_confidences), 2) if incorrect_confidences else 0
            }
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting prediction stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
