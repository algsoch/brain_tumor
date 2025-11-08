import React from 'react'
import { Box, Container, Typography, Paper, Grid, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PsychologyIcon from '@mui/icons-material/Psychology'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import InfoIcon from '@mui/icons-material/Info'
import LiveDemo from '../components/LiveDemo/LiveDemo'
import AutoDemo from '../components/AutoDemo/AutoDemo'

const HomePage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <PsychologyIcon sx={{ fontSize: 60 }} />,
      title: 'AI-Powered Prediction',
      description: 'Upload brain MRI images and get instant tumor detection results with confidence scores.',
      action: () => navigate('/predict'),
      buttonText: 'Start Predicting',
      color: '#1976d2',
    },
    {
      icon: <DashboardIcon sx={{ fontSize: 60 }} />,
      title: 'Performance Dashboard',
      description: 'Explore interactive charts showing model training history, accuracy, AUC, and more metrics.',
      action: () => navigate('/dashboard'),
      buttonText: 'View Dashboard',
      color: '#2e7d32',
    },
    {
      icon: <PhotoLibraryIcon sx={{ fontSize: 60 }} />,
      title: 'Image Gallery',
      description: 'Browse test images with predictions, filter by accuracy, and explore the dataset.',
      action: () => navigate('/gallery'),
      buttonText: 'Browse Gallery',
      color: '#ed6c02',
    },
    {
      icon: <InfoIcon sx={{ fontSize: 60 }} />,
      title: 'About & Research',
      description: 'Learn about the deep learning model, architecture, and research methodology.',
      action: () => navigate('/about'),
      buttonText: 'Learn More',
      color: '#9c27b0',
    },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          px: 4,
          borderRadius: 4,
          mb: 6,
          textAlign: 'center',
        }}
      >
        <PsychologyIcon sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom fontWeight="700">
          Brain Tumor Detection System
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
          AI-Powered Medical Image Classification Using Deep Learning
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
          State-of-the-art convolutional neural network for accurate brain tumor detection from MRI scans.
          Achieve 97%+ accuracy with our production-ready deep learning model.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: 'white',
            color: '#667eea',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.9)',
            },
          }}
          onClick={() => navigate('/predict')}
        >
          Try It Now
        </Button>
      </Paper>

      {/* Auto Demo Section */}
      <Box sx={{ mb: 6 }}>
        <AutoDemo />
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <Box sx={{ color: feature.color, mb: 2 }}>
                {feature.icon}
              </Box>
              <Typography variant="h6" gutterBottom fontWeight="600">
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                {feature.description}
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                onClick={feature.action}
                sx={{ borderColor: feature.color, color: feature.color }}
              >
                {feature.buttonText}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Key Stats Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="600" sx={{ mb: 4 }}>
          Model Performance Highlights
        </Typography>
        <Grid container spacing={3}>
          {[
            { label: 'Model Accuracy', value: '97.9%', color: '#2e7d32' },
            { label: 'AUC Score', value: '0.997', color: '#1976d2' },
            { label: 'Precision', value: '98.7%', color: '#ed6c02' },
            { label: 'Recall', value: '97.4%', color: '#9c27b0' },
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderTop: `4px solid ${stat.color}`,
                }}
              >
                <Typography variant="h3" fontWeight="700" color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Live Demo Section */}
      <Box sx={{ mt: 6 }}>
        <LiveDemo />
      </Box>

      {/* Tech Stack Section */}
      <Box sx={{ mt: 6 }}>
        <Paper elevation={2} sx={{ p: 4, backgroundColor: 'background.default' }}>
          <Typography variant="h5" align="center" gutterBottom fontWeight="600">
            Technology Stack
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Built with modern tools and frameworks for production-ready deployment
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {[
              'React',
              'Material-UI',
              'FastAPI',
              'TensorFlow/Keras',
              'Chart.js',
              'Python',
              'Docker',
              'REST API',
            ].map((tech, index) => (
              <Grid item key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    px: 3,
                    py: 1.5,
                    backgroundColor: 'white',
                  }}
                >
                  <Typography variant="body1" fontWeight="500">
                    {tech}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Box>
  )
}

export default HomePage
