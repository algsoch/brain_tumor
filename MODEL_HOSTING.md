# Model File Hosting Solutions (FREE Tier)

## ❌ Problem
Your model file (`final_brain_tumor_model_97.keras`, ~2GB) is too large for Git and wasn't uploaded to GitHub, causing deployment to fail:
```
FileNotFoundError: Model file not found: /opt/render/project/src/backend/model/final_brain_tumor_model_97.keras
```

## ✅ Solution: Host Model on Google Drive (FREE)

### Step 1: Upload Model to Google Drive

1. Go to https://drive.google.com
2. Upload `model/final_brain_tumor_model_97.keras`
3. Right-click → "Get link" → Set to "Anyone with the link"
4. Copy the shareable link (looks like: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`)
5. Extract the FILE_ID from the URL

**Example:**
- Link: `https://drive.google.com/file/d/1ABC123xyz789/view?usp=sharing`
- FILE_ID: `1ABC123xyz789`

### Step 2: Update Backend Code

The backend will download the model on startup if it doesn't exist locally.

**Edit `backend/services/model_service.py`:**

```python
import gdown
import os
from pathlib import Path

class ModelService:
    def __init__(self):
        self.model = None
        self.model_path = Path(__file__).parent.parent / "model" / "final_brain_tumor_model_97.keras"
        
        # Google Drive file ID (get from shareable link)
        self.gdrive_file_id = os.getenv("MODEL_GDRIVE_ID", "YOUR_FILE_ID_HERE")
        self.gdrive_url = f"https://drive.google.com/uc?id={self.gdrive_file_id}"
    
    def download_model_if_needed(self):
        """Download model from Google Drive if not present"""
        if not self.model_path.exists():
            logger.info(f"Model not found locally. Downloading from Google Drive...")
            self.model_path.parent.mkdir(parents=True, exist_ok=True)
            
            try:
                gdown.download(self.gdrive_url, str(self.model_path), quiet=False)
                logger.info("Model downloaded successfully!")
            except Exception as e:
                logger.error(f"Failed to download model: {e}")
                raise
    
    def load_model(self):
        """Load the model from disk"""
        self.download_model_if_needed()  # Download first if needed
        
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        
        logger.info(f"Loading model from: {self.model_path}")
        self.model = tf.keras.models.load_model(str(self.model_path))
        logger.info("Model loaded successfully!")
```

### Step 3: Add gdown to Requirements

**Edit `backend/requirements.txt`**, add:
```
gdown==4.7.1
```

### Step 4: Add Environment Variable to Render

In Render dashboard → Environment:
```
MODEL_GDRIVE_ID = YOUR_FILE_ID_HERE
```

### Step 5: Redeploy

```bash
git add backend/services/model_service.py backend/requirements.txt
git commit -m "Add Google Drive model download support"
git push origin main
```

Render will auto-deploy and download the model on first startup.

---

## 🎯 Alternative FREE Solutions

### Option 2: Hugging Face Hub (FREE, Recommended for ML)

```bash
pip install huggingface-hub
```

```python
from huggingface_hub import hf_hub_download

# Upload model to HuggingFace
# Then download in code:
model_path = hf_hub_download(
    repo_id="your-username/brain-tumor-model",
    filename="final_brain_tumor_model_97.keras"
)
```

### Option 3: AWS S3 (FREE Tier - 5GB)

```python
import boto3

s3 = boto3.client('s3')
s3.download_file('your-bucket', 'model.keras', '/tmp/model.keras')
```

### Option 4: Dropbox (FREE - 2GB)

```python
import requests

# Get direct download link from Dropbox
url = "https://www.dropbox.com/s/YOUR_ID/model.keras?dl=1"
response = requests.get(url)
with open("model.keras", "wb") as f:
    f.write(response.content)
```

---

## 📊 Comparison

| Solution | Storage | Speed | Setup Difficulty |
|----------|---------|-------|------------------|
| Google Drive | Unlimited FREE | Medium | Easy |
| Hugging Face | Unlimited FREE | Fast | Easy |
| AWS S3 | 5GB FREE | Fast | Medium |
| Dropbox | 2GB FREE | Medium | Easy |

---

## ⚡ Quick Fix (5 Minutes)

1. **Upload to Google Drive** (2 min)
2. **Get FILE_ID** from shareable link (1 min)
3. **Copy code below** and paste in `backend/services/model_service.py` (1 min)
4. **Add to Render env**: `MODEL_GDRIVE_ID=YOUR_ID` (1 min)

**Done!** Model will auto-download on deploy.

---

## 🔍 Verify Model Upload Status

Check if model is in your repo:
```bash
ls -lh model/
git ls-files model/
```

If empty → Model wasn't committed (too large for Git)

---

## 💾 Model Size Optimization (Future)

If 2GB is too large:
- Quantize model (TensorFlow Lite)
- Use model pruning
- Convert to ONNX format
- Compress with `gzip`

Would reduce size to ~500MB-1GB.
