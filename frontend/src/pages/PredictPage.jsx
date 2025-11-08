import React from 'react'
import { Box, Typography, Paper, Container, Fade, Chip } from '@mui/material'
import ScienceIcon from '@mui/icons-material/Science'
import SecurityIcon from '@mui/icons-material/Security'
import SpeedIcon from '@mui/icons-material/Speed'
import ImageUpload from '../components/ImageUpload/ImageUpload'

const PredictPage = () => {
  return (
    <Container maxWidth="xl">
      <Fade in timeout={600}>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            fontWeight={800} 
            gutterBottom
            sx={{
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🧠 AI-Powered Brain Tumor Detection
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}>
            Upload a brain MRI scan to receive instant, accurate AI-powered diagnosis using advanced deep learning technology
          </Typography>
          
          {/* Feature Highlights */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip 
              icon={<SpeedIcon />} 
              label="Instant Results (~300ms)" 
              color="success" 
              sx={{ fontSize: '0.95rem', py: 2.5, px: 1 }}
            />
            <Chip 
              icon={<ScienceIcon />} 
              label="97% Clinical Accuracy" 
              color="primary" 
              sx={{ fontSize: '0.95rem', py: 2.5, px: 1 }}
            />
            <Chip 
              icon={<SecurityIcon />} 
              label="HIPAA Compliant" 
              color="secondary" 
              sx={{ fontSize: '0.95rem', py: 2.5, px: 1 }}
            />
          </Box>
        </Box>
      </Fade>
      
      <ImageUpload />
    </Container>
  )
}

export default PredictPage
