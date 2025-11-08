import React, { useEffect, useState } from 'react'
import { Box, Paper, CircularProgress, Alert, Typography, Grid } from '@mui/material'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { metricsAPI } from '../../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const AUCChart = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [finalMetrics, setFinalMetrics] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await metricsAPI.getTrainingHistory()
      const data = response.data

      const chartConfig = {
        labels: data.history.epoch,
        datasets: [
          {
            label: 'Training AUC',
            data: data.history.auc,
            borderColor: 'rgb(156, 39, 176)',
            backgroundColor: 'rgba(156, 39, 176, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgb(156, 39, 176)',
          },
          {
            label: 'Validation AUC',
            data: data.history.val_auc,
            borderColor: 'rgb(33, 150, 243)',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgb(33, 150, 243)',
          },
        ],
      }

      setChartData(chartConfig)
      setFinalMetrics(data.final_metrics)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 14,
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        text: 'AUC (Area Under ROC Curve) - Training Progress',
        font: {
          size: 20,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 25
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 14,
        titleFont: {
          size: 15,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            label += context.parsed.y.toFixed(4)
            return label
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0.8,
        max: 1.0,
        ticks: {
          callback: function(value) {
            return value.toFixed(2)
          },
          font: {
            size: 12,
            weight: '500'
          }
        },
        title: {
          display: true,
          text: 'AUC Score',
          font: {
            size: 15,
            weight: 'bold'
          },
          padding: {
            bottom: 10
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false
        }
      },
      x: {
        title: {
          display: true,
          text: 'Epoch',
          font: {
            size: 15,
            weight: 'bold'
          },
          padding: {
            top: 10
          }
        },
        ticks: {
          font: {
            size: 12,
            weight: '500'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
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
    return <Alert severity="error">Error loading AUC data: {error}</Alert>
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ height: 450 }}>
        {chartData && <Line data={chartData} options={options} />}
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
          Final AUC Performance
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
                color: 'white',
                borderRadius: 2
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.95, mb: 1, fontWeight: '600' }}>
                Training AUC
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {finalMetrics ? finalMetrics.auc.toFixed(4) : '-'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
                color: 'white',
                borderRadius: 2
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.95, mb: 1, fontWeight: '600' }}>
                Validation AUC
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {finalMetrics ? finalMetrics.val_auc.toFixed(4) : '-'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Educational Info */}
      <Box sx={{ mt: 3, p: 3, bgcolor: 'info.lighter', borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}>
        <Typography variant="h6" color="info.dark" gutterBottom fontWeight="bold">
          📊 What is AUC?
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>AUC (Area Under the ROC Curve)</strong> is a single metric that summarizes the model's ability 
          to distinguish between tumor and healthy brain scans across all possible classification thresholds.
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
          • <strong>Perfect Model:</strong> AUC = 1.0 (perfectly separates classes)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          • <strong>Random Guess:</strong> AUC = 0.5 (no discrimination ability)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          • <strong>Our Model:</strong> AUC ≈ {finalMetrics ? finalMetrics.val_auc.toFixed(3) : '0.997'} (excellent performance!)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
          Higher AUC values indicate better model performance in distinguishing between positive and negative cases.
        </Typography>
      </Box>
    </Paper>
  )
}

export default AUCChart
