import React, { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { metricsAPI } from '../../services/api'
import CodeBlock from '../CodeBlock/CodeBlock'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const TrainingHistoryChart = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    loadTrainingHistory()
  }, [])

  const loadTrainingHistory = async () => {
    try {
      setLoading(true)
      const response = await metricsAPI.getTrainingHistory()
      const history = response.data.history

      const data = {
        labels: history.epoch,
        datasets: [
          {
            label: 'Training Accuracy',
            data: history.accuracy,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
          },
          {
            label: 'Validation Accuracy',
            data: history.val_accuracy,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.3,
          },
        ],
      }

      setChartData(data)
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
      },
      title: {
        display: true,
        text: 'Model Training Accuracy Over Epochs',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 0.8,
        max: 1.0,
        title: {
          display: true,
          text: 'Accuracy',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Epoch',
        },
      },
    },
  }

  const code = `// Training History Chart Code
import { Line } from 'react-chartjs-2';
import { metricsAPI } from './services/api';

const loadData = async () => {
  const response = await metricsAPI.getTrainingHistory();
  const history = response.data.history;
  
  const chartData = {
    labels: history.epoch,
    datasets: [
      {
        label: 'Training Accuracy',
        data: history.accuracy,
        borderColor: 'rgb(75, 192, 192)',
      },
      {
        label: 'Validation Accuracy',
        data: history.val_accuracy,
        borderColor: 'rgb(255, 99, 132)',
      },
    ],
  };
};`

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ height: 400 }}>
          {chartData && <Line options={options} data={chartData} />}
        </Box>
      </Paper>
      <Box sx={{ mt: 2 }}>
        <CodeBlock code={code} language="javascript" title="Accuracy Chart Code" />
      </Box>
    </Box>
  )
}

export default TrainingHistoryChart
