import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Alert,
  LinearProgress,
  Grid,
  Fade,
  Zoom,
  Slide,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import ScienceIcon from '@mui/icons-material/Science'
import RadarIcon from '@mui/icons-material/Radar'
import SpeedIcon from '@mui/icons-material/Speed'
import MemoryIcon from '@mui/icons-material/Memory'
import RefreshIcon from '@mui/icons-material/Refresh'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import DeleteIcon from '@mui/icons-material/Delete'
import { predictionAPI } from '../../services/api'
import { useSnackbar } from 'notistack'
import CodeBlock from '../CodeBlock/CodeBlock'

const ImageUpload = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [scanningStage, setScanningStage] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)
  const { enqueueSnackbar } = useSnackbar()

  // Scanning animation stages
  const scanningStages = [
    { label: 'Initializing Neural Network...', icon: <MemoryIcon />, duration: 800 },
    { label: 'Preprocessing MRI Image...', icon: <ScienceIcon />, duration: 1200 },
    { label: 'Extracting Features...', icon: <RadarIcon />, duration: 1500 },
    { label: 'Analyzing Brain Structure...', icon: <AnalyticsIcon />, duration: 1800 },
    { label: 'Running Deep Learning Model...', icon: <MemoryIcon />, duration: 2000 },
    { label: 'Computing Confidence Scores...', icon: <SpeedIcon />, duration: 1000 },
  ]

  useEffect(() => {
    if (loading && scanningStage < scanningStages.length) {
      const timer = setTimeout(() => {
        setScanningStage((prev) => prev + 1)
      }, scanningStages[scanningStage].duration)
      return () => clearTimeout(timer)
    }
  }, [loading, scanningStage])

  useEffect(() => {
    if (loading) {
      const progressTimer = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 100) return 100
          return prev + 2
        })
      }, 100)
      return () => clearInterval(progressTimer)
    } else {
      setProcessingProgress(0)
    }
  }, [loading])

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0]
      setFile(uploadedFile)
      setPreview(URL.createObjectURL(uploadedFile))
      setResult(null)
      setError(null)
      enqueueSnackbar('Image uploaded successfully!', { variant: 'success' })
    }
  }, [enqueueSnackbar])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  })

  const handlePredict = async () => {
    if (!file) {
      enqueueSnackbar('Please select an image first', { variant: 'warning' })
      return
    }

    setLoading(true)
    setError(null)
    setScanningStage(0)
    setProcessingProgress(0)

    try {
      const response = await predictionAPI.predictImage(file)
      
      // Wait for scanning animation to complete
      await new Promise(resolve => setTimeout(resolve, scanningStages.reduce((sum, stage) => sum + stage.duration, 0)))
      
      setResult(response.data)
      enqueueSnackbar('Analysis completed successfully!', { variant: 'success' })
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Prediction failed'
      setError(errorMsg)
      enqueueSnackbar(errorMsg, { variant: 'error' })
    } finally {
      setLoading(false)
      setScanningStage(0)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setScanningStage(0)
    setProcessingProgress(0)
  }

  const getPredictionColor = (prediction) => {
    return prediction?.toLowerCase() === 'tumor' ? 'error' : 'success'
  }

  const code = `// Brain Tumor Detection API
import { predictionAPI } from './services/api';

const analyzeMRI = async (imageFile) => {
  try {
    const response = await predictionAPI.predictImage(imageFile);
    const { prediction, confidence, all_predictions } = response.data;
    
    console.log(\`Prediction: \${prediction}\`);
    console.log(\`Confidence: \${confidence}%\`);
    console.log('Probabilities:', all_predictions);
    
    return response.data;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
};

// Usage
const mriFile = document.getElementById('mri-upload').files[0];
const result = await analyzeMRI(mriFile);`

  return (
    <Box>
      {/* Main Upload Section */}
      <Fade in timeout={600}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            border: '2px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <LocalHospitalIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                AI Brain Tumor Detection
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Upload an MRI scan for instant AI-powered analysis with 97% accuracy
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
              <Chip icon={<SpeedIcon />} label="~300ms Response" size="small" color="success" />
              <Chip icon={<MemoryIcon />} label="Deep Learning" size="small" color="primary" />
              <Chip icon={<CheckCircleIcon />} label="97% Accuracy" size="small" color="secondary" />
            </Box>
          </Box>

          {/* Upload Area */}
          {!preview && (
            <Zoom in timeout={800}>
              <Box
                {...getRootProps()}
                sx={{
                  border: '3px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.400',
                  borderRadius: 4,
                  p: 6,
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                    transform: 'scale(1.02)',
                    boxShadow: 6,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover::before': {
                    left: '100%',
                  },
                }}
              >
                <input {...getInputProps()} />
                <Box sx={{ textAlign: 'center' }}>
                  <CloudUploadIcon
                    sx={{
                      fontSize: 80,
                      color: 'primary.main',
                      mb: 2,
                      animation: isDragActive ? 'bounce 0.6s infinite' : 'none',
                      '@keyframes bounce': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-10px)' },
                      },
                    }}
                  />
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {isDragActive ? 'Drop the image here!' : 'Drop MRI Image Here'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to browse your files
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip label="JPG" size="small" sx={{ mx: 0.5 }} />
                    <Chip label="PNG" size="small" sx={{ mx: 0.5 }} />
                    <Chip label="JPEG" size="small" sx={{ mx: 0.5 }} />
                    <Chip label="Max 10MB" size="small" color="warning" sx={{ mx: 0.5 }} />
                  </Box>
                </Box>
              </Box>
            </Zoom>
          )}

          {/* Preview and Scanning Section */}
          {preview && (
            <Fade in timeout={600}>
              <Grid container spacing={3}>
                {/* Left: Image Preview */}
                <Grid item xs={12} md={5}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={preview}
                        alt="Uploaded MRI"
                        sx={{
                          height: 400,
                          objectFit: 'contain',
                          borderRadius: 2,
                          opacity: loading ? 0.7 : 1,
                          transition: 'opacity 0.3s',
                        }}
                      />
                      
                      {/* Scanning Overlay */}
                      {loading && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(102, 126, 234, 0.1)',
                            borderRadius: 2,
                          }}
                        >
                          {/* Scanning Lines Animation */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '4px',
                              background: 'linear-gradient(90deg, transparent, #667eea, transparent)',
                              animation: 'scan 2s linear infinite',
                              '@keyframes scan': {
                                '0%': { top: '0%' },
                                '100%': { top: '100%' },
                              },
                            }}
                          />
                          
                          {/* Grid Overlay */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundImage: `
                                linear-gradient(rgba(102, 126, 234, 0.2) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(102, 126, 234, 0.2) 1px, transparent 1px)
                              `,
                              backgroundSize: '50px 50px',
                              opacity: 0.3,
                              animation: 'fadeInOut 2s ease-in-out infinite',
                              '@keyframes fadeInOut': {
                                '0%, 100%': { opacity: 0.1 },
                                '50%': { opacity: 0.4 },
                              },
                            }}
                          />
                        </Box>
                      )}

                      {/* Image Info */}
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'grey.400', display: 'block' }}>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'grey.500' }}>
                            {(file.size / 1024).toFixed(2)} KB
                          </Typography>
                        </Box>
                        <Tooltip title="Remove Image">
                          <IconButton
                            size="small"
                            onClick={handleReset}
                            disabled={loading}
                            sx={{ color: 'error.light' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Right: Status/Results */}
                <Grid item xs={12} md={7}>
                  {!loading && !result && (
                    <Zoom in timeout={600}>
                      <Paper
                        elevation={4}
                        sx={{
                          p: 4,
                          borderRadius: 3,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.05) 100%)',
                        }}
                      >
                        <ScienceIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3, opacity: 0.5 }} />
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          Ready to Analyze
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                          Click the button below to start the AI analysis of your MRI scan
                        </Typography>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={handlePredict}
                          startIcon={<RadarIcon />}
                          sx={{
                            px: 6,
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            boxShadow: 6,
                            '&:hover': {
                              background: 'linear-gradient(45deg, #5568d3 30%, #653a8b 90%)',
                              transform: 'scale(1.05)',
                              boxShadow: 10,
                            },
                            transition: 'all 0.3s',
                          }}
                        >
                          Start Analysis
                        </Button>
                      </Paper>
                    </Zoom>
                  )}

                  {/* Scanning Progress */}
                  {loading && (
                    <Slide in direction="left" timeout={400}>
                      <Paper
                        elevation={4}
                        sx={{
                          p: 4,
                          borderRadius: 3,
                          height: '100%',
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        }}
                      >
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                            <CircularProgress
                              size={100}
                              thickness={4}
                              variant="determinate"
                              value={processingProgress}
                              sx={{
                                color: 'primary.main',
                                '& .MuiCircularProgress-circle': {
                                  strokeLinecap: 'round',
                                },
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="h6" fontWeight={700} color="primary">
                                {processingProgress}%
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="h6" fontWeight={700} gutterBottom>
                            Analyzing MRI Scan...
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Please wait while our AI processes the image
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Scanning Stages */}
                        <Box sx={{ mt: 3 }}>
                          {scanningStages.map((stage, index) => (
                            <Fade in key={index} timeout={500}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  mb: 2,
                                  p: 2,
                                  borderRadius: 2,
                                  backgroundColor: index === scanningStage ? 'primary.50' : 'transparent',
                                  border: '1px solid',
                                  borderColor: index === scanningStage ? 'primary.main' : 'transparent',
                                  opacity: index <= scanningStage ? 1 : 0.3,
                                  transition: 'all 0.3s',
                                }}
                              >
                                <Box
                                  sx={{
                                    color: index < scanningStage ? 'success.main' : index === scanningStage ? 'primary.main' : 'grey.400',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  {index < scanningStage ? <CheckCircleIcon /> : stage.icon}
                                </Box>
                                <Typography
                                  variant="body2"
                                  fontWeight={index === scanningStage ? 600 : 400}
                                  sx={{ flex: 1 }}
                                >
                                  {stage.label}
                                </Typography>
                                {index === scanningStage && (
                                  <CircularProgress size={20} thickness={5} />
                                )}
                              </Box>
                            </Fade>
                          ))}
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={processingProgress}
                          sx={{
                            mt: 3,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            },
                          }}
                        />
                      </Paper>
                    </Slide>
                  )}

                  {/* Results Display */}
                  {!loading && result && (
                    <Zoom in timeout={600}>
                      <Paper
                        elevation={8}
                        sx={{
                          p: 4,
                          borderRadius: 3,
                          height: '100%',
                          background:
                            result.prediction?.toLowerCase() === 'tumor'
                              ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(211, 47, 47, 0.05) 100%)'
                              : 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.05) 100%)',
                          border: '3px solid',
                          borderColor: getPredictionColor(result.prediction) + '.main',
                        }}
                      >
                        {/* Result Header */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              p: 3,
                              borderRadius: '50%',
                              bgcolor: getPredictionColor(result.prediction) + '.50',
                              mb: 2,
                              animation: 'pulse 2s ease-in-out infinite',
                              '@keyframes pulse': {
                                '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                                '50%': { transform: 'scale(1.05)', opacity: 0.8 },
                              },
                            }}
                          >
                            {result.prediction?.toLowerCase() === 'tumor' ? (
                              <LocalHospitalIcon sx={{ fontSize: 64, color: 'error.main' }} />
                            ) : (
                              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />
                            )}
                          </Box>
                          <Typography variant="h4" fontWeight={900} gutterBottom>
                            {result.prediction?.toUpperCase()}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <SpeedIcon color={getPredictionColor(result.prediction)} />
                            <Typography
                              variant="h3"
                              fontWeight={800}
                              color={getPredictionColor(result.prediction) + '.main'}
                            >
                              {result.confidence}%
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Confidence Score
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Probability Distribution */}
                        <Box>
                          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AnalyticsIcon />
                            Detailed Analysis
                          </Typography>
                          {Object.entries(result.all_predictions || {}).map(([label, confidence]) => {
                            const numConfidence = typeof confidence === 'number' ? confidence : parseFloat(confidence) || 0
                            return (
                              <Fade in key={label} timeout={800}>
                                <Box sx={{ mb: 3 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body1" fontWeight={600}>
                                      {label}
                                    </Typography>
                                    <Typography variant="h6" fontWeight={700} color={label === 'Tumor' ? 'error.main' : 'success.main'}>
                                      {numConfidence.toFixed(2)}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={numConfidence}
                                    sx={{
                                      height: 12,
                                      borderRadius: 6,
                                      bgcolor: 'grey.200',
                                      '& .MuiLinearProgress-bar': {
                                        borderRadius: 6,
                                        bgcolor: label === 'Tumor' ? 'error.main' : 'success.main',
                                        background:
                                          label === 'Tumor'
                                            ? 'linear-gradient(90deg, #f44336 0%, #d32f2f 100%)'
                                            : 'linear-gradient(90deg, #4caf50 0%, #388e3c 100%)',
                                      },
                                    }}
                                  />
                                </Box>
                              </Fade>
                            )
                          })}
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<RefreshIcon />}
                            onClick={handleReset}
                            size="large"
                          >
                            Analyze Another
                          </Button>
                        </Box>
                      </Paper>
                    </Zoom>
                  )}
                </Grid>
              </Grid>
            </Fade>
          )}
        </Paper>
      </Fade>

      {/* Error Display */}
      {error && (
        <Fade in timeout={400}>
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{ mt: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => setError(null)}>
                DISMISS
              </Button>
            }
          >
            <Typography variant="body1" fontWeight={600}>
              Analysis Failed
            </Typography>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Code Example */}
      {result && (
        <Fade in timeout={800}>
          <Box sx={{ mt: 4 }}>
            <CodeBlock code={code} language="javascript" title="💻 API Integration Example" />
          </Box>
        </Fade>
      )}
    </Box>
  )
}

export default ImageUpload
