import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Pagination,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Fade,
  Zoom,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PsychologyIcon from '@mui/icons-material/Psychology'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import FilterListIcon from '@mui/icons-material/FilterList'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import ViewListIcon from '@mui/icons-material/ViewList'
import CloseIcon from '@mui/icons-material/Close'
import api, { galleryAPI, predictionAPI, precomputedAPI } from '../services/api'

const GalleryPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [images, setImages] = useState([])
  const [allPredictions, setAllPredictions] = useState({})
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [filter, setFilter] = useState('all') // 'all', 'correct', 'incorrect', 'tumor', 'healthy'
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [stats, setStats] = useState({ total: 0, correct: 0, incorrect: 0, accuracy: 0 })
  const [totalImagesCount, setTotalImagesCount] = useState(0)

  useEffect(() => {
    loadPrecomputedPredictions()
  }, [])

  useEffect(() => {
    // Only reload when predictions are loaded for correct/incorrect filters
    if ((filter === 'correct' || filter === 'incorrect') && Object.keys(allPredictions).length > 0) {
      loadImages()
    } else if (filter !== 'correct' && filter !== 'incorrect') {
      loadImages()
    }
  }, [page, search, filter])
  
  // Reload images when predictions finish loading
  useEffect(() => {
    if (Object.keys(allPredictions).length > 0 && (filter === 'correct' || filter === 'incorrect')) {
      loadImages()
    }
  }, [allPredictions])

  const loadPrecomputedPredictions = async () => {
    try {
      const response = await precomputedAPI.getPredictions()
      if (response.success) {
        const predMap = {}
        response.data.predictions.forEach(pred => {
          predMap[pred.filename] = pred
        })
        setAllPredictions(predMap)
        setStats({
          total: response.data.total,
          correct: response.data.correct_count,
          incorrect: response.data.incorrect_count,
          accuracy: response.data.accuracy,
        })
      }
    } catch (err) {
      console.error('Failed to load predictions:', err)
    }
  }

  const loadImages = async () => {
    try {
      setLoading(true)
      const response = await galleryAPI.getImages({
        page,
        page_size: 24,
        search: search || undefined,
      })
      
      // Store total image count from API
      if (response.data.pagination) {
        setTotalImagesCount(response.data.pagination.total)
      }
      
      let filteredImages = response.data.images
      
      // Apply filters based on precomputed predictions
      if (filter !== 'all' && filteredImages.length > 0) {
        filteredImages = filteredImages.filter(img => {
          const pred = allPredictions[img.filename]
          
          switch (filter) {
            case 'correct':
              return pred && pred.correct === true
            case 'incorrect':
              return pred && pred.correct === false
            case 'tumor':
              return img.label === 'tumor'
            case 'healthy':
              return img.label === 'not_cancer' || img.label === 'healthy'
            default:
              return true
          }
        })
      }
      
      setImages(filteredImages)
      setPagination(response.data.pagination)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (event, value) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchChange = (event) => {
    const value = event.target.value
    setSearch(value)
    setPage(1)
  }

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter)
      setPage(1)
    }
  }

  const handlePredict = async (image) => {
    setSelectedImage(image)
    
    // Check if we have precomputed prediction
    const precomputedPred = allPredictions[image.filename]
    if (precomputedPred) {
      setPrediction({
        prediction: precomputedPred.prediction,
        confidence: precomputedPred.confidence,
        class_name: precomputedPred.prediction,
      })
      return
    }
    
    // Otherwise make real-time prediction
    setPredicting(true)
    setPrediction(null)
    
    try {
      const imageResponse = await api.get(`/api/gallery/image/${image.path}`, {
        responseType: 'blob'
      })
      
      const blob = imageResponse.data
      const file = new File([blob], image.filename, { type: blob.type || 'image/jpeg' })
      
      const result = await predictionAPI.predictImage(file)
      setPrediction(result.data)
    } catch (err) {
      console.error('Prediction error:', err)
      setError(`Prediction failed: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setPredicting(false)
    }
  }

  const handleCloseDialog = () => {
    setSelectedImage(null)
    setPrediction(null)
  }

  const getPredictionStatus = (image) => {
    const pred = allPredictions[image.filename]
    if (!pred) return null
    return pred.correct ? 'correct' : 'incorrect'
  }

  return (
    <Box>
      {/* Header */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            gutterBottom
            fontWeight={700}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🖼️ Image Gallery & Predictions
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Browse test images with AI predictions and accuracy insights
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Fade in timeout={1000}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
              }}
            >
              <Typography variant="h3" fontWeight={700}>
                {totalImagesCount || stats.total}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Total Images
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                color: 'white',
                borderRadius: 3,
              }}
            >
              <Typography variant="h3" fontWeight={700}>
                {stats.correct}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Correct Predictions
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                (from {stats.total} tested)
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
                color: 'white',
                borderRadius: 3,
              }}
            >
              <Typography variant="h3" fontWeight={700}>
                {stats.incorrect}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Incorrect Predictions
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                (from {stats.total} tested)
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
                color: 'white',
                borderRadius: 3,
              }}
            >
              <Typography variant="h3" fontWeight={700}>
                {stats.accuracy.toFixed(1)}%
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Model Accuracy
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                (on {stats.total} samples)
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Fade>

      {/* Search and Filters */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by filename..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={handleFilterChange}
                size="small"
                sx={{ flexWrap: 'wrap' }}
              >
                <ToggleButton value="all">
                  <FilterListIcon sx={{ mr: 0.5 }} fontSize="small" />
                  All
                </ToggleButton>
                <ToggleButton value="correct">
                  <CheckCircleIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Correct
                </ToggleButton>
                <ToggleButton value="incorrect">
                  <CancelIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Incorrect
                </ToggleButton>
                <ToggleButton value="tumor">
                  <LocalHospitalIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Tumor
                </ToggleButton>
                <ToggleButton value="healthy">
                  <CheckCircleIcon sx={{ mr: 0.5 }} fontSize="small" />
                  Healthy
                </ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, val) => val && setViewMode(val)}
                size="small"
              >
                <ToggleButton value="grid">
                  <ViewModuleIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      ) : images.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No images found for the selected filters
        </Alert>
      ) : (
        <>
          <Grid container spacing={viewMode === 'grid' ? 3 : 2}>
            {images.map((image, index) => {
              const predStatus = getPredictionStatus(image)
              const pred = allPredictions[image.filename]
              
              return viewMode === 'grid' ? (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Zoom in timeout={300 + index * 50}>
                    <Card
                      elevation={4}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease-in-out',
                        borderRadius: 3,
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 12,
                        },
                        border: predStatus === 'correct' ? '3px solid #4caf50' : predStatus === 'incorrect' ? '3px solid #f44336' : 'none',
                      }}
                      onClick={() => handlePredict(image)}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="280"
                          image={galleryAPI.getImageUrl(image.path)}
                          alt={image.filename}
                          sx={{
                            objectFit: 'contain',
                            bgcolor: '#000',
                            p: 2,
                          }}
                        />
                        {predStatus && (
                          <Chip
                            icon={predStatus === 'correct' ? <CheckCircleIcon /> : <CancelIcon />}
                            label={predStatus === 'correct' ? 'Correct' : 'Incorrect'}
                            color={predStatus === 'correct' ? 'success' : 'error'}
                            sx={{
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              fontWeight: 700,
                              boxShadow: 3,
                            }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        <Tooltip title={image.filename}>
                          <Typography variant="body2" noWrap fontWeight={700} gutterBottom>
                            {image.filename}
                          </Typography>
                        </Tooltip>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          <Chip
                            label={`True: ${image.label}`}
                            color={image.label === 'tumor' ? 'error' : 'success'}
                            size="small"
                            icon={image.label === 'tumor' ? <LocalHospitalIcon /> : <CheckCircleIcon />}
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        {pred && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              AI Prediction: <strong>{pred.prediction}</strong>
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <LinearProgress
                                variant="determinate"
                                value={pred.confidence}
                                sx={{
                                  flex: 1,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: pred.correct ? '#4caf50' : '#f44336',
                                  },
                                }}
                              />
                              <Typography variant="caption" fontWeight={700}>
                                {pred.confidence.toFixed(0)}%
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                      <CardActions sx={{ pt: 0 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="medium"
                          startIcon={<PsychologyIcon />}
                          onClick={() => handlePredict(image)}
                          sx={{
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            fontWeight: 600,
                            py: 1,
                          }}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Zoom>
                </Grid>
              ) : (
                // List View
                <Grid item xs={12} key={index}>
                  <Fade in timeout={200 + index * 30}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        transition: 'all 0.3s ease-in-out',
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 6,
                          bgcolor: 'grey.50',
                          transform: 'scale(1.01)',
                        },
                        border: predStatus === 'correct' ? '2px solid #4caf50' : predStatus === 'incorrect' ? '2px solid #f44336' : 'none',
                      }}
                      onClick={() => handlePredict(image)}
                    >
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          flexShrink: 0,
                          bgcolor: '#000',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={galleryAPI.getImageUrl(image.path)}
                          alt={image.filename}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {image.filename}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          <Chip
                            label={`True: ${image.label}`}
                            color={image.label === 'tumor' ? 'error' : 'success'}
                            size="small"
                            icon={image.label === 'tumor' ? <LocalHospitalIcon /> : <CheckCircleIcon />}
                          />
                          {predStatus && (
                            <Chip
                              icon={predStatus === 'correct' ? <CheckCircleIcon /> : <CancelIcon />}
                              label={predStatus === 'correct' ? 'Correct Prediction' : 'Incorrect Prediction'}
                              color={predStatus === 'correct' ? 'success' : 'error'}
                              size="small"
                            />
                          )}
                        </Box>
                        {pred && (
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              AI Predicted: <strong>{pred.prediction}</strong> • Confidence: <strong>{pred.confidence.toFixed(1)}%</strong>
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<PsychologyIcon />}
                        onClick={() => handlePredict(image)}
                        sx={{
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          minWidth: 140,
                        }}
                      >
                        Details
                      </Button>
                    </Paper>
                  </Fade>
                </Grid>
              )
            })}
          </Grid>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination
                count={pagination.total_pages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontWeight: 600,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Enhanced Prediction Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box component="span" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
            🔍 Prediction Analysis
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {selectedImage && (
            <Box>
              <Box
                sx={{
                  textAlign: 'center',
                  mb: 3,
                  bgcolor: '#000',
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <img
                  src={galleryAPI.getImageUrl(selectedImage.path)}
                  alt={selectedImage.filename}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '450px',
                    objectFit: 'contain',
                  }}
                />
              </Box>

              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  📁 <strong>Filename:</strong> {selectedImage.filename}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  🏷️ <strong>True Label:</strong>{' '}
                  <Chip
                    label={selectedImage.label.toUpperCase()}
                    color={selectedImage.label === 'tumor' ? 'error' : 'success'}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Typography>
              </Paper>

              {predicting && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <CircularProgress size={60} />
                  <Typography variant="body1" sx={{ mt: 2 }} color="primary" fontWeight={600}>
                    Analyzing image with neural network...
                  </Typography>
                </Box>
              )}

              {prediction && (
                <Zoom in timeout={500}>
                  <Paper
                    elevation={6}
                    sx={{
                      mt: 3,
                      p: 3,
                      background: prediction.prediction === 'tumor'
                        ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                      borderRadius: 3,
                      border: '3px solid',
                      borderColor: prediction.prediction === 'tumor' ? 'error.main' : 'success.main',
                    }}
                  >
                    <Typography variant="h5" gutterBottom color="primary" fontWeight={700}>
                      🤖 AI Model Prediction
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" gutterBottom fontWeight={600}>
                        Predicted Class:
                      </Typography>
                      <Chip
                        label={prediction.prediction.toUpperCase()}
                        color={prediction.prediction === 'tumor' ? 'error' : 'success'}
                        sx={{
                          fontWeight: 900,
                          fontSize: '1.1rem',
                          px: 2,
                          py: 3,
                        }}
                        icon={prediction.prediction === 'tumor' ? <LocalHospitalIcon /> : <CheckCircleIcon />}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" gutterBottom fontWeight={600}>
                        Confidence Score:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={prediction.confidence}
                          sx={{
                            flex: 1,
                            height: 16,
                            borderRadius: 8,
                            bgcolor: 'grey.300',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: prediction.confidence > 80 ? 'success.main' : 'warning.main',
                              borderRadius: 8,
                            },
                          }}
                        />
                        <Typography variant="h5" fontWeight={900} color="primary">
                          {prediction.confidence.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body1" gutterBottom fontWeight={600}>
                        Accuracy Check:
                      </Typography>
                      {prediction.prediction.toLowerCase() === selectedImage.label.toLowerCase() ||
                       (prediction.prediction === 'healthy' && selectedImage.label === 'not_cancer') ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                          <Typography variant="h6" color="success.main" fontWeight={700}>
                            ✓ Correct Prediction!
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CancelIcon color="error" sx={{ fontSize: 40 }} />
                          <Typography variant="h6" color="error.main" fontWeight={700}>
                            ✗ Incorrect - Expected: {selectedImage.label}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Zoom>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GalleryPage
