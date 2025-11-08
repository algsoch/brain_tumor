import React, { useEffect, useState } from 'react'
import { Box, Paper, CircularProgress, Alert, Typography } from '@mui/material'
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

const LossChart = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartData, setChartData] = useState(null)

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
            label: 'Training Loss',
            data: data.history.loss,
            borderColor: 'rgb(244, 67, 54)',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
          },
          {
            label: 'Validation Loss',
            data: data.history.val_loss,
            borderColor: 'rgb(33, 150, 243)',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
          },
        ],
      }

      setChartData(chartConfig)
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
        text: 'Training & Validation Loss Over Epochs',
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
            label += context.parsed.y.toFixed(4)
            return label
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Loss Value',
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
    return <Alert severity="error">Error loading loss data: {error}</Alert>
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ height: 400 }}>
        {chartData && <Line data={chartData} options={options} />}
      </Box>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Final Training Loss
          </Typography>
          <Typography variant="h6" color="error.main" fontWeight="bold">
            {chartData?.datasets[0]?.data[chartData.datasets[0].data.length - 1]?.toFixed(4)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Final Validation Loss
          </Typography>
          <Typography variant="h6" color="primary.main" fontWeight="bold">
            {chartData?.datasets[1]?.data[chartData.datasets[1].data.length - 1]?.toFixed(4)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Minimum Validation Loss
          </Typography>
          <Typography variant="h6" color="success.main" fontWeight="bold">
            {chartData?.datasets[1]?.data && Math.min(...chartData.datasets[1].data).toFixed(4)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default LossChart
