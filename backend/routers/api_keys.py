"""
API Keys Router - Handles API key generation and validation
"""
import logging
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict
from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json
from pathlib import Path

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/keys", tags=["api-keys"])

# Simple in-memory storage (in production, use a database)
API_KEYS_FILE = Path("api_keys.json")
api_keys_store: Dict[str, dict] = {}


def load_api_keys():
    """Load API keys from file"""
    global api_keys_store
    if API_KEYS_FILE.exists():
        try:
            with open(API_KEYS_FILE, 'r') as f:
                api_keys_store = json.load(f)
        except Exception as e:
            logger.error(f"Error loading API keys: {e}")
            api_keys_store = {}
    else:
        api_keys_store = {}


def save_api_keys():
    """Save API keys to file"""
    try:
        with open(API_KEYS_FILE, 'w') as f:
            json.dump(api_keys_store, f, indent=2, default=str)
    except Exception as e:
        logger.error(f"Error saving API keys: {e}")


# Load keys on startup
load_api_keys()


class APIKeyRequest(BaseModel):
    name: Optional[str] = "My API Key"
    description: Optional[str] = None
    expires_in_days: Optional[int] = 365


class APIKeyResponse(BaseModel):
    api_key: str
    name: str
    description: Optional[str]
    created_at: str
    expires_at: Optional[str]
    usage_count: int


def generate_api_key() -> str:
    """Generate a secure API key"""
    return f"btd_{secrets.token_urlsafe(32)}"


def hash_api_key(api_key: str) -> str:
    """Hash API key for storage"""
    return hashlib.sha256(api_key.encode()).hexdigest()


async def validate_api_key(x_api_key: Optional[str] = Header(None)) -> dict:
    """Validate API key from header"""
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    key_hash = hash_api_key(x_api_key)
    if key_hash not in api_keys_store:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    key_data = api_keys_store[key_hash]
    
    # Check if expired
    if key_data.get('expires_at'):
        expires_at = datetime.fromisoformat(key_data['expires_at'])
        if datetime.now() > expires_at:
            raise HTTPException(status_code=401, detail="API key expired")
    
    # Increment usage count
    key_data['usage_count'] = key_data.get('usage_count', 0) + 1
    save_api_keys()
    
    return key_data


@router.post("/generate")
async def generate_new_api_key(request: APIKeyRequest):
    """
    Generate a new API key
    
    Args:
        request: API key generation parameters
        
    Returns:
        JSON response with new API key
    """
    try:
        # Generate new key
        api_key = generate_api_key()
        key_hash = hash_api_key(api_key)
        
        # Calculate expiration
        expires_at = None
        if request.expires_in_days:
            expires_at = datetime.now() + timedelta(days=request.expires_in_days)
        
        # Store key metadata
        key_data = {
            "name": request.name,
            "description": request.description,
            "created_at": datetime.now().isoformat(),
            "expires_at": expires_at.isoformat() if expires_at else None,
            "usage_count": 0
        }
        
        api_keys_store[key_hash] = key_data
        save_api_keys()
        
        return JSONResponse(content={
            "success": True,
            "data": {
                "api_key": api_key,
                "name": request.name,
                "description": request.description,
                "created_at": key_data["created_at"],
                "expires_at": key_data["expires_at"],
                "usage_count": 0,
                "message": "API key generated successfully. Please save it securely - it cannot be retrieved again."
            }
        })
        
    except Exception as e:
        logger.error(f"Error generating API key: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/validate")
async def validate_key(key_data: dict = Depends(validate_api_key)):
    """
    Validate an API key
    
    Returns:
        JSON response with key validation status
    """
    return JSONResponse(content={
        "success": True,
        "data": {
            "valid": True,
            "name": key_data.get("name"),
            "usage_count": key_data.get("usage_count", 0),
            "created_at": key_data.get("created_at"),
            "expires_at": key_data.get("expires_at")
        }
    })


@router.get("/stats")
async def get_api_stats(key_data: dict = Depends(validate_api_key)):
    """
    Get API key usage statistics
    
    Returns:
        JSON response with usage stats
    """
    return JSONResponse(content={
        "success": True,
        "data": {
            "name": key_data.get("name"),
            "usage_count": key_data.get("usage_count", 0),
            "created_at": key_data.get("created_at"),
            "expires_at": key_data.get("expires_at"),
            "description": key_data.get("description")
        }
    })


@router.get("/list")
async def list_api_keys():
    """
    List all API keys (without revealing the actual keys)
    
    Returns:
        JSON response with list of API keys
    """
    try:
        keys_list = []
        for key_hash, key_data in api_keys_store.items():
            keys_list.append({
                "name": key_data.get("name"),
                "created_at": key_data.get("created_at"),
                "expires_at": key_data.get("expires_at"),
                "usage_count": key_data.get("usage_count", 0),
                "key_preview": f"btd_...{key_hash[:8]}"
            })
        
        return JSONResponse(content={
            "success": True,
            "data": {
                "total_keys": len(keys_list),
                "keys": keys_list
            }
        })
        
    except Exception as e:
        logger.error(f"Error listing API keys: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
