# 🚀 Deployment Guide - Render + GitHub Actions

This guide will help you deploy the Brain Tumor Detection application to Render with automatic deployments via GitHub Actions.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Render Deployment](#render-deployment)
4. [GitHub Actions Setup](#github-actions-setup)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

- **GitHub Account**: Repository for your code
- **Render Account**: Sign up at [render.com](https://render.com)
- **Git**: Installed on your local machine
- **Node.js**: v16+ for frontend
- **Python**: 3.11+ for backend

---

## 💻 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/brain_tumor.git
cd brain_tumor
```

### 2. Backend Setup (Local)

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your local settings
# MODEL_PATH should point to ../model/final_brain_tumor_model_97.keras

# Run backend
python main.py
```

Backend will run on `http://localhost:8000`

### 3. Frontend Setup (Local)

```bash
cd frontend

# Install dependencies
npm install

# Create local environment file
echo "VITE_API_URL=http://localhost:8000" > .env

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3000` or `http://localhost:5173`

---

## ☁️ Render Deployment

### Step 1: Prepare Your Repository

1. **Push to GitHub:**

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

2. **Ensure these files exist:**
   - `render.yaml` (Blueprint file)
   - `backend/requirements.txt`
   - `backend/runtime.txt` (Python version)
   - `frontend/package.json`
   - `.github/workflows/deploy.yml`

### Step 2: Deploy Backend on Render

1. **Go to Render Dashboard**: https://dashboard.render.com/

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Backend Service:**
   ```
   Name: brain-tumor-api
   Region: Oregon (US West)
   Branch: main
   Runtime: Python 3
   Build Command: cd backend && pip install --upgrade pip && pip install -r requirements.txt
   Start Command: cd backend && python main.py
   Instance Type: Starter ($7/month) or Free
   ```

4. **Set Environment Variables:**
   
   Go to "Environment" tab and add:
   
   ```
   APP_NAME=Brain Tumor Detection API
   APP_VERSION=1.0.0
   DEBUG=False
   HOST=0.0.0.0
   PORT=10000
   MODEL_PATH=./model/final_brain_tumor_model_97.keras
   MODEL_INPUT_SIZE=224
   CONFIDENCE_THRESHOLD=0.5
   TRAINING_HISTORY_PATH=./model_training_phase/training_history.csv
   TRAINING_HISTORY_2_PATH=./model_training_phase/training_history_2.csv
   MODEL_PREDICTIONS_PATH=./model_training_phase/model_predictions.csv
   TEST_IMAGES_PATH=./image/test_image
   MAX_UPLOAD_SIZE=10485760
   LOG_LEVEL=INFO
   ```

   **Important**: Set `ALLOWED_ORIGINS` after deploying frontend (see Step 3)

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete (~5-10 minutes)
   - Your backend URL will be: `https://brain-tumor-api.onrender.com`

### Step 3: Deploy Frontend on Render

1. **Create New Static Site:**
   - Click "New +" → "Static Site"
   - Connect same GitHub repository

2. **Configure Frontend Service:**
   ```
   Name: brain-tumor-frontend
   Region: Oregon (US West)
   Branch: main
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/dist
   ```

3. **Set Environment Variables:**
   
   Add in "Environment" tab:
   
   ```
   VITE_API_URL=https://brain-tumor-api.onrender.com
   ```
   
   ⚠️ Replace `brain-tumor-api.onrender.com` with your actual backend URL

4. **Configure Redirects:**
   
   Render will use the `render.yaml` configuration for redirects

5. **Deploy:**
   - Click "Create Static Site"
   - Wait for build (~3-5 minutes)
   - Your frontend URL will be: `https://brain-tumor-frontend.onrender.com`

### Step 4: Update CORS Settings

1. **Go back to Backend service**
2. **Update Environment Variables:**
   
   Add your frontend URL to `ALLOWED_ORIGINS`:
   
   ```
   ALLOWED_ORIGINS=["https://brain-tumor-frontend.onrender.com"]
   ```

3. **Manual Deploy:**
   - Click "Manual Deploy" → "Deploy latest commit"

---

## 🤖 GitHub Actions Setup

### Step 1: Get Render Deploy Hook

1. **For Backend:**
   - Go to backend service in Render
   - Settings → Deploy Hook
   - Copy the webhook URL

2. **For Frontend:**
   - Go to frontend static site in Render
   - Settings → Deploy Hook
   - Copy the webhook URL

### Step 2: Add GitHub Secrets

1. **Go to your GitHub repository**
2. **Settings → Secrets and variables → Actions**
3. **Add new repository secret:**
   
   ```
   Name: RENDER_DEPLOY_HOOK_URL
   Value: https://api.render.com/deploy/srv-xxxxx?key=xxxxx
   ```

### Step 3: Enable GitHub Actions

The workflow file `.github/workflows/deploy.yml` is already configured.

It will automatically:
- Trigger on push to `main` or `master` branch
- Call Render deploy hook
- Deploy both backend and frontend

### Step 4: Test Auto-Deploy

```bash
# Make a small change
echo "# Test deployment" >> README.md

# Commit and push
git add .
git commit -m "Test auto-deployment"
git push origin main

# Watch deployment in:
# - GitHub Actions tab
# - Render dashboard
```

---

## 🔐 Environment Configuration

### Backend Environment Variables

| Variable | Local | Production | Description |
|----------|-------|------------|-------------|
| `DEBUG` | `True` | `False` | Debug mode |
| `HOST` | `0.0.0.0` | `0.0.0.0` | Server host |
| `PORT` | `8000` | `10000` | Server port |
| `ALLOWED_ORIGINS` | `["http://localhost:3000"]` | `["https://your-frontend.onrender.com"]` | CORS origins |
| `MODEL_PATH` | `../model/...` | `./model/...` | Model file path |
| `LOG_LEVEL` | `INFO` | `INFO` | Logging level |

### Frontend Environment Variables

| Variable | Local | Production |
|----------|-------|------------|
| `VITE_API_URL` | `http://localhost:8000` | `https://your-backend.onrender.com` |

---

## ✅ Post-Deployment

### 1. Verify Backend

Test health endpoint:

```bash
curl https://brain-tumor-api.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "version": "1.0.0"
}
```

### 2. Verify Frontend

Visit: `https://brain-tumor-frontend.onrender.com`

Check:
- ✅ Homepage loads
- ✅ Navigation works
- ✅ Upload page can select files
- ✅ API connection works

### 3. Test Prediction

1. Go to Predict page
2. Upload a brain MRI image
3. Click "Predict"
4. Verify result appears

### 4. Check API Documentation

Visit: `https://brain-tumor-api.onrender.com/api/docs`

### 5. Monitor Logs

**Render Dashboard:**
- Backend logs: Service → Logs tab
- Frontend logs: Static Site → Logs tab

**GitHub Actions:**
- Repository → Actions tab

---

## 🐛 Troubleshooting

### Issue: Backend fails to start

**Error**: `ModuleNotFoundError` or dependency issues

**Solution**:
```bash
# Update requirements.txt
# Make sure all dependencies are listed with versions

# Example fix:
tensorflow>=2.15.0,<2.16.0
```

### Issue: Model not found

**Error**: `FileNotFoundError: Model file not found`

**Solution**:
1. Check file exists in repository
2. Verify `MODEL_PATH` environment variable
3. Use relative path from backend directory: `./model/final_brain_tumor_model_97.keras`

### Issue: CORS errors

**Error**: `Access-Control-Allow-Origin` error in browser

**Solution**:
1. Update `ALLOWED_ORIGINS` in backend env vars
2. Include your frontend URL exactly: `https://brain-tumor-frontend.onrender.com`
3. Redeploy backend

### Issue: Frontend can't connect to backend

**Error**: `Network Error` or `Connection refused`

**Solution**:
1. Check `VITE_API_URL` in frontend env vars
2. Verify backend is running: `curl https://your-backend.onrender.com/health`
3. Check CORS settings
4. Rebuild frontend after changing env vars

### Issue: Slow first request

**Symptom**: Backend takes 30-60 seconds to respond first time

**Cause**: Render free tier spins down after inactivity

**Solutions**:
- Upgrade to paid plan (Starter $7/month for 24/7 uptime)
- Use external monitoring service to ping every 14 minutes
- Accept 30s cold start on free tier

### Issue: Build timeout

**Error**: Build exceeds 15-minute limit

**Solution**:
1. Reduce dependency versions
2. Use binary wheels when available
3. Cache build dependencies (Render does this automatically)

### Issue: Out of memory

**Error**: `Killed` or `MemoryError`

**Solution**:
1. Upgrade instance type (Starter: 512MB → Standard: 2GB)
2. Optimize model loading
3. Use model quantization if possible

---

## 📊 Monitoring & Maintenance

### Health Checks

Render automatically monitors:
- `/health` endpoint every 30 seconds
- Auto-restart if unhealthy

### Custom Monitoring

Add external monitoring with:
- **UptimeRobot**: Free, pings every 5 minutes
- **Pingdom**: More features, paid
- **StatusCake**: Free tier available

### Logs

View logs in real-time:
```bash
# Use Render CLI (optional)
render logs -s brain-tumor-api
```

### Performance

Monitor in Render dashboard:
- CPU usage
- Memory usage
- Response times
- Error rates

---

## 🔄 Update Deployment

### Method 1: Git Push (Automatic)

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# GitHub Actions will automatically deploy
```

### Method 2: Manual Deploy

Render Dashboard:
1. Go to service
2. Click "Manual Deploy"
3. Select "Deploy latest commit"

### Method 3: Rollback

Render Dashboard:
1. Go to service
2. Click "Rollback" tab
3. Select previous deployment

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain

1. **Render Dashboard:**
   - Go to frontend static site
   - Settings → Custom Domain
   - Add domain: `www.yourdomain.com`

2. **DNS Configuration:**
   
   Add CNAME record:
   ```
   Type: CNAME
   Name: www
   Value: brain-tumor-frontend.onrender.com
   ```

3. **SSL Certificate:**
   - Render automatically provisions Let's Encrypt SSL
   - Wait 5-10 minutes for activation

4. **Update CORS:**
   
   Add domain to backend `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=["https://www.yourdomain.com", "https://brain-tumor-frontend.onrender.com"]
   ```

---

## 💰 Cost Estimation

### Free Tier

- **Backend**: Free (spins down after 15 min inactivity)
- **Frontend**: Free (static site)
- **Total**: $0/month

### Paid Tier (24/7 Uptime)

- **Backend**: Starter ($7/month) or Standard ($15/month)
- **Frontend**: Free (static site)
- **Total**: $7-15/month

### Recommended for Production

- **Backend**: Standard ($15/month) - 2GB RAM, good for ML models
- **Frontend**: Free
- **Database** (if needed): Starter ($7/month)
- **Total**: $15-22/month

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)

---

## 🆘 Support

If you encounter issues:

1. Check Render logs
2. Check GitHub Actions logs
3. Review this troubleshooting guide
4. Open GitHub issue with:
   - Error message
   - Logs
   - Steps to reproduce

---

**🎉 Congratulations!** Your Brain Tumor Detection app is now live on Render with automatic deployments!
