"""
Brain Tumor Detection API - Main Application
Production-ready FastAPI application for brain tumor classification
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from config import settings
from routers import predict_router, metrics_router, gallery_router
from routers.api_keys import router as api_keys_router
from routers.precomputed import router as precomputed_router
from services.model_service import model_service

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events
    Load ML model on startup, cleanup on shutdown
    """
    logger.info("Starting Brain Tumor Detection API...")
    logger.info("⚠️  Server will start immediately but predictions unavailable until model loads")
    
    # Start model loading in background to let server bind to port quickly
    import asyncio
    
    async def load_model_task():
        try:
            logger.info("📦 Loading model... (this may take 30-60 seconds)")
            await asyncio.to_thread(model_service.load_model)
            logger.info("✅ Model loaded! Service is now fully operational.")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {str(e)}")
            # Don't raise - let server stay up for debugging
    
    # Start loading in background
    asyncio.create_task(load_model_task())
    logger.info("🚀 Server starting... Model loading in background")
    
    yield
    
    # Cleanup on shutdown
    logger.info("Shutting down Brain Tumor Detection API...")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Production-ready API for brain tumor detection using deep learning",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An error occurred"
        }
    )


# Include routers
app.include_router(predict_router)
app.include_router(metrics_router)
app.include_router(gallery_router)
app.include_router(api_keys_router)
app.include_router(precomputed_router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/api/docs",
        "endpoints": {
            "predict": "/api/predict",
            "metrics": "/api/metrics",
            "gallery": "/api/gallery",
            "api_keys": "/api/keys"
        }
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint - returns 200 immediately but shows model loading status"""
    try:
        # Check if model is loaded
        model_loaded = model_service.model is not None
        
        return {
            "status": "healthy",  # Always healthy so Render accepts the service
            "model_loaded": model_loaded,
            "model_status": "ready" if model_loaded else "loading",
            "version": settings.app_version,
            "message": "Service ready for predictions" if model_loaded else "Model is loading, please wait..."
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )


# API info endpoint
@app.get("/api/info")
async def api_info():
    """Get API configuration information"""
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "model_input_size": settings.model_input_size,
        "confidence_threshold": settings.confidence_threshold,
        "max_upload_size_mb": settings.max_upload_size / (1024 * 1024),
        "allowed_extensions": settings.allowed_extensions,
        "cors_origins": settings.allowed_origins
    }


def main():
    """Run the application"""
    logger.info(f"Starting server on {settings.host}:{settings.port}")
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )


if __name__ == "__main__":
    main()
