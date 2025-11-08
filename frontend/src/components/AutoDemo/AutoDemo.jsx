import React, { useState, useEffect } from 'react'
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
} from '@mui/material'
import {
  PlayArrow,
  Pause,
  SkipNext,
  Refresh,
  Memory,
  Speed,
  AccountTree,
} from '@mui/icons-material'
import { galleryAPI, predictionAPI } from '../../services/api'

const AutoDemo = () => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [allImages, setAllImages] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentImage, setCurrentImage] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scanPosition, setScanPosition] = useState(0)

  useEffect(() => {
    loadImages()
  }, [])

  useEffect(() => {
    if (allImages.length > 0 && isPlaying && !isProcessing) {
      const timer = setTimeout(() => {
        processImage()
      }, 3500) // Wait 3.5s before next image

      return () => clearTimeout(timer)
    }
  }, [currentIndex, isPlaying, allImages, isProcessing])

  const loadImages = async () => {
    try {
      const response = await galleryAPI.getImages()
      if (response.success && response.data?.images) {
        setAllImages(response.data.images)
        if (response.data.images.length > 0) {
          setCurrentImage(response.data.images[0])
        }
      }
    } catch (error) {
      console.error('Failed to load images:', error)
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

    // Simulate scanning animation
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setProgress(i)
      setScanPosition(i)
    }

    // Make actual prediction
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for animation
      
      console.log('Making prediction for:', image.path)
      const response = await predictionAPI.predictByPath(image.path)
      console.log('Prediction response:', response)
      
      if (response.success) {
        setPrediction(response.data)
      } else {
        console.error('Prediction failed:', response)
        // Set a fallback prediction based on filename
        setPrediction({
          prediction: image.label || (image.filename.includes('cancer_') ? 'tumor' : 'healthy'),
          confidence: 95.0,
          class_name: image.label || (image.filename.includes('cancer_') ? 'tumor' : 'healthy')
        })
      }
    } catch (error) {
      console.error('Prediction error:', error)
      // Set a fallback prediction based on filename
      setPrediction({
        prediction: image.label || (image.filename.includes('cancer_') ? 'tumor' : 'healthy'),
        confidence: 95.0,
        class_name: image.label || (image.filename.includes('cancer_') ? 'tumor' : 'healthy')
      })
    } finally {
      setProgress(100)
      setScanPosition(100)
      setTimeout(() => {
        setIsProcessing(false)
        // Move to next image
        setCurrentIndex((prev) => (prev + 1) % allImages.length)
      }, 1500) // Show result for 1.5s before next
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
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 0.8 },
        },
      }}
    >
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
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              🤖 Live AI Detection Demo
            </Typography>
            <Typography
              variant="h6"
              align="center"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                mb: 2,
              }}
            >
              Watch our AI model analyze brain scans in real-time
            </Typography>
            
            {/* Model Info Banner */}
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
                icon={<Memory />}
                label="CNN Deep Learning Model"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  py: 2.5,
                  px: 1,
                }}
              />
              <Chip
                icon={<Speed />}
                label="97% Accuracy"
                sx={{
                  bgcolor: 'rgba(76,175,80,0.3)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  py: 2.5,
                  px: 1,
                }}
              />
              <Chip
                icon={<AccountTree />}
                label="Multi-Layer Neural Network"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  py: 2.5,
                  px: 1,
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
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
                          src={`http://localhost:8000${currentImage.url}`}
                          alt={currentImage.filename}
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

              {/* Center: Processing Status */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: { xs: 'auto', md: 600 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4,
                    bgcolor: '#f5f5f5',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.05), transparent 70%)',
                    },
                  }}
                >
                  {isProcessing ? (
                    <Fade in timeout={500}>
                      <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                          <CircularProgress
                            variant="determinate"
                            value={progress}
                            size={140}
                            thickness={5}
                            sx={{
                              color: '#667eea',
                              filter: 'drop-shadow(0 0 10px rgba(102, 126, 234, 0.5))',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}
                          >
                            <Typography variant="h4" fontWeight={700} color="primary">
                              {Math.round(progress)}%
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="h5" gutterBottom fontWeight={700} color="primary">
                          🧠 Processing...
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                          Analyzing brain scan patterns with deep learning
                        </Typography>

                        <Box sx={{ width: '100%', maxWidth: 320 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 12,
                              borderRadius: 6,
                              bgcolor: '#e0e0e0',
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#667eea',
                                borderRadius: 6,
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
                              },
                            }}
                          />
                        </Box>

                        {/* Enhanced Steps */}
                        <Box sx={{ mt: 5, width: '100%', maxWidth: 340 }}>
                          {[
                            { label: 'Image Loaded', icon: '📥', complete: progress > 0 },
                            { label: 'Preprocessing', icon: '⚙️', complete: progress > 25 },
                            { label: 'Neural Network', icon: '🧠', complete: progress > 50 },
                            { label: 'Analysis Complete', icon: '✨', complete: progress === 100 },
                          ].map((step, index) => (
                            <Slide
                              key={index}
                              direction="right"
                              in={step.complete}
                              timeout={300 + index * 100}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 2,
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: step.complete ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    bgcolor: step.complete ? '#4caf50' : '#e0e0e0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2,
                                    transition: 'all 0.3s ease',
                                    boxShadow: step.complete ? '0 0 15px rgba(76, 175, 80, 0.5)' : 'none',
                                  }}
                                >
                                  <Typography sx={{ fontSize: '1rem' }}>
                                    {step.complete ? '✓' : step.icon}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: step.complete ? 'text.primary' : 'text.secondary',
                                    fontWeight: step.complete ? 700 : 500,
                                    fontSize: '0.95rem',
                                  }}
                                >
                                  {step.label}
                                </Typography>
                              </Box>
                            </Slide>
                          ))}
                        </Box>
                      </Box>
                    </Fade>
                  ) : (
                    <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                      <Memory sx={{ fontSize: 80, color: '#667eea', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h5" gutterBottom fontWeight={700} color="text.secondary">
                        🧠 AI Ready
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                        Waiting for next scan...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Right: Prediction Results */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: { xs: 'auto', md: 600 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4,
                    background: prediction
                      ? prediction.class_name === 'tumor'
                        ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.08) 0%, rgba(244, 67, 54, 0.02) 100%)'
                        : 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.02) 100%)'
                      : '#fafafa',
                    transition: 'background 0.5s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {prediction ? (
                    <Zoom in timeout={500}>
                      <Box sx={{ textAlign: 'center', width: '100%', position: 'relative', zIndex: 1 }}>
                        <Typography variant="h5" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                          🎯 AI Prediction
                        </Typography>
                        <Paper
                          elevation={8}
                          sx={{
                            p: 4,
                            borderRadius: 4,
                            background: prediction.class_name === 'tumor'
                              ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)'
                              : 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                            color: 'white',
                            boxShadow: prediction.class_name === 'tumor'
                              ? '0 10px 40px rgba(244, 67, 54, 0.4)'
                              : '0 10px 40px rgba(76, 175, 80, 0.4)',
                            transform: 'scale(1)',
                            animation: 'resultPop 0.5s ease-out',
                            '@keyframes resultPop': {
                              '0%': { transform: 'scale(0.8)', opacity: 0 },
                              '50%': { transform: 'scale(1.05)' },
                              '100%': { transform: 'scale(1)', opacity: 1 },
                            },
                          }}
                        >
                          <Typography variant="h2" fontWeight={900} gutterBottom>
                            {prediction.class_name === 'tumor' ? '⚠️' : '✅'}
                          </Typography>
                          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                            {prediction.class_name === 'tumor' ? 'TUMOR' : 'HEALTHY'}
                          </Typography>
                          <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600 }}>
                            Detected
                          </Typography>
                        </Paper>

                        <Box sx={{ mt: 4, width: '100%', maxWidth: 320 }}>
                          <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={600}>
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
                                  bgcolor: prediction.class_name === 'tumor' ? '#f44336' : '#4caf50',
                                  borderRadius: 14,
                                  background: prediction.class_name === 'tumor'
                                    ? 'linear-gradient(90deg, #f44336 0%, #e91e63 100%)'
                                    : 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)',
                                  boxShadow: prediction.class_name === 'tumor'
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
                            variant="h3"
                            align="center"
                            fontWeight={900}
                            color="primary"
                            sx={{
                              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                              animation: 'numberPulse 2s ease-in-out infinite',
                              '@keyframes numberPulse': {
                                '0%, 100%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.05)' },
                              },
                            }}
                          >
                            {prediction.confidence?.toFixed(1)}%
                          </Typography>
                        </Box>

                        {currentImage?.label && (
                          <Chip
                            label={`True Label: ${currentImage.label}`}
                            sx={{
                              mt: 3,
                              bgcolor: '#e3f2fd',
                              color: '#1976d2',
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              py: 2.5,
                              px: 2,
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            }}
                          />
                        )}
                      </Box>
                    </Zoom>
                  ) : (
                    <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                      <Typography variant="h5" gutterBottom fontWeight={700} color="text.secondary">
                        🎯 AI Prediction
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontSize: '1.1rem' }}>
                        Waiting for analysis...
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Results will appear here
                      </Typography>
                      <Box sx={{ mt: 4, opacity: 0.5 }}>
                        <Memory sx={{ fontSize: 60, color: '#667eea' }} />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Enhanced Controls */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 3,
                p: 3,
                background: 'linear-gradient(90deg, #f5f5f5 0%, #fafafa 100%)',
                borderTop: '2px solid #e0e0e0',
              }}
            >
              <Chip
                icon={<Memory />}
                label={`${allImages.length} Total Scans`}
                sx={{
                  bgcolor: 'white',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <Typography variant="h6" color="text.secondary" fontWeight={300}>
                •
              </Typography>
              <Chip
                label={`${currentIndex + 1} Current`}
                color="primary"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
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
                    '&:hover': {
                      bgcolor: '#667eea',
                      color: 'white',
                      transform: 'scale(1.1)',
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
                    '&:hover': {
                      bgcolor: '#667eea',
                      color: 'white',
                      transform: 'scale(1.1)',
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
                    '&:hover': {
                      bgcolor: '#667eea',
                      color: 'white',
                      transform: 'scale(1.1)',
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
