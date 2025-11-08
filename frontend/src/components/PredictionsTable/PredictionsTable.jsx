import React, { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import DownloadIcon from '@mui/icons-material/Download'
import { metricsAPI } from '../../services/api'

const PredictionsTable = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [filteredPredictions, setFilteredPredictions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadPredictions()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = predictions.filter(pred =>
        pred.filepath.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pred.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPredictions(filtered)
    } else {
      setFilteredPredictions(predictions)
    }
    setPage(0)
  }, [searchTerm, predictions])

  const loadPredictions = async () => {
    try {
      setLoading(true)
      const response = await metricsAPI.getPredictionsSummary()
      
      if (response.data.sample_data) {
        // Parse the CSV data (backend returns sample_data)
        const predData = response.data.sample_data
        setPredictions(predData)
        setFilteredPredictions(predData)
        
        // Calculate statistics
        const total = response.data.total_predictions || predData.length
        const correct = predData.filter(p => p.correct === true || p.correct === 'True').length
        const incorrect = predData.filter(p => p.correct === false || p.correct === 'False').length
        const accuracy = total > 0 ? ((correct / total) * 100).toFixed(2) : 0
        
        const tumorCount = predData.filter(p => p.label === 'tumor').length
        const healthyCount = predData.filter(p => p.label === 'healthy').length
        
        setStats({
          total,
          correct,
          incorrect,
          accuracy,
          tumorCount,
          healthyCount
        })
      }
      
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDownload = () => {
    const url = metricsAPI.downloadPredictions()
    const link = document.createElement('a')
    link.href = url
    link.download = 'model_predictions.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileName = (filepath) => {
    return filepath.split('/').pop()
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">Error loading predictions: {error}</Alert>
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Model Predictions Data
        </Typography>
        <IconButton 
          color="primary" 
          onClick={handleDownload}
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          <DownloadIcon />
        </IconButton>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                <Typography variant="body2">Total</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{stats.correct}</Typography>
                <Typography variant="body2">Correct</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{stats.incorrect}</Typography>
                <Typography variant="body2">Incorrect</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{stats.accuracy}%</Typography>
                <Typography variant="body2">Accuracy</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{stats.tumorCount}</Typography>
                <Typography variant="body2">Tumor</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" fontWeight="bold">{stats.healthyCount}</Typography>
                <Typography variant="body2">Healthy</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by filename or label..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Filename</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>True Label</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Predicted</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Confidence</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPredictions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((prediction, index) => (
                <TableRow 
                  key={index}
                  hover
                  sx={{ 
                    '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {getFileName(prediction.filepath)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={prediction.label}
                      color={prediction.label === 'tumor' ? 'warning' : 'info'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={prediction.predicted_class === 1 ? 'tumor' : 'healthy'}
                      color={prediction.predicted_class === 1 ? 'warning' : 'info'}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {(parseFloat(prediction.confidence) * 100).toFixed(2)}%
                      </Typography>
                      <Box 
                        sx={{ 
                          width: 60, 
                          height: 6, 
                          bgcolor: 'grey.300', 
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: `${parseFloat(prediction.confidence) * 100}%`,
                            height: '100%',
                            bgcolor: parseFloat(prediction.confidence) > 0.8 ? 'success.main' : 
                                    parseFloat(prediction.confidence) > 0.5 ? 'warning.main' : 'error.main',
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {(prediction.correct === true || prediction.correct === 'True') ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CancelIcon color="error" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={filteredPredictions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}

export default PredictionsTable
