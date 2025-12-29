# 🧠 Brain Tumor Detection System

A production-ready, cloud-deployed web application for brain tumor detection using deep learning. Features a medical-grade scanning interface, real-time predictions, and comprehensive analytics dashboard.

[![Accuracy](https://img.shields.io/badge/Accuracy-97.9%25-success)](https://github.com/yourusername/brain_tumor)
[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688)](https://fastapi.tiangolo.com/)
[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7)](https://render.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌐 Live Demo

- **Frontend**: https://brain-tumor-mcug.onrender.com/
- **API Docs**: https://brain-tumor-api-utwn.onrender.com
- **Health Check**: https://brain-tumor-api-utwn.onrender.com/health

## ✨ Features

### 🔬 AI-Powered Detection
- **Medical-Grade Scanning Interface**: 6-stage scanning visualization with real-time progress
- **97.9% Accuracy**: State-of-the-art CNN model trained on brain MRI dataset
- **Instant Results**: ~300ms prediction time with confidence scores
- **Detailed Analysis**: Probability breakdown for Tumor/Healthy classification

### 📊 Comprehensive Dashboard
- **Interactive Visualizations**: Training history, accuracy, loss, AUC metrics
- **Performance Analytics**: Confusion matrix, precision, recall, F1-score
- **Real-time Charts**: Built with Chart.js and Plotly for dynamic data exploration
- **Downloadable Reports**: Export metrics and predictions as CSV

### 🖼️ Smart Gallery
- **Paginated Image Browser**: View 678+ test images with smooth navigation
- **Advanced Filtering**: Filter by prediction result (correct/incorrect)
- **Search Capability**: Find images by filename or prediction
- **Prediction Overlays**: Each image shows its prediction and confidence

### 🔐 API Management
- **API Key System**: Secure endpoints with authentication
- **Rate Limiting**: Prevent abuse with configurable limits
- **Live Testing**: Built-in API tester with/without authentication
- **Code Examples**: Python, JavaScript, Node.js, cURL examples in 8 formats

### 🌐 Production Ready
- **Cloud Deployed**: Auto-deploy to Render with GitHub Actions
- **Docker Support**: Containerized for easy local/cloud deployment
- **CORS Configured**: Secure cross-origin resource sharing
- **Health Monitoring**: Built-in health checks and logging
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 📊 Model Performance

| Metric | Value |
|--------|-------|
| Validation Accuracy | 97.9% |
| AUC Score | 0.997 |
| Precision | 98.7% |
| Recall | 97.4% |

## 🏗️ Project Structure

```
brain_tumor/
├── backend/                    # FastAPI backend application
│   ├── routers/               # API route handlers
│   │   ├── predict.py        # Image prediction endpoints
│   │   ├── metrics.py        # Training metrics endpoints
│   │   └── gallery.py        # Image gallery endpoints
│   ├── services/             # Business logic services
│   │   ├── model_service.py  # ML model handling
│   │   └── data_service.py   # Data processing
│   ├── main.py               # FastAPI application entry point
│   ├── config.py             # Configuration management
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── .gitignore
│
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Layout/       # Main layout component
│   │   │   ├── ImageUpload/  # Image upload component
│   │   │   ├── Charts/       # Chart components
│   │   │   └── CodeBlock/    # Code display component
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── PredictPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── GalleryPage.jsx
│   │   │   └── AboutPage.jsx
│   │   ├── services/         # API service layer
│   │   │   └── api.js
│   │   ├── App.jsx           # Main App component
│   │   └── main.jsx          # Application entry point
│   ├── package.json          # Node.js dependencies
│   ├── vite.config.js        # Vite configuration
│   └── index.html
│
├── model/                     # Trained model files
│   └── final_brain_tumor_model_97.keras
│
├── model_training_phase/      # Training data and logs
│   ├── training_history.csv
│   ├── training_history_2.csv
│   └── model_predictions.csv
│
├── image/                     # Test images
│   └── test_image.zip
│
├── colab_code/               # Jupyter notebooks
│   └── brain_tumor.ipynb
│
├── setup_backend.sh          # Backend setup script
├── setup_frontend.sh         # Frontend setup script
├── docker-compose.yml        # Docker orchestration
└── README.md                 # This file
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **TensorFlow/Keras**: Deep learning framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **Pillow**: Image processing
- **Pandas**: Data manipulation

### Frontend
- **React 18**: UI library with hooks
- **Material-UI**: Component library
- **Chart.js**: Data visualization
- **Axios**: HTTP client
- **React Router**: Navigation
- **Vite**: Build tool

## 📋 Prerequisites

### For Local Development
- **Python**: 3.11 or higher
- **Node.js**: 16 or higher
- **npm**: 7+ or yarn
- **RAM**: 4GB minimum (8GB recommended for model loading)
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Git**: For version control

### For Cloud Deployment
- **GitHub Account**: To host your repository
- **Render Account**: Free tier available at [render.com](https://render.com)
- **Git**: To push code to GitHub

## 🚀 Quick Start

### ☁️ Option 1: Cloud Deployment (Render) - **Recommended**

Deploy to the cloud in 10 minutes with automatic GitHub deployments:

**👉 [Follow the Complete Deployment Guide](DEPLOYMENT.md)**

Quick summary:
1. Push code to GitHub
2. Connect repository to Render
3. Configure environment variables
4. Deploy backend and frontend
5. Set up GitHub Actions for auto-deploy

**Benefits:**
- ✅ Always live (24/7 with paid tier)
- ✅ Auto-deploy on git push
- ✅ Free SSL certificates
- ✅ Global CDN for frontend
- ✅ Automatic scaling

---

### 💻 Option 2: Local Development

Perfect for testing and development:

#### Automated Setup (Fast)

**Backend:**
```bash
cd backend
chmod +x ../setup_backend.sh
../setup_backend.sh
```

**Frontend:**
```bash
cd frontend
chmod +x ../setup_frontend.sh
../setup_frontend.sh
```

#### Manual Setup (Step-by-Step)

**Backend:**

1. **Create and activate virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   
   # On macOS/Linux:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```

4. **Run the backend:**
   ```bash
   python main.py
   ```

   The API will be available at:
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/api/docs
   - Alternative docs: http://localhost:8000/api/redoc

**Frontend:**

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:3000

3. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

---

### 🐳 Option 3: Docker Deployment

Run everything with one command:

```bash
# Build and start containers
docker-compose up --build

# Or run in background
docker-compose up -d --build

# Stop containers
docker-compose down
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

**Docker benefits:**
- ✅ Consistent environment
- ✅ Easy dependency management
- ✅ One-command startup
- ✅ Isolated from system

## 📚 API Documentation

### 📖 Interactive Docs
Once deployed or running locally:
- **Swagger UI**: `https://brain-tumor-api-utwn.onrender.com/api/docs` (or `http://localhost:8000/api/docs`)
- **ReDoc**: `https://brain-tumor-api-utwn.onrender.com/api/redoc`

### 🔑 Main Endpoints

#### Prediction
| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/predict/` | POST | Predict single image | Optional |
| `/api/predict/batch` | POST | Predict multiple images | Optional |
| `/api/predict/model-info` | GET | Get model information | No |

#### Metrics & Analytics
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/metrics/training-history` | GET | Get training metrics |
| `/api/metrics/performance-summary` | GET | Get performance summary |
| `/api/metrics/confusion-matrix` | GET | Get confusion matrix |
| `/api/metrics/download/training-history` | GET | Download training CSV |
| `/api/metrics/download/predictions` | GET | Download predictions CSV |

#### Image Gallery
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/gallery/images` | GET | Get paginated images |
| `/api/gallery/image/{path}` | GET | Get specific image |
| `/api/gallery/stats` | GET | Get gallery statistics |

#### System
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/info` | GET | API configuration |
| `/api/keys/verify` | POST | Verify API key |

## 🧪 Usage Examples

### 🐍 Python

```python
import requests

# Predict single image
url = "https://your-api.onrender.com/api/predict/"  # or http://localhost:8000/api/predict/
with open('brain_mri.jpg', 'rb') as f:
    files = {'file': ('brain_mri.jpg', f, 'image/jpeg')}
    response = requests.post(url, files=files)
    result = response.json()
    
print(f"Prediction: {result['data']['prediction']}")
print(f"Confidence: {result['data']['confidence']:.2f}%")
print(f"Probabilities: {result['data']['all_predictions']}")

# With API key (if required)
headers = {'X-API-Key': 'your-api-key-here'}
response = requests.post(url, files=files, headers=headers)
```

### ⚛️ JavaScript/React

```javascript
import axios from 'axios';

const predictImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await axios.post(
      'https://your-api.onrender.com/api/predict/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          // 'X-API-Key': 'your-api-key-here'  // Optional
        }
      }
    );
    
    console.log('Prediction:', response.data.data.prediction);
    console.log('Confidence:', response.data.data.confidence);
    console.log('Probabilities:', response.data.data.all_predictions);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};
```

### 🖥️ cURL

```bash
# Without API key
curl -X POST "https://your-api.onrender.com/api/predict/" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@brain_mri.jpg"

# With API key
curl -X POST "https://your-api.onrender.com/api/predict/" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -H "X-API-Key: your-api-key-here" \
  -F "file=@brain_mri.jpg"
```

### 🟢 Node.js

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function predictImage(imagePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath));
  
  const response = await axios.post(
    'https://your-api.onrender.com/api/predict/',
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        // 'X-API-Key': 'your-api-key-here'  // Optional
      }
    }
  );
  
  return response.data;
}

// Usage
predictImage('./brain_mri.jpg')
  .then(result => {
    console.log('Prediction:', result.data.prediction);
    console.log('Confidence:', result.data.confidence);
  })
  .catch(error => console.error('Error:', error.message));
```

## ⚙️ Configuration

### 🔧 Backend Configuration

#### Local Development (`backend/.env`)
```env
# Application
APP_NAME="Brain Tumor Detection API"
APP_VERSION="1.0.0"
DEBUG=True

# Server
HOST=0.0.0.0
PORT=8000

# CORS (add your frontend URL)
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# Model
MODEL_PATH=../model/final_brain_tumor_model_97.keras
MODEL_INPUT_SIZE=224
CONFIDENCE_THRESHOLD=0.5

# Data
TRAINING_HISTORY_PATH=../model_training_phase/training_history.csv
TRAINING_HISTORY_2_PATH=../model_training_phase/training_history_2.csv
MODEL_PREDICTIONS_PATH=../model_training_phase/model_predictions.csv
TEST_IMAGES_PATH=../image/test_image

# Upload
MAX_UPLOAD_SIZE=10485760  # 10MB
ALLOWED_EXTENSIONS=[".jpg", ".jpeg", ".png"]

# Logging
LOG_LEVEL=INFO
```

#### Production (Render Dashboard - Environment Variables)
```env
DEBUG=False
PORT=10000
ALLOWED_ORIGINS=["https://your-frontend.onrender.com"]
MODEL_PATH=./model/final_brain_tumor_model_97.keras
```

### 🌐 Frontend Configuration

#### Local Development (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

#### Production (`frontend/.env.production`)
```env
VITE_API_URL=https://your-backend.onrender.com
```

**Note**: Update URLs after deployment. See [DEPLOYMENT.md](DEPLOYMENT.md) for details.

## 📊 Model Training

The model was trained on a brain MRI dataset with the following configuration:

- **Architecture**: Convolutional Neural Network (CNN)
- **Input Size**: 224x224x3 (RGB images)
- **Optimizer**: Adam with learning rate scheduling
- **Loss Function**: Binary Crossentropy
- **Metrics**: Accuracy, AUC, Precision, Recall
- **Training Epochs**: 25 (with early stopping)
- **Batch Size**: 32
- **Data Augmentation**: Rotation, flip, zoom, shift

Training notebooks are available in `colab_code/brain_tumor.ipynb`.

## 🐛 Troubleshooting

### Backend Issues

**Model not loading:**
- Ensure the model file exists at the path specified in `.env`
- Check that you have enough RAM (model requires ~2GB)
- Verify TensorFlow is installed correctly

**Port already in use:**
```bash
# Change port in .env or use:
PORT=8001 python main.py
```

### Frontend Issues

**API connection errors:**
- Verify backend is running on http://localhost:8000
- Check CORS settings in backend `.env`
- Ensure proxy settings in `vite.config.js`

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
## 🙏 Acknowledgments

- Dataset providers
- TensorFlow and Keras teams
- FastAPI and React communities
- Material-UI contributors

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: your.email@example.com

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Brain MRI dataset providers
- TensorFlow and Keras teams for the ML framework
- FastAPI and React communities for excellent documentation
- Material-UI contributors for beautiful components
- Render for easy cloud deployment

## 👨‍💻 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/algsoch/brain_tumor/issues)
- **Documentation**: [Full Docs](DEPLOYMENT.md)
- **Quick Start**: [Quick Start Guide](QUICKSTART.md)

---

## ⚠️ Medical Disclaimer

**This is a research and educational project.** 

This application is intended for:
- Educational purposes
- Research demonstrations
- Machine learning portfolio projects
- Technical proof of concept

**NOT intended for:**
- Clinical diagnosis
- Medical decision making
- Patient care
- Production medical use

For any clinical application, this system would require:
- Regulatory approval (FDA, CE marking, etc.)
- Clinical validation studies
- HIPAA compliance implementation
- Professional medical oversight
- Proper medical device classification

**Always consult qualified healthcare professionals for medical diagnosis and treatment.**

---

<div align="center">

**Made with ❤️ using React, FastAPI, and TensorFlow**

[![GitHub Stars](https://img.shields.io/github/stars/algsoch/brain_tumor?style=social)](https://github.com/algsoch/brain_tumor)
[![GitHub Forks](https://img.shields.io/github/forks/algsoch/brain_tumor?style=social)](https://github.com/algsoch/brain_tumor/fork)

</div>
