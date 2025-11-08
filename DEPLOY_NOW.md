# 🚀 Deploy to Render RIGHT NOW (5 Minutes!)

## ✅ Prerequisites Check

- [ ] You have a GitHub account
- [ ] You have a Render account (free tier is fine!)
- [ ] Your code is ready in `/Users/viclkykumar/project/deep_learning/brain_tumor`

---

## 📤 Step 1: Push to GitHub (2 minutes)

```bash
cd /Users/viclkykumar/project/deep_learning/brain_tumor

# Check what files we have
git status

# Add all files
git add .

# Commit everything
git commit -m "Initial commit: Brain Tumor Detection with Render deployment"

# Push to your GitHub repo
git branch -M main
git remote add origin https://github.com/algsoch/brain_tumor.git
git push -u origin main
```

**✅ Done? Your code is now on GitHub!**

---

## ☁️ Step 2: Deploy with Blueprint (3 minutes)

### 2.1 Go to Render

Open: **https://dashboard.render.com/**

### 2.2 Click "New +" → "Blueprint"

**IMPORTANT**: Click **"Blueprint"**, NOT "Web Service" or "Static Site"!

### 2.3 Connect GitHub Repository

1. Click "Connect GitHub"
2. Find and select: `algsoch/brain_tumor`
3. Click "Connect"

### 2.4 Render Reads Your `render.yaml` 🎉

You'll see TWO services automatically configured:
- ✅ `brain-tumor-api` (Web Service)
- ✅ `brain-tumor-frontend` (Static Site)

### 2.5 Review and Apply

1. **Review the configuration** (already perfect from `render.yaml`)
2. **Click "Apply"**
3. **Wait 5-10 minutes** for both to deploy

---

## 🔧 Step 3: Configure Environment Variables (1 minute)

After deployment completes, you'll have two URLs:

**Example URLs** (yours will be different):
- Backend: `https://brain-tumor-api-abc123.onrender.com`
- Frontend: `https://brain-tumor-frontend-xyz789.onrender.com`

### 3.1 Update Backend CORS

1. Click on **backend service** (`brain-tumor-api`)
2. Go to **"Environment"** tab
3. Find or add: `ALLOWED_ORIGINS`
4. Set value to:
   ```
   ["https://brain-tumor-frontend-xyz789.onrender.com"]
   ```
   ⚠️ Replace with YOUR actual frontend URL!
5. **Save changes**

### 3.2 Update Frontend API URL

1. Click on **frontend service** (`brain-tumor-frontend`)
2. Go to **"Environment"** tab
3. Find or add: `VITE_API_URL`
4. Set value to:
   ```
   https://brain-tumor-api-abc123.onrender.com
   ```
   ⚠️ Replace with YOUR actual backend URL!
5. **Save changes**

### 3.3 Redeploy Both Services

1. Go to **backend service** → Click **"Manual Deploy" → "Deploy latest commit"**
2. Go to **frontend service** → Click **"Manual Deploy" → "Deploy latest commit"**
3. Wait 2-3 minutes

---

## 🎉 Step 4: Test Your Live Application!

### 4.1 Test Backend Health

Open in browser:
```
https://brain-tumor-api-abc123.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "version": "1.0.0"
}
```

### 4.2 Test Frontend

Open in browser:
```
https://brain-tumor-frontend-xyz789.onrender.com
```

**Try:**
- ✅ Navigate through pages
- ✅ Upload an image on Predict page
- ✅ Check Dashboard
- ✅ Browse Gallery

### 4.3 Test API Documentation

Open:
```
https://brain-tumor-api-abc123.onrender.com/api/docs
```

**Try the "Predict" endpoint:**
1. Click "POST /api/predict/"
2. Click "Try it out"
3. Upload a brain MRI image
4. Click "Execute"
5. See prediction result!

---

## 🤖 Step 5: Setup Auto-Deploy (Optional, 2 minutes)

### 5.1 Get Deploy Hook

1. Go to **backend service** in Render
2. **Settings** → **Deploy Hook**
3. Click "Create Deploy Hook"
4. **Copy the URL** (looks like: `https://api.render.com/deploy/srv-xxxxx?key=xxxxx`)

### 5.2 Add to GitHub Secrets

1. Go to your GitHub repo: `https://github.com/algsoch/brain_tumor`
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `RENDER_DEPLOY_HOOK_URL`
5. Value: (paste the deploy hook URL)
6. Click **"Add secret"**

### 5.3 Test Auto-Deploy

```bash
# Make a small change
echo "# Auto-deploy test" >> README.md

# Commit and push
git add README.md
git commit -m "Test: Auto-deploy trigger"
git push origin main

# Watch deployment in:
# - GitHub: Actions tab
# - Render: Dashboard
```

**Now every push to `main` branch auto-deploys!** 🎉

---

## 📝 Save Your URLs

Write down your live URLs:

```
Frontend: https://brain-tumor-frontend-__________.onrender.com
Backend:  https://brain-tumor-api-__________.onrender.com
API Docs: https://brain-tumor-api-__________.onrender.com/api/docs
```

---

## ⚡ Quick Commands Reference

```bash
# Push updates
git add .
git commit -m "Your update message"
git push origin main

# Check deployment status
# → Go to Render Dashboard

# View logs
# → Render Dashboard → Service → Logs tab

# Rollback if needed
# → Render Dashboard → Service → Rollback tab
```

---

## 🐛 Quick Troubleshooting

### Issue: Backend deployment fails

**Check logs:**
1. Render Dashboard → Backend Service → Logs
2. Look for error messages

**Common fixes:**
- Ensure `model/final_brain_tumor_model_97.keras` exists in git
- Check `requirements.txt` has all dependencies
- Verify Python version in `backend/runtime.txt`

### Issue: Frontend can't connect to backend

**Check:**
1. Backend health: `https://your-backend.onrender.com/health`
2. CORS settings in backend environment
3. Frontend `VITE_API_URL` is correct
4. Both services redeployed after env changes

### Issue: CORS errors in browser

**Fix:**
1. Backend environment → `ALLOWED_ORIGINS` 
2. Must match frontend URL EXACTLY (no trailing slash)
3. Redeploy backend
4. Hard refresh browser (Cmd+Shift+R)

---

## 🎊 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Both services deployed on Render
- [ ] Environment variables configured
- [ ] Health check returns "healthy"
- [ ] Frontend loads without errors
- [ ] Can upload and predict images
- [ ] API documentation accessible
- [ ] Auto-deploy working (optional)

---

## 🔗 Important Links

**GitHub Repo:** https://github.com/algsoch/brain_tumor

**Render Dashboard:** https://dashboard.render.com/

**Your Live App URLs:**
- Frontend: (fill in after deployment)
- Backend: (fill in after deployment)
- API Docs: (fill in after deployment)

---

## 📚 More Help?

- **Detailed Guide**: See `DEPLOYMENT.md`
- **Quick Reference**: See `DEPLOYMENT_SUMMARY.md`
- **Full Docs**: See `README.md`

---

**🚀 Ready? Let's deploy! Start with Step 1 above!**
