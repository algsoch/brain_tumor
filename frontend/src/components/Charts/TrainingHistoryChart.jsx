import React, { useEffect, useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TimelineIcon from '@mui/icons-material/Timeline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
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
import axios from 'axios'
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
  const [combinedData, setCombinedData] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadTrainingHistory()
  }, [])

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    const data = []
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim())
        const row = {}
        headers.forEach((header, index) => {
          row[header] = parseFloat(values[index]) || 0
        })
        data.push(row)
      }
    }
    
    return data
  }

  const loadTrainingHistory = async () => {
    try {
      setLoading(true)
      
      // Fetch both CSV files
      const [csv1Response, csv2Response] = await Promise.all([
        axios.get(metricsAPI.downloadTrainingHistory()),
        axios.get(metricsAPI.downloadTrainingHistory2())
      ])
      
      const history1 = parseCSV(csv1Response.data)
      const history2 = parseCSV(csv2Response.data)
      
      // Combine both training phases
      const combined = [
        ...history1.map((row, idx) => ({ ...row, epoch: idx + 1, phase: 'Initial Training' })),
        ...history2.map((row, idx) => ({ ...row, epoch: history1.length + idx + 1, phase: 'Fine-tuning' }))
      ]
      
      setCombinedData(combined)
      
      // Calculate statistics
      const firstEpoch = combined[0]
      const lastEpoch = combined[combined.length - 1]
      const bestEpoch = combined.reduce((best, current) => 
        current.val_accuracy > best.val_accuracy ? current : best
      )
      
      setStats({
        totalEpochs: combined.length,
        initialValAcc: (firstEpoch.val_accuracy * 100).toFixed(2),
        finalValAcc: (lastEpoch.val_accuracy * 100).toFixed(2),
        bestValAcc: (bestEpoch.val_accuracy * 100).toFixed(2),
        bestEpoch: bestEpoch.epoch,
        improvement: ((lastEpoch.val_accuracy - firstEpoch.val_accuracy) * 100).toFixed(2),
        finalPrecision: (lastEpoch.val_precision * 100).toFixed(2),
        finalRecall: (lastEpoch.val_recall * 100).toFixed(2),
        finalAUC: (lastEpoch.val_auc * 100).toFixed(2),
      })

      // Prepare chart data
      const data = {
        labels: combined.map(row => row.epoch),
        datasets: [
          {
            label: 'Training Accuracy',
            data: combined.map(row => row.accuracy * 100),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: 'Validation Accuracy',
            data: combined.map(row => row.val_accuracy * 100),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.3,
            pointRadius: 3,
          },
        ],
      }

      setChartData(data)
      setError(null)
    } catch (err) {
      console.error('Error loading training history:', err)
      setError(err.message || 'Failed to load training history')
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
        text: 'Model Training Accuracy Over Epochs (Both Training Phases)',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 80,
        max: 100,
        title: {
          display: true,
          text: 'Accuracy (%)',
        },
        ticks: {
          callback: function(value) {
            return value + '%'
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Epoch',
        },
      },
    },
  }

  const lossOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Training and Validation Loss Over Epochs',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Loss',
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

  const metricsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Validation Metrics Over Epochs',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 90,
        max: 100,
        title: {
          display: true,
          text: 'Score (%)',
        },
        ticks: {
          callback: function(value) {
            return value + '%'
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Epoch',
        },
      },
    },
  }

  const lossChartData = combinedData.length > 0 ? {
    labels: combinedData.map(row => row.epoch),
    datasets: [
      {
        label: 'Training Loss',
        data: combinedData.map(row => row.loss),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: 'Validation Loss',
        data: combinedData.map(row => row.val_loss),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  } : null

  const metricsChartData = combinedData.length > 0 ? {
    labels: combinedData.map(row => row.epoch),
    datasets: [
      {
        label: 'Precision',
        data: combinedData.map(row => row.val_precision * 100),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: 'Recall',
        data: combinedData.map(row => row.val_recall * 100),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: 'AUC',
        data: combinedData.map(row => row.val_auc * 100),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  } : null

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
      {/* Statistics Overview */}
      {stats && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography variant="h5" fontWeight="700" color="white" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon /> Training Summary
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 2, borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">Total Epochs</Typography>
                <Typography variant="h4" fontWeight="700" color="white">{stats.totalEpochs}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 2, borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">Improvement</Typography>
                <Typography variant="h4" fontWeight="700" color="white" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon /> +{stats.improvement}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 2, borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">Best Val Accuracy</Typography>
                <Typography variant="h4" fontWeight="700" color="white">{stats.bestValAcc}%</Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.7)">Epoch {stats.bestEpoch}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 2, borderRadius: 2, backdropFilter: 'blur(10px)' }}>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">Final Val Accuracy</Typography>
                <Typography variant="h4" fontWeight="700" color="white">{stats.finalValAcc}%</Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* Additional Metrics */}
          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">Precision</Typography>
                <Typography variant="h6" fontWeight="600" color="white">{stats.finalPrecision}%</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">Recall</Typography>
                <Typography variant="h6" fontWeight="600" color="white">{stats.finalRecall}%</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">AUC</Typography>
                <Typography variant="h6" fontWeight="600" color="white">{stats.finalAUC}%</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Accuracy Chart */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ height: 400 }}>
          {chartData && <Line options={options} data={chartData} />}
        </Box>
      </Paper>

      {/* Loss Chart */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ height: 400 }}>
          {lossChartData && <Line options={lossOptions} data={lossChartData} />}
        </Box>
      </Paper>

      {/* Metrics Chart */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ height: 400 }}>
          {metricsChartData && <Line options={metricsOptions} data={metricsChartData} />}
        </Box>
      </Paper>

      {/* Detailed Epoch Table */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="primary" /> Epoch-by-Epoch Analysis
        </Typography>
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Epoch</strong></TableCell>
                <TableCell><strong>Phase</strong></TableCell>
                <TableCell><strong>Train Acc</strong></TableCell>
                <TableCell><strong>Val Acc</strong></TableCell>
                <TableCell><strong>Train Loss</strong></TableCell>
                <TableCell><strong>Val Loss</strong></TableCell>
                <TableCell><strong>Precision</strong></TableCell>
                <TableCell><strong>Recall</strong></TableCell>
                <TableCell><strong>AUC</strong></TableCell>
                <TableCell><strong>LR</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {combinedData.map((row, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    bgcolor: stats && row.epoch === stats.bestEpoch ? 'rgba(76, 175, 80, 0.1)' : 'inherit',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  <TableCell>
                    {row.epoch}
                    {stats && row.epoch === stats.bestEpoch && (
                      <Chip label="Best" color="success" size="small" sx={{ ml: 1 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.phase} 
                      color={row.phase === 'Initial Training' ? 'primary' : 'secondary'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{(row.accuracy * 100).toFixed(2)}%</TableCell>
                  <TableCell>{(row.val_accuracy * 100).toFixed(2)}%</TableCell>
                  <TableCell>{row.loss.toFixed(4)}</TableCell>
                  <TableCell>{row.val_loss.toFixed(4)}</TableCell>
                  <TableCell>{(row.val_precision * 100).toFixed(2)}%</TableCell>
                  <TableCell>{(row.val_recall * 100).toFixed(2)}%</TableCell>
                  <TableCell>{(row.val_auc * 100).toFixed(2)}%</TableCell>
                  <TableCell>{row.learning_rate.toExponential(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Interpretation */}
      <Paper elevation={3} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          📊 Analysis & Interpretation
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Training Overview:</strong> The model underwent {stats?.totalEpochs} epochs of training across two phases:
        </Typography>
        <Box sx={{ pl: 3, mb: 2 }}>
          <Typography variant="body2" paragraph>
            • <strong>Initial Training (15 epochs):</strong> Learning rate started at 0.001 and was reduced to 0.0005. 
            Validation accuracy improved from {stats?.initialValAcc}% to approximately 95%.
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>Fine-tuning (10 epochs):</strong> Lower learning rate of 7e-06 for fine adjustments. 
            Final validation accuracy reached {stats?.finalValAcc}%.
          </Typography>
        </Box>
        <Typography variant="body1" paragraph>
          <strong>Performance Insights:</strong>
        </Typography>
        <Box sx={{ pl: 3, mb: 2 }}>
          <Typography variant="body2" paragraph>
            • The model shows excellent generalization with minimal overfitting (train-validation gap &lt; 3%)
          </Typography>
          <Typography variant="body2" paragraph>
            • High precision ({stats?.finalPrecision}%) indicates few false positives
          </Typography>
          <Typography variant="body2" paragraph>
            • High recall ({stats?.finalRecall}%) means the model successfully detects most tumor cases
          </Typography>
          <Typography variant="body2" paragraph>
            • AUC of {stats?.finalAUC}% demonstrates strong discriminative ability between classes
          </Typography>
        </Box>
        <Alert severity="success" sx={{ mt: 2 }}>
          <strong>Best Model:</strong> Epoch {stats?.bestEpoch} achieved the highest validation accuracy of {stats?.bestValAcc}%, 
          making it the optimal checkpoint for deployment.
        </Alert>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <CodeBlock 
          code={code} 
          language="javascript" 
          title="Training History Visualization Code" 
        />
      </Box>
    </Box>
  )
}

export default TrainingHistoryChart
