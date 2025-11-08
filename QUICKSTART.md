# 🚀 Quick Start Guide

Get your Brain Tumor Detection system running in minutes!

## 📝 Pre-Deployment Checklist

### 1. Local Setup ✅

- [ ] Python 3.11+ installed (`python3 --version`)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] Git installed (`git --version`)
- [ ] Clone repository
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Model file exists at `model/final_brain_tumor_model_97.keras`
- [ ] Test images available in `image/` folder

### 2. GitHub Repository ✅

- [ ] Create new repository on GitHub
- [ ] Push code to GitHub
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/brain_tumor.git
  git push -u origin main
  ```

### 3. Render Account Setup ✅

- [ ] Sign up at [render.com](https://render.com)
- [ ] Connect GitHub account to Render
- [ ] Authorize Render to access your repository

---

## 🌐 Cloud Deployment (Render)

### Step 1: Deploy Backend API

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com/

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Select "Build and deploy from a Git repository"
   - Click "Connect GitHub" if not already connected
   - Find and select your `brain_tumor` repository
   - Click "Connect"

3. **Configure Service**
   ```
   Name:           brain-tumor-api
   Region:         Oregon (US West) - or closest to you
   Branch:         main
   Root Directory: (leave empty)
   Runtime:        Python 3
   Build Command:  cd backend && pip install --upgrade pip && pip install -r requirements.txt
   Start Command:  cd backend && python main.py
   Instance Type:  Free (or Starter for 24/7 uptime)
   ```

4. **Add Environment Variables**
   
   Click "Advanced" → "Add Environment Variable" for each:
   
   | Key | Value |
   |-----|-------|
   | `APP_NAME` | `Brain Tumor Detection API` |
   | `APP_VERSION` | `1.0.0` |
   | `DEBUG` | `False` |
   | `HOST` | `0.0.0.0` |
   | `PORT` | `10000` |
   | `MODEL_PATH` | `./model/final_brain_tumor_model_97.keras` |
   | `MODEL_INPUT_SIZE` | `224` |
   | `CONFIDENCE_THRESHOLD` | `0.5` |
   | `TRAINING_HISTORY_PATH` | `./model_training_phase/training_history.csv` |
   | `TRAINING_HISTORY_2_PATH` | `./model_training_phase/training_history_2.csv` |
   | `MODEL_PREDICTIONS_PATH` | `./model_training_phase/model_predictions.csv` |
   | `TEST_IMAGES_PATH` | `./image/test_image` |
   | `MAX_UPLOAD_SIZE` | `10485760` |
   | `LOG_LEVEL` | `INFO` |
   
   **Note**: Leave `ALLOWED_ORIGINS` empty for now. We'll add it after deploying frontend.

5. **Deploy Backend**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Note your backend URL: `https://brain-tumor-api-XXXX.onrender.com`
   - Test health endpoint: `https://your-backend-url.onrender.com/health`

### Step 2: Deploy Frontend

1. **Create New Static Site**
   - Go back to Render Dashboard
   - Click "New +" → "Static Site"
   - Select same GitHub repository
   - Click "Connect"

2. **Configure Static Site**
   ```
   Name:               brain-tumor-frontend
   Region:             Oregon (US West)
   Branch:             main
   Root Directory:     (leave empty)
   Build Command:      cd frontend && npm install && npm run build
   Publish Directory:  frontend/dist
   Auto-Deploy:        Yes
   ```

3. **Add Environment Variable**
   
   Click "Advanced" → "Add Environment Variable":
   
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://brain-tumor-api-XXXX.onrender.com` |
   
   ⚠️ **Important**: Replace with your actual backend URL from Step 1

4. **Deploy Frontend**
   - Click "Create Static Site"
   - Wait 3-5 minutes for deployment
   - Note your frontend URL: `https://brain-tumor-frontend-XXXX.onrender.com`

### Step 3: Update CORS Settings

1. **Go back to Backend Service**
   - Render Dashboard → Select your backend service
   - Click "Environment" tab
   - Click "Add Environment Variable"

2. **Add ALLOWED_ORIGINS**
   
   | Key | Value |
   |-----|-------|
   | `ALLOWED_ORIGINS` | `["https://brain-tumor-frontend-XXXX.onrender.com"]` |
   
   ⚠️ **Important**: 
   - Replace with your actual frontend URL
   - Keep the brackets and quotes
   - Use exact URL (no trailing slash)

3. **Redeploy Backend**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait 2-3 minutes

### Step 4: Verify Deployment ✅

1. **Test Backend**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```
   Expected: `{"status":"healthy","model_loaded":true,"version":"1.0.0"}`

2. **Test Frontend**
   - Open: `https://your-frontend-url.onrender.com`
   - Navigate through pages
   - Test image upload and prediction

3. **Test API Documentation**
   - Visit: `https://your-backend-url.onrender.com/api/docs`
   - Try "GET /health" endpoint
   - Try "POST /api/predict/" endpoint

---

## 🤖 GitHub Actions Auto-Deploy

### Step 1: Get Deploy Hooks

1. **Backend Deploy Hook**
   - Render Dashboard → Backend Service
   - Settings → "Deploy Hook"
   - Click "Create Deploy Hook"
   - Copy the webhook URL
   - Example: `https://api.render.com/deploy/srv-xxxxx?key=xxxxx`

2. **Frontend Deploy Hook**
   - Render Dashboard → Frontend Static Site
   - Settings → "Deploy Hook"
   - Click "Create Deploy Hook"
   - Copy the webhook URL

### Step 2: Add GitHub Secrets

1. **Go to GitHub Repository**
   - Navigate to your repository
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"

2. **Add Deploy Hook**
   ```
   Name:  RENDER_DEPLOY_HOOK_URL
   Value: https://api.render.com/deploy/srv-xxxxx?key=xxxxx
   ```
   (Use the backend deploy hook URL)

3. **Save Secret**
   - Click "Add secret"

### Step 3: Test Auto-Deploy

1. **Make a Test Change**
   ```bash
   # Edit README or any file
   echo "# Test auto-deploy" >> QUICKSTART.md
   
   # Commit and push
   git add .
   git commit -m "Test: GitHub Actions auto-deploy"
   git push origin main
   ```

2. **Monitor Deployment**
   - GitHub: Repository → Actions tab
   - See workflow running
   - Render: Dashboard → Events tab
   - See deployment triggered

3. **Verify**
   - Wait 5-10 minutes
   - Check if changes are live

---

## 💻 Local Development

### Quick Start (One Command)

```bash
# Make script executable (first time only)
chmod +x start.sh

# Start both servers
./start.sh
```

This will:
- ✅ Check Python and Node.js
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Start backend on port 8000
- ✅ Start frontend on port 5173
- ✅ Open your browser

### Stop Servers

```bash
# Stop all servers
./stop.sh

# Or press Ctrl+C in terminal running start.sh
```

### Manual Start

**Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🔧 Common Issues & Solutions

### Issue: Backend fails to start

**Symptom**: `ModuleNotFoundError` or import errors

**Solution**:
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: Model not found

**Symptom**: `FileNotFoundError: Model file not found`

**Solution**:
1. Check model exists: `ls -la model/final_brain_tumor_model_97.keras`
2. Verify path in `.env`: `MODEL_PATH=./model/final_brain_tumor_model_97.keras`
3. For Render, ensure model is committed to git (not in `.gitignore`)

### Issue: CORS errors in browser

**Symptom**: `Access-Control-Allow-Origin` error

**Solution**:
1. Check backend `ALLOWED_ORIGINS` includes frontend URL
2. Exact match required (no trailing slash)
3. Redeploy backend after changing

### Issue: Frontend can't connect to backend

**Symptom**: "Network Error" in browser console

**Solution**:
1. Check `VITE_API_URL` in frontend environment
2. Verify backend is running: `curl https://your-backend.onrender.com/health`
3. Check browser console for exact error
4. Rebuild frontend after changing env vars

### Issue: Slow cold starts on Render free tier

**Symptom**: First request takes 30-60 seconds

**Solution**:
- **Expected behavior** on free tier (spins down after 15 min)
- **Option 1**: Upgrade to Starter ($7/month) for 24/7 uptime
- **Option 2**: Use UptimeRobot to ping every 14 minutes
- **Option 3**: Accept cold starts (subsequent requests are fast)

---

## 📊 Next Steps

After successful deployment:

### 1. Custom Domain (Optional)

1. **Add domain in Render**
   - Static Site → Settings → Custom Domain
   - Add: `www.yourdomain.com`

2. **Update DNS**
   ```
   Type:  CNAME
   Name:  www
   Value: brain-tumor-frontend.onrender.com
   TTL:   Auto
   ```

3. **Update CORS**
   - Add domain to backend `ALLOWED_ORIGINS`
   - Redeploy backend

### 2. Monitoring Setup

1. **UptimeRobot** (Free)
   - Create monitor for: `https://your-backend.onrender.com/health`
   - Check interval: 5 minutes
   - Get alerts via email

2. **Google Analytics** (Optional)
   - Add tracking code to `frontend/index.html`
   - Monitor user traffic and behavior

### 3. Security Enhancements

1. **Enable API Key Protection**
   - Uncomment API key middleware in backend
   - Generate secure API keys
   - Distribute to authorized users

2. **Rate Limiting**
   - Configure in `backend/config.py`
   - Prevent API abuse

3. **HTTPS Only**
   - Render provides free SSL automatically
   - Ensure all URLs use `https://`

---

## 🎉 Success!

Your Brain Tumor Detection system is now live!

**URLs to save:**
- 🌐 **Frontend**: `https://your-frontend.onrender.com`
- 🔌 **Backend API**: `https://your-backend.onrender.com`
- 📚 **API Docs**: `https://your-backend.onrender.com/api/docs`

**Share your project:**
- Update README badges with your URLs
- Add screenshots
- Write a blog post about your ML project
- Share on LinkedIn, Twitter, etc.

---

## 📚 Additional Resources

- [Complete Deployment Guide](DEPLOYMENT.md) - Detailed instructions
- [README.md](README.md) - Full project documentation
- [Render Documentation](https://render.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)

---

**Need help?** Open an issue on GitHub or check the troubleshooting section above.
