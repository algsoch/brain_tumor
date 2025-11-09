import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  LinearProgress,
  IconButton,
  Fade,
  Zoom,
  Slide,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline'
import MemoryIcon from '@mui/icons-material/Memory'
import SpeedIcon from '@mui/icons-material/Speed'
import ScienceIcon from '@mui/icons-material/Science'
import RadarIcon from '@mui/icons-material/Radar'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import api, { galleryAPI, predictionAPI, precomputedAPI } from '../../services/api'

const LiveDemo = () => {
  const [demoImages, setDemoImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prediction, setPrediction] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'correct', 'incorrect'
  const [predictions, setPredictions] = useState({}) // Store all predictions by filename
  const [moviePlaying, setMoviePlaying] = useState(false)
  const [movieIndex, setMovieIndex] = useState(0)
  const [movieImages, setMovieImages] = useState({ correct: [], incorrect: [] })
  const [loadingMovie, setLoadingMovie] = useState(true)
  const [movieProgress, setMovieProgress] = useState({ current: 0, total: 0 })
  
  // New animation states
  const [scanningStage, setScanningStage] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const scanningStages = [
    { label: 'Initializing Neural Network...', icon: <MemoryIcon />, duration: 600 },
    { label: 'Preprocessing MRI Image...', icon: <ScienceIcon />, duration: 800 },
    { label: 'Extracting Features...', icon: <RadarIcon />, duration: 1000 },
    { label: 'Analyzing Brain Structure...', icon: <AnalyticsIcon />, duration: 1200 },
    { label: 'Running Deep Learning Model...', icon: <MemoryIcon />, duration: 1400 },
    { label: 'Computing Confidence Scores...', icon: <SpeedIcon />, duration: 800 },
  ]

  useEffect(() => {
    loadDemoImages()
    loadMovieImages()
  }, [])
  
  // Movie autoplay effect
  useEffect(() => {
    if (moviePlaying) {
      const interval = setInterval(() => {
        setMovieIndex(prev => prev + 1)
      }, 2000) // Change image every 2 seconds
      return () => clearInterval(interval)
    }
  }, [moviePlaying])

  // Scanning stage progression effect
  useEffect(() => {
    if (predicting && scanningStage < scanningStages.length) {
      const timer = setTimeout(() => {
        setScanningStage(prev => prev + 1)
      }, scanningStages[scanningStage].duration)
      return () => clearTimeout(timer)
    }
  }, [predicting, scanningStage])

  // Analysis progress animation
  useEffect(() => {
    if (predicting) {
      const totalDuration = scanningStages.reduce((sum, stage) => sum + stage.duration, 0)
      const incrementInterval = 50
      const incrementPerStep = 100 / (totalDuration / incrementInterval)
      
      const timer = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + incrementPerStep, 100))
      }, incrementInterval)
      
      return () => clearInterval(timer)
    } else {
      setAnalysisProgress(0)
      setScanningStage(0)
    }
  }, [predicting])

  const loadDemoImages = async () => {
    try {
      setLoading(true)
      // Load more images for better demo
      const response = await galleryAPI.getImages({ page: 1, page_size: 20 })
      setDemoImages(response.data.images)
    } catch (err) {
      console.error('Error loading demo images:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const loadMovieImages = async () => {
    try {
      setLoadingMovie(true)
      console.log('Loading precomputed predictions from CSV...')
      
      // Get precomputed predictions from backend (reads from CSV)
      const response = await precomputedAPI.getPredictions()
      
      if (response.success) {
        const { correct, incorrect } = response.data
        
        console.log(`✅ Loaded from backend: ${correct.length} correct, ${incorrect.length} incorrect predictions`)
        console.log('Backend already filtered to only existing images!')
        
        // Backend already filters predictions to match available images
        // No need to fetch gallery and match - just use the predictions directly
        
        // Match predictions with available images (now pre-filtered by backend)
        // Backend already filters to only return predictions for existing images
        const matchedCorrect = correct
          .slice(0, 14)  // Take up to 14 correct
          .map(pred => ({
            filename: pred.filename,
            path: pred.filename,
            label: pred.label,
            prediction: pred.prediction,
            confidence: pred.confidence,
            isCorrect: pred.isCorrect,
            url: `/api/gallery/image/${pred.filename}`
          }))
        
        const matchedIncorrect = incorrect
          .slice(0, 14)  // Take up to 14 incorrect (or all if less than 14)
          .map(pred => ({
            filename: pred.filename,
            path: pred.filename,
            label: pred.label,
            prediction: pred.prediction,
            confidence: pred.confidence,
            isCorrect: pred.isCorrect,
            url: `/api/gallery/image/${pred.filename}`
          }))
        
        console.log(`✅ Using: ${matchedCorrect.length} correct, ${matchedIncorrect.length} incorrect predictions`)
        setMovieImages({ correct: matchedCorrect, incorrect: matchedIncorrect })
      }
    } catch (err) {
      console.error('Error loading precomputed predictions:', err)
      // Fallback to old method if CSV loading fails
      console.warn('Falling back to real-time predictions...')
      await loadMovieImagesRealtime()
    } finally {
      setLoadingMovie(false)
    }
  }
  
  // Fallback method - real-time predictions (old code)
  const loadMovieImagesRealtime = async () => {
    try {
      const response = await galleryAPI.getImages({ page: 1, page_size: 100 })
      const images = response.data.images
      
      setMovieProgress({ current: 0, total: images.length })
      
      const correctPreds = []
      const incorrectPreds = []
      
      console.log(`Starting real-time predictions for ${images.length} images...`)
      
      for (let i = 0; i < images.length; i++) {
        if (correctPreds.length >= 14 && incorrectPreds.length >= 14) break
        
        const image = images[i]
        setMovieProgress({ current: i + 1, total: images.length })
        
        try {
          const imageResponse = await api.get(`/api/gallery/image/${image.path}`, {
            responseType: 'blob'
          })
          const blob = imageResponse.data
          const file = new File([blob], image.filename, { type: blob.type || 'image/jpeg' })
          const result = await predictionAPI.predictImage(file)
          
          const isCorrect = result.data.prediction.toLowerCase() === image.label.toLowerCase()
          const predData = {
            ...image,
            prediction: result.data.prediction,
            confidence: result.data.confidence,
            isCorrect
          }
          
          if (isCorrect && correctPreds.length < 14) {
            correctPreds.push(predData)
          } else if (!isCorrect && incorrectPreds.length < 14) {
            incorrectPreds.push(predData)
          }
        } catch (err) {
          console.error('Error predicting image:', err)
        }
      }
      
      console.log(`Final results: ${correctPreds.length} correct, ${incorrectPreds.length} incorrect`)
      setMovieImages({ correct: correctPreds, incorrect: incorrectPreds })
    } catch (err) {
      console.error('Error in real-time predictions:', err)
    }
  }

  const runPrediction = async () => {
    if (!demoImages[currentIndex]) return

    setPredicting(true)
    setPrediction(null)

    try {
      const image = demoImages[currentIndex]
      
      // Wait for scanning animation to complete FIRST
      const totalDuration = scanningStages.reduce((sum, stage) => sum + stage.duration, 0)
      console.log('🎬 Starting animation sequence...')
      await new Promise(resolve => setTimeout(resolve, totalDuration))
      
      // NOW fetch image as blob
      console.log('🔄 Fetching image:', image.path)
      const imageResponse = await api.get(`/api/gallery/image/${image.path}`, {
        responseType: 'blob'
      })
      
      const blob = imageResponse.data
      const file = new File([blob], image.filename, { type: blob.type || 'image/jpeg' })

      console.log('📤 Sending to AI model:', file.name)
      
      // Get prediction - result already contains the parsed response
      const result = await predictionAPI.predictImage(file)
      
      console.log('✅ Prediction result:', result.data)
      
      // result is already { success: true, data: {...}, filename: "..." }
      const predResult = {
        ...result.data,
        trueLabel: image.label,
        filename: image.filename,
        isCorrect: result.data.prediction.toLowerCase() === image.label.toLowerCase()
      }
      
      setPrediction(predResult)
      
      // Store prediction for filtering
      setPredictions(prev => ({
        ...prev,
        [image.filename]: predResult
      }))

      // Don't auto-clear - let user see results
    } catch (err) {
      console.error('Prediction error:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Unknown error'
      alert(`Prediction failed: ${errorMsg}\n\nPlease ensure:\n1. Backend server is running on port 8000\n2. Model file is loaded correctly\n3. Image is a valid JPG/PNG file`)
    } finally {
      setPredicting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  const currentImage = demoImages[currentIndex]
  
  // Calculate statistics
  const totalPredictions = Object.keys(predictions).length
  const correctPredictions = Object.values(predictions).filter(p => p.isCorrect).length
  const incorrectPredictions = totalPredictions - correctPredictions
  const accuracy = totalPredictions > 0 ? ((correctPredictions / totalPredictions) * 100).toFixed(1) : 0

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom fontWeight="600" color="primary">
          🔬 Live Demo - Real-Time Prediction
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 2 }}>
          Watch our AI model analyze brain MRI scans in real-time
        </Typography>
        
        {/* Statistics */}
        {totalPredictions > 0 && (
          <Grid container spacing={2} sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {totalPredictions}
                </Typography>
                <Typography variant="caption">Total Tested</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {correctPredictions}
                </Typography>
                <Typography variant="caption">Correct</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {incorrectPredictions}
                </Typography>
                <Typography variant="caption">Incorrect</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {accuracy}%
                </Typography>
                <Typography variant="caption">Accuracy</Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        <Grid container spacing={4} alignItems="center">
          {/* Image Display with Scanning Animation */}
          <Grid item xs={12} md={6}>
            <Paper elevation={6} sx={{ overflow: 'hidden', borderRadius: 3, position: 'relative' }}>
              {currentImage && (
                <>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="500"
                      image={galleryAPI.getImageUrl(currentImage.path)}
                      alt={currentImage.filename}
                      sx={{
                        objectFit: 'contain',
                        bgcolor: '#000',
                        p: 2,
                      }}
                    />
                    
                    {/* Scanning Animation Overlay */}
                    {predicting && (
                      <>
                        {/* Scanning line that moves across the image */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, transparent, #667eea, transparent)',
                            boxShadow: '0 0 20px #667eea, 0 0 40px #667eea',
                            animation: 'scanDown 5.8s linear infinite',
                            '@keyframes scanDown': {
                              '0%': { top: '0%' },
                              '100%': { top: '100%' },
                            },
                          }}
                        />
                        
                        {/* Pulsing border effect */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            border: '3px solid #667eea',
                            borderRadius: 1,
                            animation: 'borderPulse 2s ease-in-out infinite',
                            pointerEvents: 'none',
                            '@keyframes borderPulse': {
                              '0%, 100%': { 
                                borderColor: 'rgba(102, 126, 234, 0.3)',
                                boxShadow: '0 0 10px rgba(102, 126, 234, 0.3)',
                              },
                              '50%': { 
                                borderColor: 'rgba(102, 126, 234, 1)',
                                boxShadow: '0 0 30px rgba(102, 126, 234, 0.8)',
                              },
                            },
                          }}
                        />
                        
                        {/* Corner indicators */}
                        {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map((corner) => (
                          <Box
                            key={corner}
                            sx={{
                              position: 'absolute',
                              width: 20,
                              height: 20,
                              border: '3px solid #667eea',
                              ...(corner === 'topLeft' && { top: 8, left: 8, borderRight: 'none', borderBottom: 'none' }),
                              ...(corner === 'topRight' && { top: 8, right: 8, borderLeft: 'none', borderBottom: 'none' }),
                              ...(corner === 'bottomLeft' && { bottom: 8, left: 8, borderRight: 'none', borderTop: 'none' }),
                              ...(corner === 'bottomRight' && { bottom: 8, right: 8, borderLeft: 'none', borderTop: 'none' }),
                              animation: 'cornerPulse 1.5s ease-in-out infinite',
                              animationDelay: `${corner === 'topRight' ? '0.2s' : corner === 'bottomLeft' ? '0.4s' : corner === 'bottomRight' ? '0.6s' : '0s'}`,
                              '@keyframes cornerPulse': {
                                '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                                '50%': { opacity: 1, transform: 'scale(1.2)' },
                              },
                            }}
                          />
                        ))}
                        
                        {/* AI Processing indicator overlay */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                          }}
                        >
                          <CircularProgress size={24} sx={{ color: '#667eea' }} />
                          <Typography variant="body2" fontWeight={600}>
                            AI Scanning...
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                  
                  <CardContent sx={{ bgcolor: 'white' }}>
                    <Typography variant="caption" display="block" gutterBottom>
                      Sample {currentIndex + 1} of {demoImages.length}
                    </Typography>
                    <Typography variant="body2" fontWeight="600" noWrap>
                      {currentImage.filename}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={`True Label: ${currentImage.label}`}
                        color={currentImage.label === 'tumor' ? 'error' : 'success'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </>
              )}
            </Paper>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<PlayArrowIcon />}
                onClick={runPrediction}
                disabled={predicting || !currentImage}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  py: 1.5,
                }}
              >
                {predicting ? 'Analyzing...' : 'Run Prediction'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setPrediction(null)
                  setCurrentIndex((prev) => (prev + 1) % demoImages.length)
                }}
                disabled={predicting}
              >
                Next
              </Button>
            </Box>
          </Grid>

          {/* Enhanced Prediction Result with Animations */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={6}
              sx={{
                p: { xs: 3, md: 4 },
                minHeight: 550,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                background: predicting 
                  ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                  : prediction
                  ? prediction.isCorrect
                    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(244, 67, 54, 0.08) 0%, rgba(244, 67, 54, 0.02) 100%)'
                  : 'white',
                transition: 'all 0.5s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': predicting ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.1), transparent 70%)',
                  animation: 'bgPulse 3s ease-in-out infinite',
                  '@keyframes bgPulse': {
                    '0%, 100%': { opacity: 0.3 },
                    '50%': { opacity: 0.7 },
                  },
                } : {},
              }}
            >
              {predicting ? (
                <Fade in timeout={300}>
                  <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    {/* Circular Progress */}
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={140}
                        thickness={3}
                        sx={{ color: 'rgba(102, 126, 234, 0.1)', position: 'absolute' }}
                      />
                      <CircularProgress
                        variant="determinate"
                        value={analysisProgress}
                        size={140}
                        thickness={4}
                        sx={{
                          color: '#667eea',
                          filter: 'drop-shadow(0 0 15px rgba(102, 126, 234, 0.6))',
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                          },
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
                          {Math.round(analysisProgress)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h5" gutterBottom fontWeight={700} color="primary">
                      🧠 AI Analyzing...
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Deep learning neural network processing
                    </Typography>

                    {/* Enhanced Progress Bar */}
                    <Box sx={{ width: '100%', mb: 4 }}>
                      <LinearProgress
                        variant="determinate"
                        value={analysisProgress}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          bgcolor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)',
                          },
                        }}
                      />
                    </Box>

                    {/* Scanning Stages */}
                    <Box sx={{ textAlign: 'left' }}>
                      {scanningStages.map((stage, index) => {
                        const isComplete = scanningStage > index
                        const isActive = scanningStage === index
                        
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
                                borderRadius: 2,
                                bgcolor: isComplete
                                  ? 'rgba(76, 175, 80, 0.1)'
                                  : isActive
                                  ? 'rgba(102, 126, 234, 0.15)'
                                  : 'rgba(255, 255, 255, 0.5)',
                                border: isActive ? '2px solid #667eea' : 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: isActive ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none',
                              }}
                            >
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
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
                                  animation: isActive ? 'pulse 1s ease-in-out infinite' : 'none',
                                  '@keyframes pulse': {
                                    '0%, 100%': { transform: 'scale(1)' },
                                    '50%': { transform: 'scale(1.1)' },
                                  },
                                }}
                              >
                                {isComplete ? (
                                  <CheckCircleIcon sx={{ fontSize: 20, color: 'white' }} />
                                ) : (
                                  React.cloneElement(stage.icon, {
                                    sx: { fontSize: 20, color: isActive ? 'white' : '#999' },
                                  })
                                )}
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isComplete || isActive ? 'text.primary' : 'text.secondary',
                                  fontWeight: isComplete || isActive ? 600 : 400,
                                  fontSize: '0.9rem',
                                }}
                              >
                                {stage.label}
                              </Typography>
                            </Box>
                          </Slide>
                        )
                      })}
                    </Box>
                  </Box>
                </Fade>
              ) : prediction ? (
                <Zoom in timeout={500}>
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                      variant="h5" 
                      gutterBottom 
                      fontWeight={700} 
                      sx={{
                        mb: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      ✓ Analysis Complete
                    </Typography>

                    {/* Main Prediction Card */}
                    <Paper
                      elevation={8}
                      sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 3,
                        background: prediction.prediction === 'tumor'
                          ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)'
                          : 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                        color: 'white',
                        textAlign: 'center',
                        animation: 'cardPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        '@keyframes cardPop': {
                          '0%': { transform: 'scale(0.5) rotate(-5deg)', opacity: 0 },
                          '50%': { transform: 'scale(1.05) rotate(2deg)' },
                          '100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
                        },
                      }}
                    >
                      <Typography variant="h2" sx={{ mb: 1, fontSize: '3rem' }}>
                        {prediction.prediction === 'tumor' ? '⚠️' : '✅'}
                      </Typography>
                      <Typography variant="h4" fontWeight={800}>
                        {prediction.prediction.toUpperCase()}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                        Detected with High Confidence
                      </Typography>
                    </Paper>

                    {/* Confidence Score */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body1" gutterBottom fontWeight={600}>
                        Confidence Level:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={prediction.confidence}
                          sx={{
                            flex: 1,
                            height: 20,
                            borderRadius: 10,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 10,
                              background: prediction.confidence > 80
                                ? 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)'
                                : 'linear-gradient(90deg, #ff9800 0%, #f57c00 100%)',
                              boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)',
                            },
                          }}
                        />
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {prediction.confidence.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>

                    {/* Accuracy Check */}
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: prediction.isCorrect ? '#e8f5e9' : '#ffebee',
                        border: `2px solid ${prediction.isCorrect ? '#4caf50' : '#f44336'}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {prediction.isCorrect ? (
                          <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                        ) : (
                          <CancelIcon sx={{ fontSize: 40, color: 'error.main' }} />
                        )}
                        <Box>
                          <Typography variant="h6" fontWeight={700} color={prediction.isCorrect ? 'success.main' : 'error.main'}>
                            {prediction.isCorrect ? '✓ Correct Prediction!' : '✗ Incorrect Prediction'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Expected: <strong>{prediction.trueLabel.toUpperCase()}</strong>
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>

                    {/* Model Info */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: 'rgba(102, 126, 234, 0.08)',
                        borderRadius: 2,
                        borderLeft: '4px solid #667eea',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        <strong>💡 Model Details:</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Real-time prediction using CNN with 97.9% accuracy. Processing time optimized for instant results.
                      </Typography>
                    </Paper>
                  </Box>
                </Zoom>
              ) : (
                <Fade in timeout={500}>
                  <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    <Box
                      sx={{
                        mb: 3,
                        animation: 'float 3s ease-in-out infinite',
                        '@keyframes float': {
                          '0%, 100%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-15px)' },
                        },
                      }}
                    >
                      <Typography variant="h1" sx={{ fontSize: '5rem' }}>
                        🧠
                      </Typography>
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight={600} color="primary">
                      Ready to Analyze
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2, px: 3 }}>
                      Click <strong>"Run Prediction"</strong> to watch our AI model analyze the brain scan in real-time
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      {['Neural Network', 'Deep Learning', '97% Accurate'].map((text, i) => (
                        <Chip
                          key={i}
                          label={text}
                          sx={{
                            m: 0.5,
                            animation: `chipFloat ${2 + i * 0.5}s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`,
                            '@keyframes chipFloat': {
                              '0%, 100%': { transform: 'translateY(0px)' },
                              '50%': { transform: 'translateY(-5px)' },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Fade>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Enhanced Prediction Gallery with Animations */}
      <Box sx={{ mt: 6 }}>
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              fontWeight={700}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 1,
              }}
            >
              🎬 Prediction Gallery - Watch AI in Action
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Explore pre-analyzed brain scans with real AI predictions
            </Typography>
          </Box>
        </Fade>
        
        {/* Correct Predictions Gallery */}
        <Zoom in timeout={600}>
          <Paper 
            elevation={6} 
            sx={{ 
              p: 4, 
              mb: 4, 
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.02) 100%)',
              border: '2px solid rgba(76, 175, 80, 0.2)',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 10% 20%, rgba(76, 175, 80, 0.05), transparent 50%)',
                pointerEvents: 'none',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                    animation: 'iconPulse 2s ease-in-out infinite',
                    '@keyframes iconPulse': {
                      '0%, 100%': { transform: 'scale(1)', boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)' },
                      '50%': { transform: 'scale(1.05)', boxShadow: '0 6px 30px rgba(76, 175, 80, 0.5)' },
                    },
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    ✓ Correct Predictions ({movieImages.correct.length})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI successfully identified these brain scans
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={() => setMoviePlaying(!moviePlaying)}
                sx={{ 
                  bgcolor: 'success.main', 
                  color: 'white', 
                  width: 56,
                  height: 56,
                  '&:hover': { 
                    bgcolor: 'success.dark',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                }}
              >
                {moviePlaying ? <PauseCircleOutlineIcon sx={{ fontSize: 32 }} /> : <PlayCircleOutlineIcon sx={{ fontSize: 32 }} />}
              </IconButton>
            </Box>
            
            {/* Scrollable Gallery with Custom Scrollbar */}
            <Box 
              sx={{ 
                overflowX: 'auto',
                overflowY: 'hidden',
                position: 'relative',
                pb: 2,
                '&::-webkit-scrollbar': {
                  height: 12,
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 10,
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'success.main',
                  borderRadius: 10,
                  border: '2px solid transparent',
                  backgroundClip: 'content-box',
                  '&:hover': {
                    bgcolor: 'success.dark',
                  },
                },
              }}
            >
              <Box sx={{
                display: 'flex',
                gap: 3,
                p: 2,
                minWidth: 'max-content',
              }}>
                {movieImages.correct.map((img, idx) => (
                  <Slide
                    key={`correct-${idx}`}
                    direction="right"
                    in={true}
                    timeout={300 + idx * 50}
                  >
                    <Card 
                      sx={{ 
                        minWidth: 320,
                        maxWidth: 320,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: 3,
                        border: '2px solid rgba(76, 175, 80, 0.2)',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 12px 40px rgba(76, 175, 80, 0.3)',
                          borderColor: 'success.main',
                        },
                        animation: `cardFloat ${3 + (idx % 3)}s ease-in-out infinite`,
                        animationDelay: `${idx * 0.2}s`,
                        '@keyframes cardFloat': {
                          '0%, 100%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-5px)' },
                        },
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="280"
                          image={galleryAPI.getImageUrl(img.path)}
                          alt={img.filename}
                          sx={{
                            objectFit: 'contain',
                            bgcolor: '#000',
                            p: 2,
                          }}
                        />
                        {/* Success Badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: 'success.main',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 18 }} />
                          <Typography variant="caption" fontWeight={700}>
                            CORRECT
                          </Typography>
                        </Box>
                      </Box>
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 2 }} noWrap>
                          📄 {img.filename}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                          <Chip
                            icon={<CheckCircleIcon />}
                            label={img.prediction.toUpperCase()}
                            color="success"
                            size="medium"
                            sx={{ 
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                            }}
                          />
                          <Chip
                            label={`${img.confidence.toFixed(1)}%`}
                            size="medium"
                            sx={{ 
                              fontWeight: 700,
                              bgcolor: 'rgba(76, 175, 80, 0.15)',
                              color: 'success.dark',
                              border: '1px solid rgba(76, 175, 80, 0.5)',
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="caption" color="success.dark" fontWeight={600}>
                            ✓ True Label: {img.label.toUpperCase()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Slide>
                ))}
              </Box>
            </Box>
            
            {movieImages.correct.length === 0 && !loadingMovie && (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <Typography variant="body1">No correct predictions available</Typography>
              </Box>
            )}
          </Paper>
        </Zoom>
        
        {/* Incorrect Predictions Gallery */}
        <Zoom in timeout={800}>
          <Paper 
            elevation={6} 
            sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.08) 0%, rgba(244, 67, 54, 0.02) 100%)',
              border: '2px solid rgba(244, 67, 54, 0.2)',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 90% 20%, rgba(244, 67, 54, 0.05), transparent 50%)',
                pointerEvents: 'none',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(244, 67, 54, 0.3)',
                  animation: 'iconPulse 2s ease-in-out infinite',
                }}
              >
                <CancelIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  ✗ Incorrect Predictions ({movieImages.incorrect.length})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cases where AI prediction didn't match the true label
                </Typography>
              </Box>
            </Box>
            
            {/* Scrollable Gallery with Custom Scrollbar */}
            <Box 
              sx={{ 
                overflowX: 'auto',
                overflowY: 'hidden',
                position: 'relative',
                pb: 2,
                '&::-webkit-scrollbar': {
                  height: 12,
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 10,
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'error.main',
                  borderRadius: 10,
                  border: '2px solid transparent',
                  backgroundClip: 'content-box',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                },
              }}
            >
              <Box sx={{
                display: 'flex',
                gap: 3,
                p: 2,
                minWidth: 'max-content',
              }}>
                {movieImages.incorrect.map((img, idx) => (
                  <Slide
                    key={`incorrect-${idx}`}
                    direction="right"
                    in={true}
                    timeout={300 + idx * 50}
                  >
                    <Card 
                      sx={{ 
                        minWidth: 320,
                        maxWidth: 320,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: 3,
                        border: '2px solid rgba(244, 67, 54, 0.2)',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 12px 40px rgba(244, 67, 54, 0.3)',
                          borderColor: 'error.main',
                        },
                        animation: `cardFloat ${3 + (idx % 3)}s ease-in-out infinite`,
                        animationDelay: `${idx * 0.2}s`,
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="280"
                          image={galleryAPI.getImageUrl(img.path)}
                          alt={img.filename}
                          sx={{
                            objectFit: 'contain',
                            bgcolor: '#000',
                            p: 2,
                          }}
                        />
                        {/* Error Badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: 'error.main',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <CancelIcon sx={{ fontSize: 18 }} />
                          <Typography variant="caption" fontWeight={700}>
                            INCORRECT
                          </Typography>
                        </Box>
                      </Box>
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 2 }} noWrap>
                          📄 {img.filename}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                          <Chip
                            icon={<CancelIcon />}
                            label={`AI: ${img.prediction.toUpperCase()}`}
                            color="error"
                            size="medium"
                            sx={{ 
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                            }}
                          />
                          <Chip
                            label={`${img.confidence.toFixed(1)}%`}
                            size="medium"
                            sx={{ 
                              fontWeight: 700,
                              bgcolor: 'rgba(244, 67, 54, 0.15)',
                              color: 'error.dark',
                              border: '1px solid rgba(244, 67, 54, 0.5)',
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            bgcolor: 'rgba(255, 152, 0, 0.1)',
                            borderRadius: 1,
                            border: '1px solid rgba(255, 152, 0, 0.3)',
                          }}
                        >
                          <Typography variant="caption" color="warning.dark" fontWeight={600}>
                            ✓ True: {img.label.toUpperCase()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Slide>
                ))}
              </Box>
            </Box>
            
            {movieImages.incorrect.length === 0 && !loadingMovie && (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <Typography variant="body1">No incorrect predictions available</Typography>
              </Box>
            )}
          </Paper>
        </Zoom>
        
        {loadingMovie && (
          <Fade in timeout={500}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={60} sx={{ color: '#667eea' }} />
              <Typography variant="h6" sx={{ mt: 2 }} color="primary" fontWeight={600}>
                Loading Pre-Analyzed Predictions...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Reading from cached CSV file - Instant load! ⚡
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Found: {movieImages.correct.length} correct, {movieImages.incorrect.length} incorrect
              </Typography>
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  )
}

export default LiveDemo
