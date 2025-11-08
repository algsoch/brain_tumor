# Quick Setup Guide

Follow these steps to get the Brain Tumor Detection System up and running.

## Prerequisites

Before starting, ensure you have:

- ✅ **Python 3.8+** installed ([Download](https://www.python.org/downloads/))
- ✅ **Node.js 16+** installed ([Download](https://nodejs.org/))
- ✅ **Git** (optional, for cloning)
- ✅ **4GB+ RAM** (8GB recommended for smooth model loading)

Verify installations:
```bash
python3 --version
node --version
npm --version
```

## 🚀 Quick Start (Recommended)

### Step 1: Backend Setup with Virtual Environment

```bash
# Navigate to project root
cd /Users/viclkykumar/project/deep_learning/brain_tumor

# Run backend setup script
./setup_backend.sh
```

This script will:
- ✅ Create a Python virtual environment in `backend/venv/`
- ✅ Install all Python dependencies
- ✅ Create `.env` file from template
- ✅ Set up necessary directories

### Step 2: Frontend Setup

```bash
# Run frontend setup script
./setup_frontend.sh
```

This script will:
- ✅ Install Node.js dependencies
- ✅ Create frontend `.env` file
- ✅ Prepare the React application

### Step 3: Start the Backend Server

```bash
# Activate virtual environment
cd backend
source venv/bin/activate

# Start the FastAPI server
python main.py
```

Backend will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/api/docs
- **Alternative Docs**: http://localhost:8000/api/redoc

### Step 4: Start the Frontend

Open a **new terminal window**:

```bash
cd frontend
npm run dev
```

Frontend will be available at:
- **Web App**: http://localhost:3000

## 🐳 Docker Setup (Alternative)

If you prefer Docker:

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## 📁 Project Structure Overview

```
brain_tumor/
├── backend/              # FastAPI backend
│   ├── venv/            # Virtual environment (created by setup)
│   ├── routers/         # API endpoints
│   ├── services/        # Business logic
│   ├── main.py          # App entry point
│   └── requirements.txt # Python dependencies
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
│   └── package.json     # Node dependencies
│
├── model/               # Trained Keras model
├── model_training_phase/ # Training data/CSVs
└── image/               # Test images
```

## 🔧 Manual Setup (If Scripts Don't Work)

### Backend Manual Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start server
python main.py
```

### Frontend Manual Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start dev server
npm run dev
```

## ✅ Verification

After setup, verify everything works:

1. **Backend Health Check**:
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Frontend**: Open http://localhost:3000 in your browser

3. **Test Prediction**:
   - Navigate to "Predict" page
   - Upload a brain MRI image
   - Click "Predict"
   - View results with confidence scores

## 🛠️ Troubleshooting

### Backend Issues

**Virtual environment not activating:**
```bash
# Make sure you're in the backend directory
cd backend
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

**Model not loading:**
- Check that `model/final_brain_tumor_model_97.keras` exists
- Ensure you have enough RAM (model needs ~2GB)
- Verify path in `backend/.env`

**Port 8000 already in use:**
```bash
# Edit backend/.env and change PORT
PORT=8001 python main.py
```

### Frontend Issues

**Dependencies installation fails:**
```bash
# Clear cache and retry
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Can't connect to backend:**
- Verify backend is running on port 8000
- Check `frontend/.env` has correct API URL
- Ensure CORS is configured in `backend/.env`

**Port 3000 already in use:**
```bash
# Vite will automatically use next available port
# Or specify a different port
npm run dev -- --port 3001
```

## 📚 Next Steps

1. **Explore the App**:
   - Upload MRI images for prediction
   - View training metrics on Dashboard
   - Browse test images in Gallery
   - Read about the model in About page

2. **API Documentation**:
   - Visit http://localhost:8000/api/docs
   - Try out endpoints interactively
   - View request/response schemas

3. **Customize**:
   - Edit `backend/.env` for configuration
   - Modify `frontend/src/` for UI changes
   - Add new features to routers and components

## 🚀 Production Deployment

### Backend Production

```bash
cd backend
source venv/bin/activate

# Set production environment
export DEBUG=False

# Run with production server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Production

```bash
cd frontend

# Build for production
npm run build

# Serve with production server
npm run preview
# Or use nginx, apache, etc. to serve dist/ folder
```

### Using Docker for Production

```bash
# Build and run
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 📞 Support

If you encounter issues:

1. Check the main [README.md](README.md) for detailed documentation
2. Review error messages in terminal
3. Check browser console for frontend errors
4. Verify all prerequisites are installed
5. Ensure virtual environment is activated (backend)

## 🎉 Success!

Once both servers are running:
- ✅ Backend API at http://localhost:8000
- ✅ Frontend App at http://localhost:3000
- ✅ Ready to classify brain MRI images!

Happy predicting! 🧠🔬
