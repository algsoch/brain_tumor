import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import PredictPage from './pages/PredictPage'
import DashboardPage from './pages/DashboardPage'
import GalleryPage from './pages/GalleryPage'
import AboutPage from './pages/AboutPage'
import APIKeysPage from './pages/APIKeysPage'

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/predict" element={<PredictPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/api-keys" element={<APIKeysPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Layout>
    </Box>
  )
}

export default App
