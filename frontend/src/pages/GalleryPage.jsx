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
    // Only load images if we have predictions (for correct/incorrect filters)
    const needsPredictions = filter === 'correct' || filter === 'incorrect'
    
    console.log('🔍 useEffect triggered:', { filter, needsPredictions, predictionsCount: Object.keys(allPredictions).length })
    
    // If we need predictions but don't have them yet, wait
    if (needsPredictions && Object.keys(allPredictions).length === 0) {
      console.log('⏳ Waiting for predictions to load...')
      return
    }
    
    console.log('✅ Proceeding to load images')
    
    // Debounce search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      loadImages()
    }, search ? 500 : 0) // 500ms debounce for search, immediate for other filters
    
    return () => clearTimeout(debounceTimer)
  }, [page, search, filter, allPredictions])

  const loadPrecomputedPredictions = async () => {
    try {
      console.log('🔄 Starting to load predictions...')
      const response = await precomputedAPI.getPredictions()
      console.log('✅ Predictions response:', response)
      
      if (response.success) {
        const predMap = {}
        response.data.predictions.forEach(pred => {
          predMap[pred.filename] = pred
        })
        console.log('📊 Predictions loaded:', Object.keys(predMap).length, 'files')
        console.log('📊 Sample predictions:', Object.entries(predMap).slice(0, 3))
        
        setAllPredictions(predMap)
        setStats({
          total: response.data.total,
          correct: response.data.correct_count,
          incorrect: response.data.incorrect_count,
          accuracy: response.data.accuracy,
        })
        console.log('✅ Stats set:', {
          total: response.data.total,
          correct: response.data.correct_count,
          incorrect: response.data.incorrect_count,
        })
      }
    } catch (err) {
      console.error('❌ Failed to load predictions:', err)
    }
  }

  const loadImages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For correct/incorrect/tumor/healthy filters, we need ALL images to filter properly
      const needsAllImages = filter === 'correct' || filter === 'incorrect' || filter === 'tumor' || filter === 'healthy'
      
      let fetchedImages = []
      let totalImagesInDB = 0
      
      if (needsAllImages) {
        // Fetch ALL images across multiple pages (backend max is 100 per page)
        const firstResponse = await galleryAPI.getImages({ 
          page: 1, 
          page_size: 100,
          ...(search && search.trim() ? { search: search.trim() } : {})
        })
        
        totalImagesInDB = firstResponse.data.pagination.total_items
        setTotalImagesCount(totalImagesInDB)
        
        fetchedImages = [...firstResponse.data.images]
        
        // Fetch remaining pages if needed
        const totalPages = firstResponse.data.pagination.total_pages
        const fetchPromises = []
        
        for (let p = 2; p <= totalPages; p++) {
          fetchPromises.push(
            galleryAPI.getImages({ 
              page: p, 
              page_size: 100,
              ...(search && search.trim() ? { search: search.trim() } : {})
            })
          )
        }
        
        const remainingResponses = await Promise.all(fetchPromises)
        remainingResponses.forEach(response => {
          fetchedImages.push(...response.data.images)
        })
      } else {
        // Normal pagination for label-based filters
        const params = {
          page,
          page_size: 24,
        }
        
        if (search && search.trim()) {
          params.search = search.trim()
        }
        
        const response = await galleryAPI.getImages(params)
        
        if (response.data.pagination) {
          setTotalImagesCount(response.data.pagination.total_items)
        }
        
        fetchedImages = response.data.images || []
      }
      
      // Apply client-side filters
      if (filter !== 'all' && fetchedImages.length > 0) {
        const predictionsReady = Object.keys(allPredictions).length > 0
        
        console.log('Filter:', filter)
        console.log('Predictions ready:', predictionsReady)
        console.log('Total predictions loaded:', Object.keys(allPredictions).length)
        console.log('Images before filter:', fetchedImages.length)
        console.log('Sample image filenames:', fetchedImages.slice(0, 3).map(img => img.filename))
        console.log('Sample prediction keys:', Object.keys(allPredictions).slice(0, 3))
        console.log('Sample prediction values:', Object.values(allPredictions).slice(0, 3))
        
        const filteredImages = fetchedImages.filter(img => {
          const pred = allPredictions[img.filename]
          
          if (filter === 'correct' || filter === 'incorrect') {
            console.log(`Checking ${img.filename}: pred exists=${!!pred}, isCorrect=${pred?.isCorrect}`)
          }
          
          switch (filter) {
            case 'correct':
              return predictionsReady && pred && pred.isCorrect === true
            case 'incorrect':
              return predictionsReady && pred && pred.isCorrect === false
            case 'tumor':
              // Check both label formats
              const isTumor = img.label === 'tumor' || img.label.toLowerCase().includes('cancer')
              if (filter === 'tumor' && fetchedImages.indexOf(img) < 3) {
                console.log(`Tumor check: ${img.filename}, label="${img.label}", result=${isTumor}`)
              }
              return isTumor
            case 'healthy':
              // Check multiple healthy label formats
              const isHealthy = img.label === 'healthy' || 
                     img.label === 'not_cancer' || 
                     img.label.toLowerCase().includes('healthy') ||
                     img.label.toLowerCase().includes('normal')
              if (filter === 'healthy' && fetchedImages.indexOf(img) < 5) {
                console.log(`Healthy check: ${img.filename}, label="${img.label}", result=${isHealthy}`)
              }
              return isHealthy
            default:
              return true
          }
        })
        
        console.log('Images after filter:', filteredImages.length)
        
        // For correct/incorrect, apply manual pagination after filtering
        if (needsAllImages) {
          const totalFiltered = filteredImages.length
          const startIndex = (page - 1) * 24
          const endIndex = startIndex + 24
          const paginatedImages = filteredImages.slice(startIndex, endIndex)
          
          console.log('Paginated images:', paginatedImages.length)
          
          setImages(paginatedImages)
          setPagination({
            current_page: page,
            page_size: 24,
            total_items: totalFiltered,
            total_pages: Math.ceil(totalFiltered / 24) || 1,
          })
        } else {
          // For tumor/healthy filters
          setImages(filteredImages)
          setPagination({
            current_page: page,
            page_size: 24,
            total_items: filteredImages.length,
            total_pages: Math.ceil(filteredImages.length / 24) || 1,
          })
        }
      } else {
        // No filter or 'all' selected
        console.log('No filter applied, showing all images:', fetchedImages.length)
        setImages(fetchedImages)
        if (!needsAllImages) {
          const response = await galleryAPI.getImages({
            page,
            page_size: 24,
            ...(search && search.trim() ? { search: search.trim() } : {})
          })
          setPagination(response.data.pagination)
        } else {
          setPagination({
            current_page: page,
            page_size: 24,
            total_items: fetchedImages.length,
            total_pages: Math.ceil(fetchedImages.length / 24) || 1,
          })
        }
      }
      
    } catch (err) {
      console.error('Error loading images:', err)
      setError(err.response?.data?.message || err.message || 'Failed to load images')
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
      // Use encodeURIComponent to handle special characters in filenames
      const encodedPath = encodeURIComponent(image.path)
      const imageResponse = await api.get(`/api/gallery/image/${encodedPath}`, {
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
    return pred.isCorrect ? 'correct' : 'incorrect'
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4, textAlign: 'center', px: { xs: 2, sm: 0 } }}>
          <Typography
            variant="h3"
            gutterBottom
            fontWeight={700}
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            🖼️ Image Gallery & Predictions
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
            Browse test images with AI predictions and accuracy insights
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards - Responsive Grid */}
      <Fade in timeout={1000}>
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4, px: { xs: 2, sm: 0 } }}>
          <Grid item xs={6} sm={6} md={3}>
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}>
                {totalImagesCount || 0}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                Total Images
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                Available in gallery
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                color: 'white',
                borderRadius: 3,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}>
                {stats.correct}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                ✓ Correct
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                Tested: {stats.total} images
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
                color: 'white',
                borderRadius: 3,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}>
                {stats.incorrect}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                ✗ Incorrect
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                Tested: {stats.total} images
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper
              elevation={4}
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
                color: 'white',
                borderRadius: 3,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}>
                {stats.accuracy.toFixed(1)}%
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                Accuracy
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                On {stats.total} tested
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Fade>

      {/* Search and Filters - Responsive */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, mx: { xs: 2, sm: 0 }, borderRadius: 3 }}>
        <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
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
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'space-between' }, alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={handleFilterChange}
                size="small"
                sx={{ 
                  flexWrap: 'wrap',
                  gap: 0.5,
                  '& .MuiToggleButton-root': {
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    px: { xs: 1, sm: 1.5 },
                    py: { xs: 0.5, sm: 0.75 },
                  },
                }}
              >
                <ToggleButton value="all">
                  <FilterListIcon sx={{ mr: 0.5, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>All</Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>All</Box>
                </ToggleButton>
                <ToggleButton value="correct">
                  <CheckCircleIcon sx={{ mr: { xs: 0, sm: 0.5 }, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Correct</Box>
                </ToggleButton>
                <ToggleButton value="incorrect">
                  <CancelIcon sx={{ mr: { xs: 0, sm: 0.5 }, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Incorrect</Box>
                </ToggleButton>
                <ToggleButton value="tumor">
                  <LocalHospitalIcon sx={{ mr: { xs: 0, sm: 0.5 }, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Tumor</Box>
                </ToggleButton>
                <ToggleButton value="healthy">
                  <CheckCircleIcon sx={{ mr: { xs: 0, sm: 0.5 }, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Healthy</Box>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 5 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }} color="primary">
            Loading images...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2, mx: { xs: 2, sm: 0 } }}>{error}</Alert>
      ) : images.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2, mx: { xs: 2, sm: 0 } }}>
          {(() => {
            if (search && search.trim()) {
              return `No images found matching "${search}"`
            }
            switch (filter) {
              case 'correct':
                return `No images found with correct predictions. ${Object.keys(allPredictions).length === 0 ? 'Predictions are still loading...' : `Only ${stats.correct} images have correct predictions.`}`
              case 'incorrect':
                return `No images found with incorrect predictions. ${Object.keys(allPredictions).length === 0 ? 'Predictions are still loading...' : `Only ${stats.incorrect} images have incorrect predictions.`}`
              case 'tumor':
                return 'No tumor/cancer images found in the current selection'
              case 'healthy':
                return 'No healthy/normal images found in the current selection'
              default:
                return 'No images found'
            }
          })()}
        </Alert>
      ) : (
        <Box sx={{ px: { xs: 2, sm: 0 } }}>
          <Grid container spacing={viewMode === 'grid' ? { xs: 2, sm: 3 } : { xs: 1, sm: 2 }}>
            {images.map((image, index) => {
              const predStatus = getPredictionStatus(image)
              const pred = allPredictions[image.filename]
              
              return viewMode === 'grid' ? (
                <Grid item xs={6} sm={6} md={4} lg={3} key={index}>
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
                          height={viewMode === 'grid' ? 220 : 280}
                          image={galleryAPI.getImageUrl(image.path)}
                          alt={image.filename}
                          onError={(e) => {
                            console.error('Image load error:', image.filename, galleryAPI.getImageUrl(image.path))
                            e.target.onerror = null
                          }}
                          sx={{
                            objectFit: 'contain',
                            bgcolor: '#000',
                            p: { xs: 1, sm: 2 },
                          }}
                        />
                        {predStatus && (
                          <Chip
                            icon={predStatus === 'correct' ? <CheckCircleIcon /> : <CancelIcon />}
                            label={predStatus === 'correct' ? 'Correct' : 'Incorrect'}
                            color={predStatus === 'correct' ? 'success' : 'error'}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: { xs: 8, sm: 16 },
                              right: { xs: 8, sm: 16 },
                              fontWeight: 700,
                              boxShadow: 3,
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ flexGrow: 1, pb: 1, px: { xs: 1.5, sm: 2 }, pt: { xs: 1.5, sm: 2 } }}>
                        <Tooltip title={image.filename}>
                          <Typography variant="body2" noWrap fontWeight={700} gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {image.filename}
                          </Typography>
                        </Tooltip>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                          <Chip
                            label={`${image.label}`}
                            color={image.label === 'tumor' || image.label.includes('cancer') ? 'error' : 'success'}
                            size="small"
                            icon={image.label === 'tumor' || image.label.includes('cancer') ? <LocalHospitalIcon /> : <CheckCircleIcon />}
                            sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          />
                          <Chip
                            label={pred ? '✓ Tested' : '✗ Not Tested'}
                            color={pred ? 'info' : 'default'}
                            size="small"
                            variant={pred ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                          />
                        </Box>
                        {pred && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                              AI: <strong>{pred.prediction}</strong>
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <LinearProgress
                                variant="determinate"
                                value={pred.confidence}
                                sx={{
                                  flex: 1,
                                  height: { xs: 4, sm: 6 },
                                  borderRadius: 3,
                                  bgcolor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: pred.isCorrect ? '#4caf50' : '#f44336',
                                  },
                                }}
                              />
                              <Typography variant="caption" fontWeight={700} sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                {pred.confidence.toFixed(0)}%
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                      <CardActions sx={{ pt: 0, px: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<PsychologyIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                          onClick={() => handlePredict(image)}
                          sx={{
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            fontWeight: 600,
                            py: { xs: 0.75, sm: 1 },
                            fontSize: { xs: '0.7rem', sm: '0.875rem' },
                          }}
                        >
                          Details
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
                        p: { xs: 1.5, sm: 2 },
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        alignItems: { xs: 'stretch', sm: 'center' },
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
                          width: { xs: '100%', sm: 120 },
                          height: { xs: 200, sm: 120 },
                          flexShrink: 0,
                          bgcolor: '#000',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={galleryAPI.getImageUrl(image.path)}
                          alt={image.filename}
                          onError={(e) => {
                            console.error('List image load error:', image.filename)
                            e.target.onerror = null
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} noWrap>
                          {image.filename}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          <Chip
                            label={`True: ${image.label}`}
                            color={image.label === 'tumor' || image.label.includes('cancer') ? 'error' : 'success'}
                            size="small"
                            icon={image.label === 'tumor' || image.label.includes('cancer') ? <LocalHospitalIcon /> : <CheckCircleIcon />}
                          />
                          {predStatus && (
                            <Chip
                              icon={predStatus === 'correct' ? <CheckCircleIcon /> : <CancelIcon />}
                              label={predStatus === 'correct' ? 'Correct' : 'Incorrect'}
                              color={predStatus === 'correct' ? 'success' : 'error'}
                              size="small"
                            />
                          )}
                          <Chip
                            label={pred ? '✓ Tested' : '✗ Not Tested'}
                            color={pred ? 'info' : 'default'}
                            size="small"
                            variant={pred ? 'filled' : 'outlined'}
                          />
                        </Box>
                        {pred && (
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                              AI: <strong>{pred.prediction}</strong> • Confidence: <strong>{pred.confidence.toFixed(1)}%</strong>
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
                          minWidth: { xs: '100%', sm: 140 },
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
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
        </Box>
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
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  src={galleryAPI.getImageUrl(selectedImage.path)}
                  alt={selectedImage.filename}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
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
                      {(() => {
                        const predictedLabel = prediction.prediction.toLowerCase()
                        const trueLabel = selectedImage.label.toLowerCase()
                        
                        // Check if both are tumor/cancer
                        const predictedIsTumor = predictedLabel === 'tumor' || predictedLabel.includes('cancer')
                        const trueIsTumor = trueLabel === 'tumor' || trueLabel.includes('cancer')
                        
                        // Check if both are healthy/not_cancer
                        const predictedIsHealthy = predictedLabel === 'healthy' || predictedLabel === 'not_cancer' || predictedLabel.includes('healthy') || predictedLabel.includes('normal')
                        const trueIsHealthy = trueLabel === 'healthy' || trueLabel === 'not_cancer' || trueLabel.includes('healthy') || trueLabel.includes('normal')
                        
                        const isCorrect = (predictedIsTumor && trueIsTumor) || (predictedIsHealthy && trueIsHealthy)
                        
                        return isCorrect ? (
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
                              ✗ Incorrect - Expected: {selectedImage.label.toUpperCase()}
                            </Typography>
                          </Box>
                        )
                      })()}
                    </Box>
                  </Paper>
                </Zoom>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          {!prediction && !predicting && (
            <Button
              onClick={() => runPrediction(selectedImage)}
              variant="contained"
              size="large"
              startIcon={<PsychologyIcon />}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #0097A7 90%)',
                },
              }}
            >
              Run AI Prediction
            </Button>
          )}
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
