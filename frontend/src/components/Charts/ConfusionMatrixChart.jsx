import React, { useEffect, useState } from 'react'
import { Box, Paper, CircularProgress, Alert, Typography, Grid } from '@mui/material'
import { metricsAPI } from '../../services/api'

const ConfusionMatrixChart = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [matrixData, setMatrixData] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await metricsAPI.getConfusionMatrix()
      setMatrixData(response.data.confusion_matrix)
      setStats(response.data.statistics)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">Error loading confusion matrix: {error}</Alert>
  }

  if (!matrixData || !stats) {
    return <Alert severity="warning">Confusion matrix data not available</Alert>
  }

  const [[tn, fp], [fn, tp]] = matrixData
  const total = tn + fp + fn + tp
  
  // Calculate percentages for cell coloring
  const getPercentage = (value) => (value / total) * 100
  const getColor = (value, isCorrect) => {
    const percentage = getPercentage(value)
    if (isCorrect) {
      // Green shades for correct predictions
      if (percentage > 40) return { bg: '#4caf50', color: 'white' }
      if (percentage > 30) return { bg: '#66bb6a', color: 'white' }
      if (percentage > 20) return { bg: '#81c784', color: 'white' }
      return { bg: '#a5d6a7', color: '#000' }
    } else {
      // Red shades for incorrect predictions
      if (percentage > 10) return { bg: '#f44336', color: 'white' }
      if (percentage > 5) return { bg: '#e57373', color: 'white' }
      if (percentage > 2) return { bg: '#ef9a9a', color: '#000' }
      return { bg: '#ffcdd2', color: '#000' }
    }
  }

  const MatrixCell = ({ value, label, subtitle, isCorrect }) => {
    const colors = getColor(value, isCorrect)
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: colors.bg,
          color: colors.color,
          minHeight: 140,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.05)',
            zIndex: 1,
          },
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: '600', mb: 1 }}>
          {label}
        </Typography>
        <Typography variant="h2" fontWeight="bold" sx={{ my: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: '500' }}>
          {getPercentage(value).toFixed(1)}%
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.75, mt: 1, fontSize: '0.7rem' }}>
          {subtitle}
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold" align="center" color="primary" sx={{ mb: 1 }}>
        Confusion Matrix
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Model predictions vs actual labels on test dataset
      </Typography>

      {/* Matrix Grid */}
      <Box sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
        <Grid container spacing={2}>
          {/* Header Row */}
          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            <Typography variant="h6" align="center" fontWeight="bold" color="primary">
              Predicted Healthy
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6" align="center" fontWeight="bold" color="error">
              Predicted Tumor
            </Typography>
          </Grid>

          {/* Actual Healthy Row */}
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', pr: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="primary">
                Actual Healthy
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <MatrixCell 
              value={tn} 
              label="True Negative (TN)" 
              subtitle="Correctly identified healthy"
              isCorrect={true}
            />
          </Grid>
          <Grid item xs={4}>
            <MatrixCell 
              value={fp} 
              label="False Positive (FP)" 
              subtitle="Healthy predicted as tumor"
              isCorrect={false}
            />
          </Grid>

          {/* Actual Tumor Row */}
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', pr: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="error">
                Actual Tumor
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <MatrixCell 
              value={fn} 
              label="False Negative (FN)" 
              subtitle="Tumor predicted as healthy"
              isCorrect={false}
            />
          </Grid>
          <Grid item xs={4}>
            <MatrixCell 
              value={tp} 
              label="True Positive (TP)" 
              subtitle="Correctly identified tumor"
              isCorrect={true}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary" align="center" sx={{ mb: 3 }}>
          Performance Metrics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Accuracy
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {(stats.accuracy * 100).toFixed(2)}%
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Precision
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="secondary">
                {(stats.precision * 100).toFixed(2)}%
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Recall
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#f57c00' }}>
                {(stats.recall * 100).toFixed(2)}%
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                F1 Score
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#388e3c' }}>
                {(stats.f1_score * 100).toFixed(2)}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Educational Info */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
          📚 Understanding the Confusion Matrix
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong style={{ color: '#4caf50' }}>• True Positive (TP):</strong> Model correctly identified {tp} tumors
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong style={{ color: '#4caf50' }}>• True Negative (TN):</strong> Model correctly identified {tn} healthy scans
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong style={{ color: '#f44336' }}>• False Positive (FP):</strong> {fp} healthy scans misclassified as tumor
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong style={{ color: '#f44336' }}>• False Negative (FN):</strong> {fn} tumors misclassified as healthy
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
          <strong>Note:</strong> In medical diagnosis, False Negatives (missing actual tumors) are typically more 
          critical than False Positives, as they can delay necessary treatment.
        </Typography>
      </Box>
    </Paper>
  )
}

export default ConfusionMatrixChart
