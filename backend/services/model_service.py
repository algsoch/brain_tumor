"""
Model Service - Handles ML model loading and predictions
"""
import os
import logging
from typing import Dict, Tuple
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow import keras

from config import settings

logger = logging.getLogger(__name__)


class ModelService:
    """Service for loading and running the brain tumor detection model"""
    
    def __init__(self):
        self.model = None
        self.class_names = ["Healthy", "Tumor"]
        self.input_size = settings.model_input_size
        
    def load_model(self):
        """Load the trained Keras model"""
        try:
            model_path = settings.get_absolute_path(settings.model_path)
            logger.info(f"Loading model from: {model_path}")
            
            if not model_path.exists():
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            self.model = keras.models.load_model(str(model_path))
            logger.info("Model loaded successfully")
            logger.info(f"Model input shape: {self.model.input_shape}")
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def preprocess_image(self, image: Image.Image) -> np.ndarray:
        """
        Preprocess image for model prediction
        
        Args:
            image: PIL Image object
            
        Returns:
            Preprocessed image array ready for prediction
        """
        try:
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize to model input size
            image = image.resize((self.input_size, self.input_size))
            
            # Convert to array and normalize
            img_array = np.array(image) / 255.0
            
            # Add batch dimension
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            raise
    
    def predict(self, image: Image.Image) -> Dict[str, any]:
        """
        Make prediction on an image
        
        Args:
            image: PIL Image object
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            if self.model is None:
                self.load_model()
            
            # Preprocess image
            processed_image = self.preprocess_image(image)
            
            # Make prediction
            predictions = self.model.predict(processed_image, verbose=0)
            
            # Get confidence score (assuming binary classification)
            confidence = float(predictions[0][0])
            
            # Determine class
            predicted_class_idx = 1 if confidence > settings.confidence_threshold else 0
            predicted_class = self.class_names[predicted_class_idx]
            
            # Format confidence score
            if predicted_class_idx == 0:
                confidence_score = 1 - confidence
            else:
                confidence_score = confidence
            
            result = {
                "prediction": predicted_class,
                "confidence": round(confidence_score * 100, 2),
                "raw_output": confidence,
                "threshold": settings.confidence_threshold,
                "all_predictions": {
                    "Healthy": round((1 - confidence) * 100, 2),
                    "Tumor": round(confidence * 100, 2)
                }
            }
            
            logger.info(f"Prediction: {predicted_class} ({confidence_score:.2%})")
            return result
            
        except Exception as e:
            logger.error(f"Error during prediction: {str(e)}")
            raise
    
    def predict_batch(self, images: list) -> list:
        """
        Make predictions on multiple images
        
        Args:
            images: List of PIL Image objects
            
        Returns:
            List of prediction dictionaries
        """
        results = []
        for image in images:
            result = self.predict(image)
            results.append(result)
        return results
    
    def get_model_info(self) -> Dict[str, any]:
        """Get information about the loaded model"""
        if self.model is None:
            self.load_model()
        
        return {
            "input_shape": str(self.model.input_shape),
            "output_shape": str(self.model.output_shape),
            "total_params": int(self.model.count_params()),
            "layers": len(self.model.layers),
            "class_names": self.class_names,
            "confidence_threshold": settings.confidence_threshold
        }


# Global model service instance
model_service = ModelService()
