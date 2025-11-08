"""
Data Service - Handles CSV data and metrics processing
"""
import logging
from typing import Dict, List, Optional
from pathlib import Path
import pandas as pd
import numpy as np

from config import settings

logger = logging.getLogger(__name__)


class DataService:
    """Service for handling training history and prediction data"""
    
    def __init__(self):
        self.training_history_df = None
        self.training_history_2_df = None
        self.predictions_df = None
    
    def load_training_history(self) -> pd.DataFrame:
        """Load training history CSV"""
        try:
            path = settings.get_absolute_path(settings.training_history_path)
            logger.info(f"Loading training history from: {path}")
            
            if not path.exists():
                logger.warning(f"Training history file not found: {path}")
                return pd.DataFrame()
            
            self.training_history_df = pd.read_csv(path)
            return self.training_history_df
            
        except Exception as e:
            logger.error(f"Error loading training history: {str(e)}")
            raise
    
    def load_training_history_2(self) -> pd.DataFrame:
        """Load second training history CSV"""
        try:
            path = settings.get_absolute_path(settings.training_history_2_path)
            logger.info(f"Loading training history 2 from: {path}")
            
            if not path.exists():
                logger.warning(f"Training history 2 file not found: {path}")
                return pd.DataFrame()
            
            self.training_history_2_df = pd.read_csv(path)
            return self.training_history_2_df
            
        except Exception as e:
            logger.error(f"Error loading training history 2: {str(e)}")
            raise
    
    def load_predictions(self) -> pd.DataFrame:
        """Load model predictions CSV"""
        try:
            path = settings.get_absolute_path(settings.model_predictions_path)
            logger.info(f"Loading predictions from: {path}")
            
            if not path.exists():
                logger.warning(f"Predictions file not found: {path}")
                return pd.DataFrame()
            
            self.predictions_df = pd.read_csv(path)
            return self.predictions_df
            
        except Exception as e:
            logger.error(f"Error loading predictions: {str(e)}")
            raise
    
    def get_training_metrics(self) -> Dict[str, any]:
        """
        Get comprehensive training metrics from both history files
        
        Returns:
            Dictionary containing all training metrics
        """
        try:
            if self.training_history_df is None:
                self.load_training_history()
            
            if self.training_history_2_df is None:
                self.load_training_history_2()
            
            # Combine both history files
            combined_df = pd.concat([
                self.training_history_df,
                self.training_history_2_df
            ], ignore_index=True)
            
            metrics = {
                "epochs": len(combined_df),
                "final_metrics": {
                    "accuracy": float(combined_df['accuracy'].iloc[-1]),
                    "val_accuracy": float(combined_df['val_accuracy'].iloc[-1]),
                    "loss": float(combined_df['loss'].iloc[-1]),
                    "val_loss": float(combined_df['val_loss'].iloc[-1]),
                    "auc": float(combined_df['auc'].iloc[-1]),
                    "val_auc": float(combined_df['val_auc'].iloc[-1]),
                    "precision": float(combined_df['precision'].iloc[-1]),
                    "val_precision": float(combined_df['val_precision'].iloc[-1]),
                    "recall": float(combined_df['recall'].iloc[-1]),
                    "val_recall": float(combined_df['val_recall'].iloc[-1])
                },
                "history": {
                    "epoch": list(range(1, len(combined_df) + 1)),
                    "accuracy": combined_df['accuracy'].tolist(),
                    "val_accuracy": combined_df['val_accuracy'].tolist(),
                    "loss": combined_df['loss'].tolist(),
                    "val_loss": combined_df['val_loss'].tolist(),
                    "auc": combined_df['auc'].tolist(),
                    "val_auc": combined_df['val_auc'].tolist(),
                    "precision": combined_df['precision'].tolist(),
                    "val_precision": combined_df['val_precision'].tolist(),
                    "recall": combined_df['recall'].tolist(),
                    "val_recall": combined_df['val_recall'].tolist(),
                    "learning_rate": combined_df['learning_rate'].tolist()
                },
                "best_metrics": {
                    "best_accuracy": float(combined_df['val_accuracy'].max()),
                    "best_accuracy_epoch": int(combined_df['val_accuracy'].idxmax() + 1),
                    "best_auc": float(combined_df['val_auc'].max()),
                    "best_auc_epoch": int(combined_df['val_auc'].idxmax() + 1),
                    "lowest_loss": float(combined_df['val_loss'].min()),
                    "lowest_loss_epoch": int(combined_df['val_loss'].idxmin() + 1)
                }
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting training metrics: {str(e)}")
            raise
    
    def get_predictions_summary(self) -> Dict[str, any]:
        """Get summary of model predictions"""
        try:
            if self.predictions_df is None:
                self.load_predictions()
            
            if self.predictions_df.empty:
                return {"message": "No predictions available"}
            
            # Calculate statistics
            summary = {
                "total_predictions": len(self.predictions_df),
                "columns": self.predictions_df.columns.tolist(),
                "sample_data": self.predictions_df.to_dict(orient='records')  # Return all data instead of just head(10)
            }
            
            # Add class distribution if available
            if 'prediction' in self.predictions_df.columns:
                summary['class_distribution'] = self.predictions_df['prediction'].value_counts().to_dict()
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting predictions summary: {str(e)}")
            raise
    
    def get_confusion_matrix_data(self) -> Dict[str, any]:
        """
        Calculate confusion matrix from predictions
        
        Returns:
            Dictionary containing confusion matrix data and statistics
        """
        try:
            if self.predictions_df is None:
                self.load_predictions()
            
            if self.predictions_df.empty:
                return {"message": "No predictions available for confusion matrix"}
            
            # Check actual column names in the CSV
            # Expected columns: class_id (true), predicted_class, correct
            if 'class_id' not in self.predictions_df.columns or 'predicted_class' not in self.predictions_df.columns:
                logger.warning(f"Available columns: {self.predictions_df.columns.tolist()}")
                return {
                    "message": "Predictions file missing required columns",
                    "available_columns": self.predictions_df.columns.tolist()
                }
            
            from sklearn.metrics import confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
            
            y_true = self.predictions_df['class_id']
            y_pred = self.predictions_df['predicted_class']
            
            # Calculate confusion matrix
            # Format: [[TN, FP], [FN, TP]] for binary classification
            cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
            
            # Calculate metrics
            accuracy = accuracy_score(y_true, y_pred)
            precision = precision_score(y_true, y_pred, zero_division=0)
            recall = recall_score(y_true, y_pred, zero_division=0)
            f1 = f1_score(y_true, y_pred, zero_division=0)
            
            result = {
                "confusion_matrix": cm.tolist(),
                "labels": ["Healthy", "Tumor"],
                "statistics": {
                    "accuracy": float(accuracy),
                    "precision": float(precision),
                    "recall": float(recall),
                    "f1_score": float(f1),
                    "total_samples": len(y_true),
                    "correct_predictions": int((y_true == y_pred).sum()),
                    "incorrect_predictions": int((y_true != y_pred).sum())
                },
                "breakdown": {
                    "true_negatives": int(cm[0][0]),
                    "false_positives": int(cm[0][1]),
                    "false_negatives": int(cm[1][0]),
                    "true_positives": int(cm[1][1])
                }
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error calculating confusion matrix: {str(e)}", exc_info=True)
            return {"error": str(e)}


# Global data service instance
data_service = DataService()
