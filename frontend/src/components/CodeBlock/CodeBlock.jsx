import React, { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Tooltip,
} from '@mui/material'
import CodeIcon from '@mui/icons-material/Code'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useSnackbar } from 'notistack'

const CodeBlock = ({ code, language = 'javascript', title = 'Code' }) => {
  const [expanded, setExpanded] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    enqueueSnackbar('Code copied to clipboard!', { variant: 'success' })
  }

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: 'grey.100',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon color="primary" />
          <Typography variant="subtitle1" fontWeight="600">
            {title}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Copy code">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleCopy()
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>
      <Collapse in={expanded}>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '0.875rem',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </Collapse>
    </Paper>
  )
}

export default CodeBlock
