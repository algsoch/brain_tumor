import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import CodeBlock from '../components/CodeBlock/CodeBlock'

const AboutPage = () => {
  const modelArchitecture = `# Brain Tumor Detection Model Architecture

## Model Summary
- Base Architecture: Convolutional Neural Network (CNN)
- Input Shape: (224, 224, 3) - RGB MRI Images
- Output Classes: Binary (Healthy / Tumor)
- Total Parameters: ~15M trainable parameters

## Layer Configuration
1. Convolutional Blocks with Batch Normalization
2. MaxPooling for spatial dimension reduction
3. Dropout layers for regularization (0.3-0.5)
4. Dense layers with ReLU activation
5. Final sigmoid activation for binary classification

## Training Configuration
- Optimizer: Adam with adaptive learning rate
- Loss Function: Binary Crossentropy
- Metrics: Accuracy, AUC, Precision, Recall
- Batch Size: 32
- Total Epochs: 25 (with early stopping)
- Initial Learning Rate: 0.001
- Learning Rate Schedule: ReduceLROnPlateau

## Performance
- Final Validation Accuracy: 97.9%
- AUC Score: 0.997
- Precision: 98.7%
- Recall: 97.4%`

  const setupCode = `# Backend Setup (FastAPI)
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env
python main.py

# Frontend Setup (React + Vite)
cd frontend
npm install
npm run dev

# Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs`

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600" align="center" sx={{ mb: 2 }}>
        About Brain Tumor Detection System
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Research-backed AI solution for medical image classification
      </Typography>

      {/* Abstract */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="600">
          Abstract
        </Typography>
        <Typography variant="body1" paragraph>
          This Brain Tumor Detection System is a production-ready web application that leverages deep
          learning to classify brain MRI scans as either healthy or containing tumors. Built with a
          state-of-the-art Convolutional Neural Network (CNN), the model achieves exceptional accuracy
          of 97.9% on validation data with an AUC score of 0.997.
        </Typography>
        <Typography variant="body1" paragraph>
          The system provides medical professionals and researchers with an intuitive interface for
          uploading MRI images, receiving instant AI-powered diagnoses, and exploring comprehensive
          performance metrics. The application includes interactive dashboards, training history
          visualization, and a gallery of test images for validation purposes.
        </Typography>
        <Typography variant="body1">
          Developed using modern web technologies (React, FastAPI) and industry-standard ML frameworks
          (TensorFlow/Keras), this system demonstrates best practices in medical AI deployment,
          including proper model validation, explainable results with confidence scores, and
          comprehensive documentation.
        </Typography>
      </Paper>

      {/* Tech Stack */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="600">
          Technology Stack
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              Frontend
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="React 18 with Hooks" secondary="Modern UI library" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Material-UI v5" secondary="Component library" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Chart.js & Plotly" secondary="Data visualization" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Axios" secondary="HTTP client" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Vite" secondary="Build tool" />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              Backend
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="FastAPI" secondary="High-performance Python web framework" />
              </ListItem>
              <ListItem>
                <ListItemText primary="TensorFlow 2.15" secondary="Deep learning framework" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Keras" secondary="High-level neural networks API" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Uvicorn" secondary="ASGI server" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Pandas & NumPy" secondary="Data processing" />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* Model Architecture */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
          Model Architecture & Training
        </Typography>
        <CodeBlock code={modelArchitecture} language="markdown" title="Model Details" />
      </Paper>

      {/* Features */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="600">
          Key Features
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {[
            'Real-time image classification with confidence scores',
            'Interactive training history visualization',
            'Batch prediction support for multiple images',
            'Comprehensive performance metrics dashboard',
            'Test image gallery with pagination',
            'Downloadable CSV reports',
            'RESTful API with OpenAPI documentation',
            'Responsive design for mobile and desktop',
            'Code examples for all visualizations',
            'Production-ready deployment configuration',
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Chip label={feature} color="primary" variant="outlined" sx={{ width: '100%', justifyContent: 'flex-start' }} />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Setup Instructions */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
          Setup & Installation
        </Typography>
        <CodeBlock code={setupCode} language="bash" title="Quick Start Guide" />
      </Paper>
    </Box>
  )
}

export default AboutPage
