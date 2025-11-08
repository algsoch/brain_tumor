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
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline'
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
      
      // Fetch image as blob using axios (better CORS handling than fetch)
      const imageResponse = await api.get(`/api/gallery/image/${image.path}`, {
        responseType: 'blob'
      })
      
      const blob = imageResponse.data
      const file = new File([blob], image.filename, { type: blob.type || 'image/jpeg' })

      // Get prediction - result already contains the parsed response
      const result = await predictionAPI.predictImage(file)
      
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
          {/* Image Display */}
          <Grid item xs={12} md={6}>
            <Paper elevation={6} sx={{ overflow: 'hidden', borderRadius: 3 }}>
              {currentImage && (
                <>
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

          {/* Prediction Result */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                minHeight: 350,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                bgcolor: predicting ? '#f5f5f5' : 'white',
              }}
            >
              {predicting ? (
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={60} />
                  <Typography variant="h6" sx={{ mt: 3 }} color="primary">
                    Analyzing Brain Scan...
                  </Typography>
                  <LinearProgress sx={{ mt: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Processing image through neural network
                  </Typography>
                </Box>
              ) : prediction ? (
                <Box>
                  <Typography variant="h5" gutterBottom fontWeight="600" color="primary">
                    ✓ Analysis Complete
                  </Typography>

                  <Box sx={{ my: 3 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Prediction:</strong>
                    </Typography>
                    <Chip
                      label={prediction.prediction.toUpperCase()}
                      color={prediction.prediction === 'tumor' ? 'error' : 'success'}
                      sx={{ fontWeight: 'bold', fontSize: '1.1rem', px: 2, py: 3 }}
                    />
                  </Box>

                  <Box sx={{ my: 3 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Confidence Score:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={prediction.confidence}
                        sx={{
                          flex: 1,
                          height: 10,
                          borderRadius: 5,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: prediction.confidence > 80 ? 'success.main' : 'warning.main',
                          },
                        }}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        {prediction.confidence.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ my: 3 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Accuracy Check:</strong>
                    </Typography>
                    {prediction.isCorrect ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" fontSize="large" />
                        <Typography variant="h6" color="success.main" fontWeight="600">
                          ✓ Correct Prediction!
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CancelIcon color="error" fontSize="large" />
                        <Typography variant="h6" color="error.main" fontWeight="600">
                          ✗ Incorrect - Expected: {prediction.trueLabel}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, mt: 3 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      <strong>Note:</strong> This is a real-time demonstration using actual test images
                      from our dataset. The model makes predictions instantly without any preprocessing.
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="h6" gutterBottom>
                    Ready to Analyze
                  </Typography>
                  <Typography variant="body2">
                    Click "Run Prediction" to see the AI model in action
                  </Typography>
                  <Box sx={{ mt: 3, opacity: 0.5 }}>
                    <Typography variant="h1">🧠</Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Prediction Movie Carousel */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="600" color="primary" sx={{ mb: 4 }}>
          🎬 Prediction Gallery - Watch AI in Action
        </Typography>
        
        {/* Correct Predictions Movie */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, bgcolor: '#e8f5e9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h5" fontWeight="600" color="success.main">
                  ✓ Correct Predictions ({movieImages.correct.length})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI successfully identified these brain scans
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setMoviePlaying(!moviePlaying)}
              sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}
            >
              {moviePlaying ? <PauseCircleOutlineIcon sx={{ fontSize: 40 }} /> : <PlayCircleOutlineIcon sx={{ fontSize: 40 }} />}
            </IconButton>
          </Box>
          
          <Box sx={{ 
            overflow: 'hidden',
            position: 'relative',
            height: 400,
            borderRadius: 2,
            bgcolor: 'white',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
          }}>
            {movieImages.correct.length > 0 && (
              <Box sx={{
                display: 'flex',
                gap: 3,
                transition: 'transform 0.8s ease-in-out',
                transform: `translateX(-${(movieIndex % movieImages.correct.length) * 330}px)`,
                p: 3
              }}>
                {movieImages.correct.concat(movieImages.correct).map((img, idx) => (
                <Card 
                  key={`correct-${idx}`}
                  sx={{ 
                    minWidth: 300,
                    boxShadow: 6,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 12,
                    },
                    borderRadius: 3,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={galleryAPI.getImageUrl(img.path)}
                    alt={img.filename}
                    sx={{
                      objectFit: 'contain',
                      bgcolor: '#000',
                      p: 1.5,
                    }}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" noWrap fontWeight="700" sx={{ mb: 1.5 }}>
                      {img.filename}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<CheckCircleIcon />}
                        label={img.prediction.toUpperCase()}
                        color="success"
                        size="medium"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={`${img.confidence.toFixed(1)}%`}
                        size="medium"
                        variant="outlined"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
            )}
          </Box>
        </Paper>
        
        {/* Incorrect Predictions Movie */}
        <Paper elevation={3} sx={{ p: 4, bgcolor: '#ffebee' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <CancelIcon sx={{ fontSize: 40, color: 'error.main' }} />
            <Box>
              <Typography variant="h5" fontWeight="600" color="error.main">
                ✗ Incorrect Predictions ({movieImages.incorrect.length})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cases where AI prediction didn't match the true label
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ 
            overflow: 'hidden',
            position: 'relative',
            height: 400,
            borderRadius: 2,
            bgcolor: 'white',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)',
          }}>
            {movieImages.incorrect.length > 0 && (
              <Box sx={{
                display: 'flex',
                gap: 3,
                transition: 'transform 0.8s ease-in-out',
                transform: `translateX(-${(movieIndex % movieImages.incorrect.length) * 330}px)`,
                p: 3
              }}>
                {movieImages.incorrect.concat(movieImages.incorrect).map((img, idx) => (
                <Card 
                  key={`incorrect-${idx}`}
                  sx={{ 
                    minWidth: 300,
                    boxShadow: 6,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 12,
                    },
                    borderRadius: 3,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="250"
                    image={galleryAPI.getImageUrl(img.path)}
                    alt={img.filename}
                    sx={{
                      objectFit: 'contain',
                      bgcolor: '#000',
                      p: 1.5,
                    }}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" noWrap fontWeight="700" sx={{ mb: 1.5 }}>
                      {img.filename}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<CancelIcon />}
                        label={`Pred: ${img.prediction.toUpperCase()}`}
                        color="error"
                        size="medium"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={`True: ${img.label.toUpperCase()}`}
                        color="default"
                        size="medium"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Confidence: {img.confidence.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
            )}
          </Box>
        </Paper>
        
        {loadingMovie && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }} color="primary">
              Loading Pre-Analyzed Predictions...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Reading from cached CSV file - Instant load! ⚡
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Found: {movieImages.correct.length} correct, {movieImages.incorrect.length} incorrect
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default LiveDemo
