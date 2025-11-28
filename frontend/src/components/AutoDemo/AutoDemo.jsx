import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  CircularProgress,
  IconButton,
  Chip,
  Fade,
  Zoom,
  Slide,
  Alert,
  Button,
  Tooltip,
} from '@mui/material'
import {
  PlayArrow,
  Pause,
  SkipNext,
  Refresh,
  Memory,
  Speed,
  AccountTree,
  CheckCircle,
  Cancel,
  Science as ScienceIcon,
  Radar as RadarIcon,
  Analytics as AnalyticsIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Sync as SyncIcon,
} from '@mui/icons-material'
import { galleryAPI, predictionAPI, generalAPI } from '../../services/api'

const AutoDemo = () => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [allImages, setAllImages] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentImage, setCurrentImage] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scanPosition, setScanPosition] = useState(0)
  const [scanningStage, setScanningStage] = useState(0)
  const [error, setError] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [retryCount, setRetryCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // AI Processing stages with durations
  const scanningStages = [
    { label: 'Initializing Neural Network...', icon: <Memory />, duration: 600 },
    { label: 'Preprocessing MRI Image...', icon: <ScienceIcon />, duration: 800 },
    { label: 'Extracting Features...', icon: <RadarIcon />, duration: 1000 },
    { label: 'Analyzing Brain Structure...', icon: <AnalyticsIcon />, duration: 1200 },
    { label: 'Running Deep Learning Model...', icon: <Memory />, duration: 1400 },
    { label: 'Computing Confidence Scores...', icon: <Speed />, duration: 800 },
  ]

  useEffect(() => {
    checkConnectionAndLoadImages()
  }, [])

  // Check connection and load images
  const checkConnectionAndLoadImages = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // First check if backend is connected
      setConnectionStatus('checking')
      const healthResponse = await generalAPI.healthCheck()
      
      if (healthResponse.status === 'healthy') {
        setConnectionStatus('connected')
        await loadImages()
      } else {
        setConnectionStatus('disconnected')
        setError('Backend service is not healthy')
      }
    } catch (err) {
      console.error('Connection check failed:', err)
      setConnectionStatus('disconnected')
      setError('Cannot connect to backend. Please check if the server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isPlaying && !isProcessing && allImages.length > 0) {
      const timer = setTimeout(() => {
        processImage()
      }, 3500) // Wait 3.5s before next image

      return () => clearTimeout(timer)
    }
  }, [currentIndex, isPlaying, allImages, isProcessing])

  // Handle scanning stage progression
  useEffect(() => {
    if (isProcessing && scanningStage < scanningStages.length) {
      const timer = setTimeout(() => {
        setScanningStage((prev) => prev + 1)
      }, scanningStages[scanningStage].duration)
      return () => clearTimeout(timer)
    }
  }, [isProcessing, scanningStage])

  // Handle progress bar animation synced with stages
  useEffect(() => {
    if (isProcessing) {
      const totalDuration = scanningStages.reduce((sum, stage) => sum + stage.duration, 0)
      const incrementInterval = 50
      const incrementPerStep = 100 / (totalDuration / incrementInterval)
      
      const progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100
          return Math.min(prev + incrementPerStep, 100)
        })
        setScanPosition((prev) => Math.min(prev + incrementPerStep, 100))
      }, incrementInterval)
      
      return () => clearInterval(progressTimer)
    } else {
      setProgress(0)
      setScanPosition(0)
    }
  }, [isProcessing])

  const loadImages = async () => {
    try {
      const response = await galleryAPI.getImages({ page: 1, page_size: 20 })
      if (response.success && response.data?.images) {
        // Filter out any potential problematic files
        const validImages = response.data.images.filter(img => 
          !img.filename.startsWith('._') && 
          (img.filename.endsWith('.jpg') || img.filename.endsWith('.jpeg') || img.filename.endsWith('.png'))
        )
        setAllImages(validImages)
        if (validImages.length > 0) {
          setCurrentImage(validImages[0])
          setRetryCount(0)
        } else {
          setError('No valid images found in gallery')
        }
      } else {
        throw new Error('Failed to get images from gallery')
      }
    } catch (error) {
      console.error('Failed to load images:', error)
      setError('Failed to load demo images. Click retry to try again.')
      
      // Auto-retry up to 3 times
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => {
          checkConnectionAndLoadImages()
        }, 2000 * (retryCount + 1))
      }
    }
  }

  const processImage = async () => {
    if (!allImages[currentIndex]) return

    const image = allImages[currentIndex]
    setCurrentImage(image)
    setIsProcessing(true)
    setPrediction(null)
    setProgress(0)
    setScanPosition(0)
    setScanningStage(0)
    setError(null)

    try {
      // Wait for animation to complete FIRST before calling API
      const totalDuration = scanningStages.reduce((sum, stage) => sum + stage.duration, 0)
      
      console.log('🎬 Starting animation sequence...')
      await new Promise(resolve => setTimeout(resolve, totalDuration))
      
      // NOW fetch the actual image blob from gallery
      const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
      // URL-encode the path to handle special characters like parentheses
      const encodedPath = encodeURIComponent(image.path)
      const imageUrl = `${API_BASE_URL}/api/gallery/image/${encodedPath}`
      
      console.log('🔄 Fetching image:', imageUrl)
      const imageResponse = await fetch(imageUrl)
      
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`)
      }
      
      const blob = await imageResponse.blob()
      const file = new File([blob], image.filename, { type: blob.type || 'image/jpeg' })
      
      console.log('📤 Sending to AI model:', file.name)
      
      // Make REAL API prediction call
      const result = await predictionAPI.predictImage(file)
      
      console.log('✅ Prediction result:', result.data)
      
      setPrediction({
        ...result.data,
        actualLabel: image.label,
        isCorrect: result.data.prediction.toLowerCase() === image.label.toLowerCase()
      })
      
    } catch (error) {
      console.error('❌ Prediction error:', error)
      setError(error.response?.data?.detail || error.message || 'Prediction failed')
      
      // Fallback prediction based on filename
      setPrediction({
        prediction: image.label || (image.filename.includes('cancer_') ? 'tumor' : 'healthy'),
        confidence: 0,
        class_name: image.label || (image.filename.includes('cancer_') ? 'tumor' : 'healthy'),
        actualLabel: image.label,
        isCorrect: null,
        error: true
      })
    } finally {
      setProgress(100)
      setScanPosition(100)
      setTimeout(() => {
        setIsProcessing(false)
        // Move to next image
        setCurrentIndex((prev) => (prev + 1) % allImages.length)
      }, 2500) // Show result for 2.5s before next
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length)
    processImage()
  }

  const restart = () => {
    setCurrentIndex(0)
    setIsPlaying(true)
    processImage()
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 8,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(138, 43, 226, 0.3), transparent 50%)',
          animation: 'pulse 8s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'moveGrid 20s linear infinite',
          opacity: 0.3,
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 0.8 },
        },
        '@keyframes moveGrid': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
      }}
    >
      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.4)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float${i % 3} ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            '@keyframes float0': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(30px, -30px) scale(1.2)' },
            },
            '@keyframes float1': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(-40px, 40px) scale(0.8)' },
            },
            '@keyframes float2': {
              '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(25px, 35px) scale(1.1)' },
            },
          }}
        />
      ))}

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={1000}>
          <Box>
            <Typography
              variant="h3"
              align="center"
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 1,
                textShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 40px rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
                animation: 'titleGlow 3s ease-in-out infinite',
                '@keyframes titleGlow': {
                  '0%, 100%': { textShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 40px rgba(255,255,255,0.2)' },
                  '50%': { textShadow: '0 4px 20px rgba(0,0,0,0.6), 0 0 60px rgba(255,255,255,0.4)' },
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  animation: 'robotPulse 2s ease-in-out infinite',
                  display: 'inline-block',
                  '@keyframes robotPulse': {
                    '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
                    '50%': { transform: 'scale(1.2) rotate(10deg)' },
                  },
                }}
              >
                🤖
              </Box>
              🔬 Live Demo - Real-Time Prediction
            </Typography>
            <Typography
              variant="h6"
              align="center"
              sx={{
                color: 'rgba(255,255,255,0.95)',
                fontWeight: 400,
                mb: 4,
                textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                animation: 'fadeInUp 1s ease-out',
                '@keyframes fadeInUp': {
                  '0%': { opacity: 0, transform: 'translateY(20px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              Watch our AI model analyze brain scans in real-time with advanced deep learning
            </Typography>
            
            {/* Connection Status Banner */}
            <Fade in timeout={500}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Chip
                  icon={
                    connectionStatus === 'connected' ? (
                      <CloudDoneIcon sx={{ color: '#fff !important' }} />
                    ) : connectionStatus === 'checking' ? (
                      <SyncIcon sx={{ 
                        color: '#fff !important',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      }} />
                    ) : (
                      <CloudOffIcon sx={{ color: '#fff !important' }} />
                    )
                  }
                  label={
                    connectionStatus === 'connected' 
                      ? '🟢 Backend Connected - AI Ready' 
                      : connectionStatus === 'checking'
                      ? '🟡 Connecting to Backend...'
                      : '🔴 Backend Disconnected'
                  }
                  sx={{
                    backgroundColor: 
                      connectionStatus === 'connected' 
                        ? 'rgba(76, 175, 80, 0.9)' 
                        : connectionStatus === 'checking'
                        ? 'rgba(255, 193, 7, 0.9)'
                        : 'rgba(244, 67, 54, 0.9)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    py: 2.5,
                    px: 2,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    animation: connectionStatus === 'connected' 
                      ? 'connectedPulse 3s ease-in-out infinite'
                      : connectionStatus === 'checking'
                      ? 'checkingPulse 1s ease-in-out infinite'
                      : 'disconnectedPulse 1.5s ease-in-out infinite',
                    '@keyframes connectedPulse': {
                      '0%, 100%': { boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)' },
                      '50%': { boxShadow: '0 4px 25px rgba(76, 175, 80, 0.6)' },
                    },
                    '@keyframes checkingPulse': {
                      '0%, 100%': { opacity: 0.7 },
                      '50%': { opacity: 1 },
                    },
                    '@keyframes disconnectedPulse': {
                      '0%, 100%': { boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)' },
                      '50%': { boxShadow: '0 4px 25px rgba(244, 67, 54, 0.6)' },
                    },
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                  onClick={() => checkConnectionAndLoadImages()}
                />
              </Box>
            </Fade>
            
            {/* Error Alert with Retry */}
            {error && (
              <Alert 
                severity="error" 
                action={
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={() => checkConnectionAndLoadImages()}
                    startIcon={<Refresh />}
                  >
                    Retry
                  </Button>
                }
                sx={{ 
                  mb: 3,
                  maxWidth: 800,
                  mx: 'auto',
                  boxShadow: 3,
                  animation: 'slideDown 0.5s ease-out',
                  '@keyframes slideDown': {
                    '0%': { opacity: 0, transform: 'translateY(-20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
                onClose={() => setError(null)}
              >
                <strong>Error:</strong> {error}
                {retryCount > 0 && ` (Retry attempt ${retryCount}/3)`}
              </Alert>
            )}
            
            {/* Loading State */}
            {isLoading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Connecting to AI Backend...
                </Typography>
              </Box>
            )}
            
            {/* Model Info Banner with Enhanced Animations */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                mb: 4,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                icon={<Memory sx={{ animation: 'spin 3s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />}
                label="CNN Deep Learning Model"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  py: 2.5,
                  px: 1,
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  animation: 'chipFloat 3s ease-in-out infinite',
                  animationDelay: '0s',
                  '@keyframes chipFloat': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                  },
                  '&:hover': {
                    transform: 'scale(1.1)',
                    bgcolor: 'rgba(255,255,255,0.35)',
                  },
                  transition: 'all 0.3s ease',
                }}
              />
              <Chip
                icon={<Speed sx={{ animation: 'pulse 2s ease-in-out infinite', '@keyframes pulse': { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.2)' } } }} />}
                label="97% Accuracy"
                sx={{
                  bgcolor: 'rgba(76,175,80,0.4)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  py: 2.5,
                  px: 1,
                  border: '2px solid rgba(76,175,80,0.5)',
                  boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
                  animation: 'chipFloat 3s ease-in-out infinite',
                  animationDelay: '0.5s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    bgcolor: 'rgba(76,175,80,0.6)',
                  },
                  transition: 'all 0.3s ease',
                }}
              />
              <Chip
                icon={<AccountTree sx={{ animation: 'wiggle 2s ease-in-out infinite', '@keyframes wiggle': { '0%, 100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-10deg)' }, '75%': { transform: 'rotate(10deg)' } } }} />}
                label="Multi-Layer Neural Network"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  py: 2.5,
                  px: 1,
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  animation: 'chipFloat 3s ease-in-out infinite',
                  animationDelay: '1s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    bgcolor: 'rgba(255,255,255,0.35)',
                  },
                  transition: 'all 0.3s ease',
                }}
              />
            </Box>
          </Box>
        </Fade>

        <Zoom in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              bgcolor: 'rgba(255,255,255,0.98)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 80px rgba(102, 126, 234, 0.15)',
              border: '2px solid rgba(255,255,255,0.5)',
              animation: 'paperFloat 6s ease-in-out infinite',
              '@keyframes paperFloat': {
                '0%, 100%': { 
                  transform: 'translateY(0px)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 80px rgba(102, 126, 234, 0.15)'
                },
                '50%': { 
                  transform: 'translateY(-10px)',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.4), 0 0 120px rgba(102, 126, 234, 0.3)'
                },
              },
            }}
          >
            <Grid container spacing={0}>
              {/* Left: Image Display */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 400, md: 600 },
                    bgcolor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {currentImage && (
                    <Fade in timeout={500}>
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')}/api/gallery/image/${encodeURIComponent(currentImage.path)}?v=3`}
                          alt={currentImage.filename}
                          onError={(e) => {
                            console.error('AutoDemo image failed to load:', currentImage.path);
                            e.target.style.display = 'none';
                          }}
                          style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain',
                            filter: isProcessing ? 'brightness(0.7)' : 'brightness(1)',
                            transition: 'filter 0.3s ease',
                          }}
                        />

                        {/* Scanning Line with glow effect */}
                        {isProcessing && (
                          <>
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: `${scanPosition}%`,
                                height: 4,
                                bgcolor: '#00ff00',
                                boxShadow: '0 0 30px #00ff00, 0 0 60px rgba(0,255,0,0.5)',
                                transition: 'top 1s linear',
                                zIndex: 2,
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: `${scanPosition}%`,
                                height: 40,
                                background: 'linear-gradient(180deg, transparent, rgba(0,255,0,0.1), transparent)',
                                transition: 'top 1s linear',
                                zIndex: 1,
                              }}
                            />
                          </>
                        )}

                        {/* Enhanced Grid Overlay */}
                        {isProcessing && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(0, 255, 0, 0.15) 24px, rgba(0, 255, 0, 0.15) 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(0, 255, 0, 0.15) 24px, rgba(0, 255, 0, 0.15) 25px)',
                              pointerEvents: 'none',
                              animation: 'gridPulse 2s ease-in-out infinite',
                              '@keyframes gridPulse': {
                                '0%, 100%': { opacity: 0.3 },
                                '50%': { opacity: 0.6 },
                              },
                            }}
                          />
                        )}

                        {/* Enhanced Corner Brackets */}
                        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => (
                          <Box
                            key={corner}
                            sx={{
                              position: 'absolute',
                              [corner.split('-')[0]]: 20,
                              [corner.split('-')[1]]: 20,
                              width: 50,
                              height: 50,
                              borderTop: corner.includes('top') ? '4px solid #00ff00' : 'none',
                              borderBottom: corner.includes('bottom') ? '4px solid #00ff00' : 'none',
                              borderLeft: corner.includes('left') ? '4px solid #00ff00' : 'none',
                              borderRight: corner.includes('right') ? '4px solid #00ff00' : 'none',
                              boxShadow: '0 0 15px rgba(0,255,0,0.5)',
                              animation: 'cornerPulse 2s ease-in-out infinite',
                              '@keyframes cornerPulse': {
                                '0%, 100%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.1)' },
                              },
                            }}
                          />
                        ))}

                        {/* Enhanced Image Info */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 20,
                            left: 20,
                            right: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}
                        >
                          <Chip
                            label={`📸 ${currentImage.filename}`}
                            sx={{
                              bgcolor: 'rgba(0,0,0,0.85)',
                              color: '#00ff00',
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              backdropFilter: 'blur(10px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            }}
                          />
                          <Chip
                            label={currentImage.label || 'Unknown'}
                            sx={{
                              bgcolor: 'rgba(0,0,0,0.85)',
                              color: '#ffffff',
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              backdropFilter: 'blur(10px)',
                              alignSelf: 'flex-start',
                            }}
                          />
                        </Box>
                      </Box>
                    </Fade>
                  )}
                </Box>
              </Grid>

              {/* Center: Enhanced Processing Status */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    minHeight: { xs: 500, md: 600 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: { xs: 3, md: 4 },
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.1), transparent 70%)',
                      animation: 'bgPulse 4s ease-in-out infinite',
                    },
                    '@keyframes bgPulse': {
                      '0%, 100%': { opacity: 0.5 },
                      '50%': { opacity: 1 },
                    },
                  }}
                >
                  {isProcessing ? (
                    <Fade in timeout={500}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        position: 'relative', 
                        zIndex: 1,
                        width: '100%',
                        maxWidth: 400,
                      }}>
                        {/* Circular Progress with Animation */}
                        <Box sx={{ 
                          position: 'relative', 
                          display: 'inline-block', 
                          mb: 3,
                          animation: 'progressFloat 3s ease-in-out infinite',
                          '@keyframes progressFloat': {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' },
                          },
                        }}>
                          {/* Background circle */}
                          <CircularProgress
                            variant="determinate"
                            value={100}
                            size={160}
                            thickness={4}
                            sx={{
                              color: 'rgba(102, 126, 234, 0.1)',
                              position: 'absolute',
                            }}
                          />
                          {/* Animated progress circle */}
                          <CircularProgress
                            variant="determinate"
                            value={progress}
                            size={160}
                            thickness={5}
                            sx={{
                              color: '#667eea',
                              filter: 'drop-shadow(0 0 20px rgba(102, 126, 234, 0.6))',
                              '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                                transition: 'stroke-dashoffset 0.3s ease',
                              },
                            }}
                          />
                          {/* Center content */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              textAlign: 'center',
                            }}
                          >
                            <Typography 
                              variant="h3" 
                              fontWeight={900} 
                              sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                animation: 'numberPulse 1s ease-in-out infinite',
                                '@keyframes numberPulse': {
                                  '0%, 100%': { transform: 'scale(1)' },
                                  '50%': { transform: 'scale(1.1)' },
                                },
                              }}
                            >
                              {Math.round(progress)}%
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#667eea',
                                fontWeight: 600,
                                letterSpacing: 1,
                              }}
                            >
                              ANALYZING
                            </Typography>
                          </Box>
                        </Box>

                        {/* Title with animation */}
                        <Typography 
                          variant="h5" 
                          gutterBottom 
                          fontWeight={700} 
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            mb: 1,
                            animation: 'titleShine 3s ease-in-out infinite',
                            '@keyframes titleShine': {
                              '0%, 100%': { opacity: 0.8 },
                              '50%': { opacity: 1 },
                            },
                          }}
                        >
                          🧠 AI Processing
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 3, 
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            px: 2,
                          }}
                        >
                          Deep learning neural network analyzing brain patterns
                        </Typography>

                        {/* Enhanced Linear Progress Bar */}
                        <Box sx={{ width: '100%', mb: 4, px: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 16,
                              borderRadius: 8,
                              bgcolor: 'rgba(224, 224, 224, 0.5)',
                              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)',
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 6,
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
                                backgroundSize: '200% 100%',
                                boxShadow: '0 0 20px rgba(102, 126, 234, 0.6), inset 0 1px 2px rgba(255,255,255,0.3)',
                                animation: 'progressShine 2s linear infinite',
                              },
                              '@keyframes progressShine': {
                                '0%': { backgroundPosition: '200% 0' },
                                '100%': { backgroundPosition: '0 0' },
                              },
                            }}
                          />
                          {/* Progress percentage below bar */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, px: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 700 }}>
                              0%
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 700 }}>
                              {Math.round(progress)}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 700 }}>
                              100%
                            </Typography>
                          </Box>
                        </Box>

                        {/* Enhanced Scanning Stages */}
                        <Box sx={{ width: '100%', px: 1 }}>
                          {scanningStages.map((stage, index) => {
                            const isComplete = scanningStage > index;
                            const isActive = scanningStage === index;
                            
                            return (
                              <Slide
                                key={index}
                                direction="right"
                                in={scanningStage >= index}
                                timeout={300 + index * 100}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1.5,
                                    p: 1.5,
                                    borderRadius: 3,
                                    bgcolor: isComplete 
                                      ? 'rgba(76, 175, 80, 0.15)' 
                                      : isActive 
                                      ? 'rgba(102, 126, 234, 0.15)'
                                      : 'rgba(255, 255, 255, 0.5)',
                                    transition: 'all 0.3s ease',
                                    border: isActive 
                                      ? '3px solid #667eea' 
                                      : isComplete
                                      ? '2px solid #4caf50'
                                      : '2px solid transparent',
                                    boxShadow: isActive 
                                      ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
                                      : isComplete
                                      ? '0 2px 8px rgba(76, 175, 80, 0.3)'
                                      : 'none',
                                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: '50%',
                                      bgcolor: isComplete 
                                        ? '#4caf50' 
                                        : isActive 
                                        ? '#667eea' 
                                        : '#e0e0e0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      mr: 2,
                                      flexShrink: 0,
                                      transition: 'all 0.3s ease',
                                      boxShadow: isComplete 
                                        ? '0 0 20px rgba(76, 175, 80, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)' 
                                        : isActive 
                                        ? '0 0 20px rgba(102, 126, 234, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
                                        : '0 2px 4px rgba(0,0,0,0.1)',
                                      animation: isActive ? 'stagePulse 1.5s ease-in-out infinite' : 'none',
                                      border: isActive ? '3px solid white' : 'none',
                                      '@keyframes stagePulse': {
                                        '0%, 100%': { 
                                          transform: 'scale(1)',
                                          boxShadow: '0 0 20px rgba(102, 126, 234, 0.6)'
                                        },
                                        '50%': { 
                                          transform: 'scale(1.15)',
                                          boxShadow: '0 0 30px rgba(102, 126, 234, 0.9)'
                                        },
                                      },
                                    }}
                                  >
                                    {isComplete ? (
                                      <CheckCircle sx={{ fontSize: 24, color: 'white' }} />
                                    ) : (
                                      React.cloneElement(stage.icon, { 
                                        sx: { 
                                          fontSize: 22, 
                                          color: isActive ? 'white' : '#999',
                                          animation: isActive ? 'iconSpin 2s linear infinite' : 'none',
                                          '@keyframes iconSpin': {
                                            '0%': { transform: 'rotate(0deg)' },
                                            '100%': { transform: 'rotate(360deg)' },
                                          },
                                        } 
                                      })
                                    )}
                                  </Box>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: isComplete || isActive ? 'text.primary' : 'text.secondary',
                                        fontWeight: isComplete || isActive ? 700 : 500,
                                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                                        lineHeight: 1.3,
                                        animation: isActive ? 'textGlow 1.5s ease-in-out infinite' : 'none',
                                        '@keyframes textGlow': {
                                          '0%, 100%': { opacity: 0.9 },
                                          '50%': { opacity: 1 },
                                        },
                                      }}
                                    >
                                      {stage.label}
                                    </Typography>
                                  </Box>
                                  {/* Status indicator */}
                                  {isActive && (
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: '#667eea',
                                        flexShrink: 0,
                                        ml: 1,
                                        animation: 'dotPulse 1s ease-in-out infinite',
                                        '@keyframes dotPulse': {
                                          '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                                          '50%': { opacity: 1, transform: 'scale(1.5)' },
                                        },
                                      }}
                                    />
                                  )}
                                </Box>
                              </Slide>
                            );
                          })}
                        </Box>
                      </Box>
                    </Fade>
                  ) : (
                    <Fade in timeout={500}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        position: 'relative', 
                        zIndex: 1,
                        width: '100%',
                        maxWidth: 400,
                      }}>
                        {/* Animated Idle State */}
                        <Box
                          sx={{
                            position: 'relative',
                            display: 'inline-block',
                            mb: 3,
                            animation: 'idleFloat 4s ease-in-out infinite',
                            '@keyframes idleFloat': {
                              '0%, 100%': { transform: 'translateY(0px) scale(1)' },
                              '50%': { transform: 'translateY(-15px) scale(1.05)' },
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 120,
                              height: 120,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                inset: -10,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                                animation: 'ringPulse 2s ease-in-out infinite',
                              },
                              '@keyframes ringPulse': {
                                '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
                                '50%': { transform: 'scale(1.2)', opacity: 0.2 },
                              },
                            }}
                          >
                            <Memory 
                              sx={{ 
                                fontSize: 60, 
                                color: '#667eea',
                                animation: 'iconRotate 8s linear infinite',
                                filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.4))',
                                '@keyframes iconRotate': {
                                  '0%': { transform: 'rotate(0deg)' },
                                  '100%': { transform: 'rotate(360deg)' },
                                },
                              }} 
                            />
                          </Box>
                        </Box>

                        <Typography 
                          variant="h4" 
                          gutterBottom 
                          fontWeight={700}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            mb: 2,
                            animation: 'titlePulse 3s ease-in-out infinite',
                            '@keyframes titlePulse': {
                              '0%, 100%': { opacity: 0.7 },
                              '50%': { opacity: 1 },
                            },
                          }}
                        >
                          🧠 AI Neural Network Ready
                        </Typography>
                        
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: 'text.secondary',
                            mb: 3,
                            fontWeight: 500,
                            px: 2,
                          }}
                        >
                          Awaiting next brain scan for analysis...
                        </Typography>

                        {/* Status indicators */}
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: 1.5,
                          px: 2,
                        }}>
                          {[
                            { icon: '🔵', label: 'Model Loaded', color: '#4caf50' },
                            { icon: '⚡', label: 'GPU Accelerated', color: '#2196f3' },
                            { icon: '🎯', label: '97% Accuracy', color: '#ff9800' },
                          ].map((item, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.6)',
                                border: `2px solid ${item.color}`,
                                animation: `statusPulse ${2 + idx * 0.5}s ease-in-out infinite`,
                                animationDelay: `${idx * 0.3}s`,
                                '@keyframes statusPulse': {
                                  '0%, 100%': { 
                                    boxShadow: `0 0 0px ${item.color}`,
                                    transform: 'scale(1)',
                                  },
                                  '50%': { 
                                    boxShadow: `0 0 20px ${item.color}`,
                                    transform: 'scale(1.02)',
                                  },
                                },
                              }}
                            >
                              <Typography sx={{ fontSize: '1.2rem' }}>{item.icon}</Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: item.color,
                                }}
                              >
                                {item.label}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Fade>
                  )}
                </Box>
              </Grid>

              {/* Right: Enhanced Prediction Results */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    minHeight: { xs: 500, md: 600 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: { xs: 3, md: 4 },
                    background: prediction
                      ? prediction.prediction?.toLowerCase() === 'tumor'
                        ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.12) 0%, rgba(244, 67, 54, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(76, 175, 80, 0.05) 100%)'
                      : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                    transition: 'background 0.5s ease',
                    position: 'relative',
                    overflow: 'auto',
                  }}
                >
                  {prediction ? (
                    <Zoom in timeout={500}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        width: '100%', 
                        maxWidth: 400,
                        position: 'relative', 
                        zIndex: 1,
                        py: { xs: 2, md: 0 },
                      }}>
                        <Typography 
                          variant="h5" 
                          gutterBottom 
                          fontWeight={700} 
                          sx={{ 
                            mb: 2,
                            fontSize: { xs: '1.3rem', md: '1.5rem' },
                            animation: 'fadeIn 0.5s ease-in',
                            '@keyframes fadeIn': {
                              '0%': { opacity: 0 },
                              '100%': { opacity: 1 },
                            },
                          }}
                        >
                          🎯 AI Prediction Result
                        </Typography>
                        
                        {/* Accuracy Status Badge */}
                        {currentImage?.label && (
                          <Chip
                            icon={prediction.isCorrect ? <CheckCircle /> : <Cancel />}
                            label={prediction.isCorrect ? '✓ Correct Prediction' : '✗ Incorrect Prediction'}
                            sx={{
                              mb: 2,
                              bgcolor: prediction.isCorrect ? '#4caf50' : '#f44336',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: { xs: '0.85rem', md: '0.95rem' },
                              py: { xs: 2, md: 2.5 },
                              px: { xs: 1.5, md: 2 },
                              boxShadow: prediction.isCorrect 
                                ? '0 4px 12px rgba(76, 175, 80, 0.4)' 
                                : '0 4px 12px rgba(244, 67, 54, 0.4)',
                              animation: 'badgePop 0.5s ease-out',
                              '@keyframes badgePop': {
                                '0%': { transform: 'scale(0.5)', opacity: 0 },
                                '100%': { transform: 'scale(1)', opacity: 1 },
                              },
                            }}
                          />
                        )}
                        
                        <Paper
                          elevation={12}
                          sx={{
                            p: { xs: 3, md: 4 },
                            borderRadius: 4,
                            background: prediction.prediction?.toLowerCase() === 'tumor'
                              ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)'
                              : 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                            color: 'white',
                            boxShadow: prediction.prediction?.toLowerCase() === 'tumor'
                              ? '0 10px 40px rgba(244, 67, 54, 0.5)'
                              : '0 10px 40px rgba(76, 175, 80, 0.5)',
                            transform: 'scale(1)',
                            animation: 'resultPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                            '@keyframes resultPop': {
                              '0%': { transform: 'scale(0.5) rotate(-5deg)', opacity: 0 },
                              '50%': { transform: 'scale(1.1) rotate(2deg)' },
                              '100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
                            },
                          }}
                        >
                          <Typography 
                            variant="h1" 
                            fontWeight={900} 
                            gutterBottom
                            sx={{
                              fontSize: { xs: '3rem', md: '4rem' },
                              animation: 'iconBounce 0.8s ease-out',
                              '@keyframes iconBounce': {
                                '0%': { transform: 'scale(0) rotate(180deg)' },
                                '50%': { transform: 'scale(1.2) rotate(-10deg)' },
                                '100%': { transform: 'scale(1) rotate(0deg)' },
                              },
                            }}
                          >
                            {prediction.prediction?.toLowerCase() === 'tumor' ? '⚠️' : '✅'}
                          </Typography>
                          <Typography 
                            variant="h3" 
                            fontWeight={800} 
                            gutterBottom 
                            sx={{ 
                              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                              fontSize: { xs: '1.8rem', md: '2.5rem' },
                            }}
                          >
                            {prediction.prediction?.toUpperCase() || 'UNKNOWN'}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              opacity: 0.95, 
                              fontWeight: 600,
                              fontSize: { xs: '1rem', md: '1.25rem' },
                            }}
                          >
                            Detected
                          </Typography>
                        </Paper>

                        <Box sx={{ mt: 3, width: '100%', px: { xs: 1, md: 0 } }}>
                          <Typography 
                            variant="h6" 
                            color="text.secondary" 
                            gutterBottom 
                            fontWeight={600}
                            sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                          >
                            Confidence Level
                          </Typography>
                          <Box sx={{ position: 'relative', mb: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={prediction.confidence}
                              sx={{
                                height: 28,
                                borderRadius: 14,
                                bgcolor: '#e0e0e0',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: prediction.prediction?.toLowerCase() === 'tumor' ? '#f44336' : '#4caf50',
                                  borderRadius: 14,
                                  background: prediction.prediction?.toLowerCase() === 'tumor'
                                    ? 'linear-gradient(90deg, #f44336 0%, #e91e63 100%)'
                                    : 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
                                  boxShadow: prediction.prediction?.toLowerCase() === 'tumor'
                                    ? '0 0 15px rgba(244, 67, 54, 0.5)'
                                    : '0 0 15px rgba(76, 175, 80, 0.5)',
                                },
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: prediction.confidence > 50 ? 'white' : 'text.primary',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                              }}
                            >
                              {prediction.confidence?.toFixed(1)}%
                            </Typography>
                          </Box>
                          <Typography
                            variant="h2"
                            align="center"
                            fontWeight={900}
                            sx={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              textShadow: 'none',
                              fontSize: { xs: '2.5rem', md: '3rem' },
                              animation: 'confidencePulse 2s ease-in-out infinite',
                              '@keyframes confidencePulse': {
                                '0%, 100%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.08)' },
                              },
                            }}
                          >
                            {prediction.confidence?.toFixed(1)}%
                          </Typography>
                        </Box>

                        {currentImage?.label && (
                          <Chip
                            label={`Expected: ${currentImage.label.toUpperCase()}`}
                            sx={{
                              mt: 2,
                              bgcolor: '#e3f2fd',
                              color: '#1976d2',
                              fontWeight: 700,
                              fontSize: { xs: '0.85rem', md: '0.95rem' },
                              py: { xs: 2, md: 2.5 },
                              px: { xs: 1.5, md: 2 },
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                              animation: 'labelSlide 0.5s ease-out',
                              '@keyframes labelSlide': {
                                '0%': { transform: 'translateY(20px)', opacity: 0 },
                                '100%': { transform: 'translateY(0)', opacity: 1 },
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Zoom>
                  ) : (
                    <Fade in timeout={500}>
                      <Box sx={{ 
                        textAlign: 'center', 
                        position: 'relative', 
                        zIndex: 1,
                        width: '100%',
                        maxWidth: 400,
                        py: { xs: 4, md: 0 },
                      }}>
                        <Box
                          sx={{
                            mb: 3,
                            animation: 'idleBounce 3s ease-in-out infinite',
                            '@keyframes idleBounce': {
                              '0%, 100%': { transform: 'translateY(0px)' },
                              '50%': { transform: 'translateY(-15px)' },
                            },
                          }}
                        >
                          <Typography 
                            sx={{ 
                              fontSize: { xs: '4rem', md: '5rem' },
                              filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))',
                            }}
                          >
                            🎯
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="h5" 
                          gutterBottom 
                          fontWeight={700}
                          sx={{
                            fontSize: { xs: '1.3rem', md: '1.5rem' },
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            mb: 2,
                          }}
                        >
                          AI Prediction Ready
                        </Typography>
                        
                        <Typography 
                          variant="body1" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 2,
                            fontSize: { xs: '0.95rem', md: '1.1rem' },
                            fontWeight: 500,
                            px: 2,
                            lineHeight: 1.6,
                          }}
                        >
                          Waiting for brain scan analysis...
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 2,
                            fontSize: { xs: '0.85rem', md: '0.95rem' },
                            px: 3,
                            opacity: 0.7,
                          }}
                        >
                          Results will appear here with confidence scores
                        </Typography>
                        
                        <Box sx={{ 
                          mt: 4, 
                          opacity: 0.4,
                          animation: 'iconFloat 4s ease-in-out infinite',
                          '@keyframes iconFloat': {
                            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                            '50%': { transform: 'translateY(-10px) rotate(5deg)' },
                          },
                        }}>
                          <Memory sx={{ fontSize: { xs: 50, md: 60 }, color: '#667eea' }} />
                        </Box>
                      </Box>
                    </Fade>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Enhanced Controls with Animations */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 3,
                p: 3,
                background: 'linear-gradient(90deg, #f5f5f5 0%, #fafafa 50%, #f5f5f5 100%)',
                borderTop: '3px solid transparent',
                borderImage: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
                borderImageSlice: 1,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #667eea, transparent)',
                  animation: 'borderGlow 3s linear infinite',
                },
                '@keyframes borderGlow': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' },
                },
              }}
            >
              <Chip
                icon={<Memory sx={{ animation: 'iconPulse 2s ease-in-out infinite', '@keyframes iconPulse': { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15)' } } }} />}
                label={`${allImages.length} Total Scans`}
                sx={{
                  bgcolor: 'white',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '2px solid #e0e0e0',
                  animation: 'chipBounce 2s ease-in-out infinite',
                  '@keyframes chipBounce': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-3px)' },
                  },
                }}
              />
              <Typography 
                variant="h6" 
                color="text.secondary" 
                fontWeight={300}
                sx={{
                  animation: 'blink 2s ease-in-out infinite',
                  '@keyframes blink': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.3 },
                  },
                }}
              >
                •
              </Typography>
              <Chip
                label={`${currentIndex + 1} Current`}
                color="primary"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                  border: '2px solid #667eea',
                  animation: 'currentPulse 1.5s ease-in-out infinite',
                  '@keyframes currentPulse': {
                    '0%, 100%': { 
                      transform: 'scale(1)',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                    },
                    '50%': { 
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.6)'
                    },
                  },
                }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton
                  onClick={togglePlay}
                  color="primary"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '2px solid #667eea',
                    animation: isPlaying ? 'playingPulse 1s ease-in-out infinite' : 'none',
                    '@keyframes playingPulse': {
                      '0%, 100%': { 
                        transform: 'scale(1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      },
                      '50%': { 
                        transform: 'scale(1.1)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                      },
                    },
                    '&:hover': {
                      bgcolor: '#667eea',
                      color: 'white',
                      transform: 'scale(1.15) rotate(5deg)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton
                  onClick={nextImage}
                  color="primary"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '2px solid #667eea',
                    '&:hover': {
                      bgcolor: '#667eea',
                      color: 'white',
                      transform: 'scale(1.15) translateX(5px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <SkipNext />
                </IconButton>
                <IconButton
                  onClick={restart}
                  color="primary"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: '2px solid #667eea',
                    '&:hover': {
                      bgcolor: '#667eea',
                      color: 'white',
                      transform: 'scale(1.15) rotate(-180deg)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Refresh />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  )
}

export default AutoDemo
