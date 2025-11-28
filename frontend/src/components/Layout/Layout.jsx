import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
  Fade,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import PsychologyIcon from '@mui/icons-material/Psychology'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import InfoIcon from '@mui/icons-material/Info'
import KeyIcon from '@mui/icons-material/Key'
import CloudDoneIcon from '@mui/icons-material/CloudDone'
import CloudOffIcon from '@mui/icons-material/CloudOff'
import SyncIcon from '@mui/icons-material/Sync'
import { generalAPI } from '../../services/api'

const pages = [
  { name: 'Home', path: '/', icon: <HomeIcon /> },
  { name: 'Predict', path: '/predict', icon: <PsychologyIcon /> },
  { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { name: 'Gallery', path: '/gallery', icon: <PhotoLibraryIcon /> },
  { name: 'API Keys', path: '/api-keys', icon: <KeyIcon /> },
  { name: 'About', path: '/about', icon: <InfoIcon /> },
]

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('checking') // 'connected', 'disconnected', 'checking'
  const [modelStatus, setModelStatus] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Check backend connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking')
        const response = await generalAPI.healthCheck()
        if (response.status === 'healthy') {
          setConnectionStatus('connected')
          setModelStatus(response.model_loaded ? 'ready' : 'loading')
        } else {
          setConnectionStatus('disconnected')
        }
      } catch (error) {
        console.error('Backend connection check failed:', error)
        setConnectionStatus('disconnected')
      }
    }

    checkConnection()
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleNavigation = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Brain Tumor Detection
      </Typography>
      <List>
        {pages.map((page) => (
          <ListItem key={page.name} disablePadding>
            <ListItemButton
              selected={location.pathname === page.path}
              onClick={() => handleNavigation(page.path)}
            >
              <ListItemIcon>{page.icon}</ListItemIcon>
              <ListItemText primary={page.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={2}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <PsychologyIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              Brain Tumor Detection
            </Typography>

            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                color: 'inherit',
              }}
            >
              BTD
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.name}
                  onClick={() => handleNavigation(page.path)}
                  sx={{
                    my: 2,
                    color: 'white',
                    display: 'block',
                    mx: 1,
                    backgroundColor: location.pathname === page.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                  startIcon={page.icon}
                >
                  {page.name}
                </Button>
              ))}
            </Box>

            {/* Connection Status Indicator */}
            <Tooltip 
              title={
                connectionStatus === 'connected' 
                  ? `Backend Connected${modelStatus === 'ready' ? ' • AI Model Ready' : ' • Model Loading...'}`
                  : connectionStatus === 'checking'
                  ? 'Checking connection...'
                  : 'Backend Disconnected - Some features may not work'
              }
              arrow
            >
              <Chip
                icon={
                  connectionStatus === 'connected' ? (
                    <CloudDoneIcon sx={{ 
                      color: '#fff !important',
                      animation: 'none',
                    }} />
                  ) : connectionStatus === 'checking' ? (
                    <SyncIcon sx={{ 
                      color: '#fff !important',
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }} />
                  ) : (
                    <CloudOffIcon sx={{ 
                      color: '#fff !important',
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }} />
                  )
                }
                label={
                  isMobile 
                    ? '' 
                    : connectionStatus === 'connected' 
                    ? 'Online' 
                    : connectionStatus === 'checking'
                    ? 'Checking...'
                    : 'Offline'
                }
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: 
                    connectionStatus === 'connected' 
                      ? 'rgba(76, 175, 80, 0.9)' 
                      : connectionStatus === 'checking'
                      ? 'rgba(255, 193, 7, 0.9)'
                      : 'rgba(244, 67, 54, 0.9)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: connectionStatus === 'connected' 
                    ? '0 0 10px rgba(76, 175, 80, 0.5)' 
                    : connectionStatus === 'checking'
                    ? '0 0 10px rgba(255, 193, 7, 0.5)'
                    : '0 0 10px rgba(244, 67, 54, 0.5)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: connectionStatus === 'connected' 
                      ? '0 0 20px rgba(76, 175, 80, 0.7)' 
                      : connectionStatus === 'checking'
                      ? '0 0 20px rgba(255, 193, 7, 0.7)'
                      : '0 0 20px rgba(244, 67, 54, 0.7)',
                  },
                  '& .MuiChip-icon': {
                    color: 'white',
                  },
                  minWidth: isMobile ? 'auto' : '90px',
                }}
                onClick={() => {
                  // Retry connection check on click
                  setConnectionStatus('checking')
                  generalAPI.healthCheck()
                    .then(response => {
                      if (response.status === 'healthy') {
                        setConnectionStatus('connected')
                        setModelStatus(response.model_loaded ? 'ready' : 'loading')
                      } else {
                        setConnectionStatus('disconnected')
                      }
                    })
                    .catch(() => setConnectionStatus('disconnected'))
                }}
              />
            </Tooltip>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 Brain Tumor Detection System. AI-Powered Medical Imaging Analysis.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default Layout
