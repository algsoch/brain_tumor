"""
Metrics Router - Handles training metrics and performance data endpoints
"""
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from pathlib import Path

from services.data_service import data_service
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("/training-history")
async def get_training_history():
    """
    Get complete training history with all metrics
    
    Returns:
        JSON response with training metrics from all epochs
    """
    try:
        metrics = data_service.get_training_metrics()
        
        return JSONResponse(content={
            "success": True,
            "data": metrics
        })
        
    except Exception as e:
        logger.error(f"Error getting training history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predictions-summary")
async def get_predictions_summary():
    """
    Get summary of model predictions
    
    Returns:
        JSON response with prediction statistics
    """
    try:
        summary = data_service.get_predictions_summary()
        
        return JSONResponse(content={
            "success": True,
            "data": summary
        })
        
    except Exception as e:
        logger.error(f"Error getting predictions summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/confusion-matrix")
async def get_confusion_matrix():
    """
    Get confusion matrix data from predictions
    
    Returns:
        JSON response with confusion matrix
    """
    try:
        cm_data = data_service.get_confusion_matrix_data()
        
        return JSONResponse(content={
            "success": True,
            "data": cm_data
        })
        
    except Exception as e:
        logger.error(f"Error getting confusion matrix: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/training-history")
async def download_training_history():
    """
    Download training history CSV file
    
    Returns:
        CSV file download
    """
    try:
        path = settings.get_absolute_path(settings.training_history_path)
        
        if not path.exists():
            raise HTTPException(status_code=404, detail="Training history file not found")
        
        return FileResponse(
            path=str(path),
            filename="training_history.csv",
            media_type="text/csv"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading training history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/training-history-2")
async def download_training_history_2():
    """
    Download second training history CSV file
    
    Returns:
        CSV file download
    """
    try:
        path = settings.get_absolute_path(settings.training_history_2_path)
        
        if not path.exists():
            raise HTTPException(status_code=404, detail="Training history 2 file not found")
        
        return FileResponse(
            path=str(path),
            filename="training_history_2.csv",
            media_type="text/csv"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading training history 2: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/predictions")
async def download_predictions():
    """
    Download model predictions CSV file
    
    Returns:
        CSV file download
    """
    try:
        path = settings.get_absolute_path(settings.model_predictions_path)
        
        if not path.exists():
            raise HTTPException(status_code=404, detail="Predictions file not found")
        
        return FileResponse(
            path=str(path),
            filename="model_predictions.csv",
            media_type="text/csv"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance-summary")
async def get_performance_summary():
    """
    Get comprehensive performance summary
    
    Returns:
        JSON response with key performance metrics
    """
    try:
        metrics = data_service.get_training_metrics()
        
        # Calculate improvement metrics
        initial_val_acc = metrics['history']['val_accuracy'][0]
        final_val_acc = metrics['final_metrics']['val_accuracy']
        improvement = ((final_val_acc - initial_val_acc) / initial_val_acc) * 100
        
        summary = {
            "model_accuracy": f"{final_val_acc * 100:.2f}%",
            "total_epochs": metrics['epochs'],
            "best_validation_accuracy": f"{metrics['best_metrics']['best_accuracy'] * 100:.2f}%",
            "best_auc": f"{metrics['best_metrics']['best_auc']:.4f}",
            "final_precision": f"{metrics['final_metrics']['val_precision'] * 100:.2f}%",
            "final_recall": f"{metrics['final_metrics']['val_recall'] * 100:.2f}%",
            "improvement": f"{improvement:.2f}%",
            "convergence_epoch": metrics['best_metrics']['best_accuracy_epoch']
        }
        
        return JSONResponse(content={
            "success": True,
            "data": summary
        })
        
    except Exception as e:
        logger.error(f"Error getting performance summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/notebook")
async def download_notebook():
    """
    Download Jupyter notebook file
    
    Returns:
        Jupyter notebook file download
    """
    try:
        # Look for notebook in colab_code directory
        notebook_path = settings.base_dir / "colab_code" / "brain_tumor.ipynb"
        
        if not notebook_path.exists():
            raise HTTPException(status_code=404, detail="Notebook file not found")
        
        return FileResponse(
            path=str(notebook_path),
            filename="brain_tumor.ipynb",
            media_type="application/x-ipynb+json"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading notebook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
