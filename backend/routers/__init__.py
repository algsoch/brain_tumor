"""Routers package initialization"""
from .predict import router as predict_router
from .metrics import router as metrics_router
from .gallery import router as gallery_router

__all__ = ['predict_router', 'metrics_router', 'gallery_router']
