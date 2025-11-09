import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { metricsAPI } from '../services/api'
import '../components/Charts/TrainingHistoryChart'
import LossChart from '../components/Charts/LossChart'
import MetricsChart from '../components/Charts/MetricsChart'
import AUCChart from '../components/Charts/AUCChart'
import ConfusionMatrixChart from '../components/Charts/ConfusionMatrixChart'
import PredictionsTable from '../components/PredictionsTable/PredictionsTable'
import ModelTrainingJourney from '../components/ModelTrainingJourney/ModelTrainingJourney'

const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const response = await metricsAPI.getPerformanceSummary()
      setSummary(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (url, filename) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600" align="center" sx={{ mb: 4 }}>
        Performance Dashboard
      </Typography>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Object.entries(summary).map(([key, value], index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {key.replace(/_/g, ' ').toUpperCase()}
                </Typography>
                <Typography variant="h5" fontWeight="700" color="primary.main">
                  {value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Download Buttons */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Download Training Data & Models
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              📊 Training Data
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  handleDownload(
                    metricsAPI.downloadTrainingHistory(),
                    'training_history.csv'
                  )
                }
              >
                Training History 1
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  handleDownload(
                    metricsAPI.downloadTrainingHistory2(),
                    'training_history_2.csv'
                  )
                }
              >
                Training History 2
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  handleDownload(metricsAPI.downloadPredictions(), 'predictions.csv')
                }
              >
                Model Predictions
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              🤖 Trained Models
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  handleDownload('/model/final_brain_tumor_model_97.keras', 'brain_tumor_model_97.keras')
                }
              >
                Final Model (97%)
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() =>
                  handleDownload('/api/download/notebook', 'brain_tumor.ipynb')
                }
              >
                Jupyter Notebook
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Training Journey" />
          <Tab label="Accuracy" />
          <Tab label="Loss" />
          <Tab label="AUC" />
          <Tab label="Metrics" />
          <Tab label="Confusion Matrix" />
          <Tab label="Predictions Data" />
        </Tabs>
      </Box>

      {tabValue === 0 && <ModelTrainingJourney />}
      {tabValue === 1 && <TrainingHistoryChart />}
      {tabValue === 2 && <LossChart />}
      {tabValue === 3 && <AUCChart />}
      {tabValue === 4 && <MetricsChart />}
      {tabValue === 5 && <ConfusionMatrixChart />}
      {tabValue === 6 && <PredictionsTable />}
    </Box>
  )
}

export default DashboardPage
