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

const MetricsChart = () => {
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
            label: 'Precision',
            data: data.history.val_precision,
            borderColor: 'rgb(76, 175, 80)',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
          },
          {
            label: 'Recall',
            data: data.history.val_recall,
            borderColor: 'rgb(255, 152, 0)',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
          },
          {
            label: 'AUC',
            data: data.history.val_auc,
            borderColor: 'rgb(156, 39, 176)',
            backgroundColor: 'rgba(156, 39, 176, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
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
            size: 13,
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: 'Model Performance Metrics (Precision, Recall, AUC)',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            label += (context.parsed.y * 100).toFixed(2) + '%'
            return label
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(value) {
            return (value * 100).toFixed(0) + '%'
          }
        },
        title: {
          display: true,
          text: 'Score',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Epoch',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
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
    return <Alert severity="error">Error loading metrics data: {error}</Alert>
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ height: 400 }}>
        {chartData && <Line data={chartData} options={options} />}
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
          Final Model Performance
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                color: 'white'
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Precision
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {finalMetrics ? (finalMetrics.val_precision * 100).toFixed(2) + '%' : '-'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
                color: 'white'
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Recall
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {finalMetrics ? (finalMetrics.val_recall * 100).toFixed(2) + '%' : '-'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
                color: 'white'
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                AUC Score
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {finalMetrics ? finalMetrics.val_auc.toFixed(4) : '-'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Additional Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Precision:</strong> Proportion of positive identifications that were actually correct (reduces false positives)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Recall:</strong> Proportion of actual positives that were identified correctly (reduces false negatives)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>AUC (Area Under Curve):</strong> Overall measure of model performance across all classification thresholds
        </Typography>
      </Box>
    </Paper>
  )
}

export default MetricsChart
