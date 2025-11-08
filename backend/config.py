"""
Configuration module for the Brain Tumor Detection API
Loads environment variables and provides application settings
"""
import os
from typing import List, Union
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    app_name: str = Field(default="Brain Tumor Detection API", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    debug: bool = Field(default=False, alias="DEBUG")
    
    # Server
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    
    # CORS - accepts both string (comma-separated) or list
    allowed_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        alias="ALLOWED_ORIGINS"
    )
    
    @field_validator('allowed_origins', mode='before')
    @classmethod
    def parse_origins(cls, v):
        """Parse ALLOWED_ORIGINS from string or list"""
        if isinstance(v, str):
            # Split by comma and strip whitespace
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    # Model Configuration
    model_path: str = Field(
        default="../model/final_brain_tumor_model_97.keras",
        alias="MODEL_PATH"
    )
    model_input_size: int = Field(default=224, alias="MODEL_INPUT_SIZE")
    confidence_threshold: float = Field(default=0.5, alias="CONFIDENCE_THRESHOLD")
    
    # Data Paths
    training_history_path: str = Field(
        default="../model_training_phase/training_history.csv",
        alias="TRAINING_HISTORY_PATH"
    )
    training_history_2_path: str = Field(
        default="../model_training_phase/training_history_2.csv",
        alias="TRAINING_HISTORY_2_PATH"
    )
    model_predictions_path: str = Field(
        default="../model_training_phase/model_predictions.csv",
        alias="MODEL_PREDICTIONS_PATH"
    )
    test_images_path: str = Field(
        default="../image/test_image",
        alias="TEST_IMAGES_PATH"
    )
    
    # Upload Settings
    max_upload_size: int = Field(default=10485760, alias="MAX_UPLOAD_SIZE")  # 10MB
    allowed_extensions: List[str] = Field(
        default=[".jpg", ".jpeg", ".png"],
        alias="ALLOWED_EXTENSIONS"
    )
    
    # Directories
    upload_dir: str = "uploads"
    temp_dir: str = "temp"
    
    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        
    def get_absolute_path(self, relative_path: str) -> Path:
        """Convert relative path to absolute path from backend directory"""
        base_dir = Path(__file__).parent
        return (base_dir / relative_path).resolve()


# Global settings instance
settings = Settings()

# Create necessary directories
Path(settings.upload_dir).mkdir(exist_ok=True)
Path(settings.temp_dir).mkdir(exist_ok=True)
