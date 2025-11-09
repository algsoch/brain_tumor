import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Tab,
  Tabs,
  CircularProgress,
  LinearProgress,
  Fade,
  Zoom,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  CardActions,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import KeyIcon from '@mui/icons-material/Key'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CodeIcon from '@mui/icons-material/Code'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FolderIcon from '@mui/icons-material/Folder'
import CancelIcon from '@mui/icons-material/Cancel'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import DescriptionIcon from '@mui/icons-material/Description'
import SpeedIcon from '@mui/icons-material/Speed'
import ImageIcon from '@mui/icons-material/Image'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import axios from 'axios'
import { galleryAPI, predictionAPI } from '../services/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const APIKeysPage = () => {
  // State for API key management
  const [keyName, setKeyName] = useState('My API Key')
  const [description, setDescription] = useState('')
  const [expiresInDays, setExpiresInDays] = useState(365)
  const [generatedKey, setGeneratedKey] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  
  // State for code examples
  const [showExample, setShowExample] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(0)
  const [authMode, setAuthMode] = useState('with-key') // 'with-key' or 'no-key'
  
  // State for live testing
  const [testMode, setTestMode] = useState('upload') // 'upload' or 'gallery'
  const [testAuthMode, setTestAuthMode] = useState('with-key') // 'with-key' or 'no-key'
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadPreview, setUploadPreview] = useState(null)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [showGalleryDialog, setShowGalleryDialog] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [testDuration, setTestDuration] = useState(null)

  // Load gallery images on mount
  useEffect(() => {
    loadGalleryImages()
  }, [])

  const loadGalleryImages = async () => {
    try {
      const response = await galleryAPI.getImages({ page: 1, page_size: 50 })
      setGalleryImages(response.data.images.slice(0, 20)) // Load first 20 for testing
    } catch (err) {
      console.error('Failed to load gallery images:', err)
    }
  }

  const handleGenerateKey = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.post(`${API_BASE_URL}/api/keys/generate`, {
        name: keyName,
        description: description || null,
        expires_in_days: expiresInDays,
      })

      setGeneratedKey(response.data.data)
      setKeyName('My API Key')
      setDescription('')
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadPreview(reader.result)
      }
      reader.readAsDataURL(file)
      setTestResult(null)
    }
  }

  const handleGalleryImageSelect = (image) => {
    setSelectedGalleryImage(image)
    setShowGalleryDialog(false)
    setTestResult(null)
  }

  const handleTestAPI = async () => {
    try {
      setTesting(true)
      setError(null)
      setTestResult(null)
      
      const startTime = Date.now()

      let result
      
      // Get API key if testing with authentication
      const apiKey = testAuthMode === 'with-key' ? generatedKey?.api_key : null
      
      if (testMode === 'upload' && uploadedFile) {
        // Test with uploaded file
        result = await predictionAPI.predictImage(uploadedFile, apiKey)
      } else if (testMode === 'gallery' && selectedGalleryImage) {
        // Test with gallery image
        const imageResponse = await axios.get(galleryAPI.getImageUrl(selectedGalleryImage.path), {
          responseType: 'blob'
        })
        
        const blob = imageResponse.data
        const file = new File([blob], selectedGalleryImage.filename, { type: blob.type || 'image/jpeg' })
        
        result = await predictionAPI.predictImage(file, apiKey)
      } else {
        setError('Please select or upload an image first')
        setTesting(false)
        return
      }

      const duration = Date.now() - startTime
      setTestDuration(duration)
      
      // Debug: Log the actual response structure
      console.log('API Response:', result)
      console.log('Result Data:', result.data)
      console.log('All Predictions:', result.data?.all_predictions)
      
      setTestResult(result.data)
      
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setTesting(false)
    }
  }

  const handleReset = () => {
    setUploadedFile(null)
    setUploadPreview(null)
    setSelectedGalleryImage(null)
    setTestResult(null)
    setTestDuration(null)
    setError(null)
  }

  // Code examples
  const codeExamples = {
    python: `import requests
import json

# Configuration
API_URL = "${API_BASE_URL}/api/predict/"
API_KEY = "${generatedKey?.api_key || 'your_api_key_here'}"

def predict_brain_tumor(image_path):
    """
    Upload and analyze brain MRI scan
    Returns: Prediction result with confidence scores
    """
    try:
        # Prepare the image file
        with open(image_path, 'rb') as f:
            files = {'file': f}
            headers = {'X-API-Key': API_KEY}
            
            # Make API request
            response = requests.post(API_URL, files=files, headers=headers)
            response.raise_for_status()
            
            # Parse response
            result = response.json()
            
            if result['success']:
                data = result['data']
                print("="*50)
                print("🧠 BRAIN TUMOR DETECTION RESULT")
                print("="*50)
                print(f"Prediction:  {data['prediction'].upper()}")
                print(f"Confidence:  {data['confidence']:.2f}%")
                print(f"\\nProbabilities:")
                print(f"  Healthy:   {data['all_predictions']['Healthy']:.2f}%")
                print(f"  Tumor:     {data['all_predictions']['Tumor']:.2f}%")
                print("="*50)
                
                return data
            else:
                print(f"❌ Prediction failed: {result.get('message')}")
                return None
                
    except requests.exceptions.RequestException as e:
        print(f"❌ API Error: {e}")
        return None
    except FileNotFoundError:
        print(f"❌ Image file not found: {image_path}")
        return None

# Example usage
if __name__ == "__main__":
    result = predict_brain_tumor("brain_scan.jpg")
    
    if result:
        # Access prediction details
        is_tumor = result['prediction'] == 'tumor'
        confidence = result['confidence']
        
        if is_tumor:
            print(f"⚠️  TUMOR DETECTED with {confidence*100:.1f}% confidence")
        else:
            print(f"✅ HEALTHY SCAN with {confidence*100:.1f}% confidence")`,

    curl: `#!/bin/bash

# Brain Tumor Detection API - cURL Example
# ==========================================

API_URL="${API_BASE_URL}/api/predict/"
API_KEY="${generatedKey?.api_key || 'your_api_key_here'}"
IMAGE_PATH="brain_scan.jpg"

# Make prediction request
echo "🧠 Analyzing brain scan..."
echo ""

response=$(curl -s -X POST "$API_URL" \\
  -H "X-API-Key: $API_KEY" \\
  -F "file=@$IMAGE_PATH")

# Parse and display results
echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data['success']:
    result = data['data']
    print('='*50)
    print('PREDICTION RESULT')
    print('='*50)
    print(f\"Prediction:  {result['prediction'].upper()}\")
    print(f\"Confidence:  {result['confidence']:.2f}%\")
    print(f\"Healthy:     {result['all_predictions']['Healthy']:.2f}%\")
    print(f\"Tumor:       {result['all_predictions']['Tumor']:.2f}%\")
    print('='*50)
else:
    print('Error:', data.get('message'))
"

# Check API health
echo ""
echo "Checking API health..."
curl -s "${API_BASE_URL}/health" | python3 -m json.tool`,

    javascript: `// Brain Tumor Detection API - JavaScript/React Example
// ======================================================

const API_URL = '${API_BASE_URL}/api/predict/';
const API_KEY = '${generatedKey?.api_key || 'your_api_key_here'}';

/**
 * Predict brain tumor from image file
 * @param {File} file - Image file from input
 * @returns {Promise<Object>} Prediction result
 */
async function predictBrainTumor(file) {
  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    // Make API request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const result = await response.json();
    
    if (result.success) {
      const data = result.data;
      
      console.log('🧠 BRAIN TUMOR DETECTION');
      console.log('========================');
      console.log('Prediction:', data.prediction.toUpperCase());
      console.log('Confidence:', data.confidence.toFixed(2) + '%');
      console.log('\\nProbabilities:');
      console.log('  Healthy:', data.all_predictions.Healthy.toFixed(2) + '%');
      console.log('  Tumor:', data.all_predictions.Tumor.toFixed(2) + '%');
      
      return data;
    }
    
    throw new Error(result.message || 'Prediction failed');
    
  } catch (error) {
    console.error('❌ Prediction error:', error);
    throw error;
  }
}

// React Component Example
function BrainScanUploader() {
  const [file, setFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handlePredict = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const prediction = await predictBrainTumor(file);
      setResult(prediction);
    } catch (error) {
      alert('Prediction failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      <button 
        onClick={handlePredict} 
        disabled={!file || loading}
      >
        {loading ? 'Analyzing...' : 'Predict'}
      </button>
      
      {result && (
        <div className="result">
          <h3>Result: {result.prediction.toUpperCase()}</h3>
          <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}`,

    nodejs: `// Brain Tumor Detection API - Node.js Example
// =============================================

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = '${API_BASE_URL}/api/predict/';
const API_KEY = '${generatedKey?.api_key || 'your_api_key_here'}';

/**
 * Predict brain tumor from image file
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Object>} Prediction result
 */
async function predictBrainTumor(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(\`File not found: \${imagePath}\`);
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));

    // Make API request
    const response = await axios.post(API_URL, formData, {
      headers: {
        'X-API-Key': API_KEY,
        ...formData.getHeaders()
      }
    });

    const result = response.data;
    
    if (result.success) {
      const data = result.data;
      
      // Display results
      console.log('\\n' + '='.repeat(60));
      console.log('🧠 BRAIN TUMOR DETECTION RESULT');
      console.log('='.repeat(60));
      console.log(\`File:        \${path.basename(imagePath)}\`);
      console.log(\`Prediction:  \${data.prediction.toUpperCase()}\`);
      console.log(\`Confidence:  \${data.confidence.toFixed(2)}%\`);
      console.log('\\nProbability Distribution:');
      console.log(\`  Healthy:   \${data.all_predictions.Healthy.toFixed(2)}%\`);
      console.log(\`  Tumor:     \${data.all_predictions.Tumor.toFixed(2)}%\`);
      console.log('='.repeat(60) + '\\n');
      
      // Interpretation
      if (data.prediction === 'tumor') {
        console.log('⚠️  WARNING: Tumor detected!');
        console.log('   Recommend further medical evaluation.');
      } else {
        console.log('✅ Scan appears healthy.');
      }
      console.log('\\n');
      
      return data;
    }
    
    throw new Error(result.message || 'Prediction failed');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
    throw error;
  }
}

// Batch prediction example
async function predictMultipleScans(imagePaths) {
  console.log(\`\\n🔄 Processing \${imagePaths.length} scans...\\n\`);
  
  const results = [];
  for (const imagePath of imagePaths) {
    try {
      const result = await predictBrainTumor(imagePath);
      results.push({ imagePath, result, success: true });
    } catch (error) {
      results.push({ imagePath, error: error.message, success: false });
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  console.log(\`\\n✅ Successfully processed: \${successful}/\${imagePaths.length}\`);
  
  return results;
}

// Example usage
if (require.main === module) {
  const imagePath = process.argv[2] || 'brain_scan.jpg';
  
  predictBrainTumor(imagePath)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { predictBrainTumor, predictMultipleScans };`
  }

  // Code examples WITHOUT API key (non-authenticated)
  const codeExamplesNoKey = {
    python: `import requests
import json

# Configuration (NO API KEY REQUIRED)
API_URL = "${API_BASE_URL}/api/predict/"

def predict_brain_tumor(image_path):
    """
    Upload and analyze brain MRI scan WITHOUT authentication
    Returns: Prediction result with confidence scores
    """
    try:
        # Prepare the image file
        with open(image_path, 'rb') as f:
            files = {'file': f}
            
            # Make API request (NO API KEY HEADER)
            response = requests.post(API_URL, files=files)
            response.raise_for_status()
            
            # Parse response
            result = response.json()
            
            if result['success']:
                data = result['data']
                print("="*50)
                print("🧠 BRAIN TUMOR DETECTION RESULT")
                print("="*50)
                print(f"Prediction:  {data['prediction'].upper()}")
                print(f"Confidence:  {data['confidence']:.2f}%")
                print(f"\\nProbabilities:")
                print(f"  Healthy:   {data['all_predictions']['healthy']:.2f}%")
                print(f"  Tumor:     {data['all_predictions']['tumor']:.2f}%")
                print("="*50)
                
                return data
            else:
                print(f"❌ Prediction failed: {result.get('message')}")
                return None
                
    except requests.exceptions.RequestException as e:
        print(f"❌ API Error: {e}")
        return None
    except FileNotFoundError:
        print(f"❌ Image file not found: {image_path}")
        return None

# Example usage
if __name__ == "__main__":
    result = predict_brain_tumor("brain_scan.jpg")
    
    if result:
        # Access prediction details
        is_tumor = result['prediction'] == 'tumor'
        confidence = result['confidence']
        
        if is_tumor:
            print(f"⚠️  TUMOR DETECTED with {confidence:.1f}% confidence")
        else:
            print(f"✅ HEALTHY SCAN with {confidence:.1f}% confidence")`,

    curl: `#!/bin/bash

# Brain Tumor Detection API - cURL Example (NO API KEY)
# ======================================================

API_URL="${API_BASE_URL}/api/predict/"
IMAGE_PATH="brain_scan.jpg"

# Make prediction request WITHOUT API key
echo "🧠 Analyzing brain scan..."
echo ""

response=$(curl -s -X POST "$API_URL" \\
  -F "file=@$IMAGE_PATH")

# Parse and display results
echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data['success']:
    result = data['data']
    print('='*50)
    print('PREDICTION RESULT')
    print('='*50)
    print(f\"Prediction:  {result['prediction'].upper()}\")
    print(f\"Confidence:  {result['confidence']:.2f}%\")
    print(f\"Healthy:     {result['all_predictions']['healthy']:.2f}%\")
    print(f\"Tumor:       {result['all_predictions']['tumor']:.2f}%\")
    print('='*50)
else:
    print('Error:', data.get('message'))
"

# Check API health
echo ""
echo "Checking API health..."
curl -s "${API_BASE_URL}/health" | python3 -m json.tool`,

    javascript: `// Brain Tumor Detection API - JavaScript (NO API KEY)
// ====================================================

const API_URL = '${API_BASE_URL}/api/predict/';

/**
 * Predict brain tumor from image file WITHOUT authentication
 * @param {File} file - Image file from input
 * @returns {Promise<Object>} Prediction result
 */
async function predictBrainTumor(file) {
  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    // Make API request WITHOUT API key
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const result = await response.json();
    
    if (result.success) {
      const data = result.data;
      
      console.log('🧠 BRAIN TUMOR DETECTION');
      console.log('========================');
      console.log('Prediction:', data.prediction.toUpperCase());
      console.log('Confidence:', data.confidence.toFixed(2) + '%');
      console.log('\\nProbabilities:');
      console.log('  Healthy:', data.all_predictions.Healthy.toFixed(2) + '%');
      console.log('  Tumor:', data.all_predictions.Tumor.toFixed(2) + '%');
      
      return data;
    }
    
    throw new Error(result.message || 'Prediction failed');
    
  } catch (error) {
    console.error('❌ Prediction error:', error);
    throw error;
  }
}

// React Component Example
function BrainScanUploader() {
  const [file, setFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handlePredict = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const prediction = await predictBrainTumor(file);
      setResult(prediction);
    } catch (error) {
      alert('Prediction failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      <button 
        onClick={handlePredict} 
        disabled={!file || loading}
      >
        {loading ? 'Analyzing...' : 'Predict'}
      </button>
      
      {result && (
        <div className="result">
          <h3>Result: {result.prediction.toUpperCase()}</h3>
          <p>Confidence: {result.confidence.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}`,

    nodejs: `// Brain Tumor Detection API - Node.js (NO API KEY)
// ==================================================

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = '${API_BASE_URL}/api/predict/';

/**
 * Predict brain tumor from image file WITHOUT authentication
 * @param {string} imagePath - Path to image file
 * @returns {Promise<Object>} Prediction result
 */
async function predictBrainTumor(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(\`File not found: \${imagePath}\`);
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));

    // Make API request WITHOUT API key
    const response = await axios.post(API_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    const result = response.data;
    
    if (result.success) {
      const data = result.data;
      
      // Display results
      console.log('\\n' + '='.repeat(60));
      console.log('🧠 BRAIN TUMOR DETECTION RESULT');
      console.log('='.repeat(60));
      console.log(\`File:        \${path.basename(imagePath)}\`);
      console.log(\`Prediction:  \${data.prediction.toUpperCase()}\`);
      console.log(\`Confidence:  \${data.confidence.toFixed(2)}%\`);
      console.log('\\nProbability Distribution:');
      console.log(\`  Healthy:   \${data.all_predictions.Healthy.toFixed(2)}%\`);
      console.log(\`  Tumor:     \${data.all_predictions.Tumor.toFixed(2)}%\`);
      console.log('='.repeat(60) + '\\n');
      
      // Interpretation
      if (data.prediction === 'tumor') {
        console.log('⚠️  WARNING: Tumor detected!');
        console.log('   Recommend further medical evaluation.');
      } else {
        console.log('✅ Scan appears healthy.');
      }
      console.log('\\n');
      
      return data;
    }
    
    throw new Error(result.message || 'Prediction failed');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
    throw error;
  }
}

// Batch prediction example
async function predictMultipleScans(imagePaths) {
  console.log(\`\\n🔄 Processing \${imagePaths.length} scans...\\n\`);
  
  const results = [];
  for (const imagePath of imagePaths) {
    try {
      const result = await predictBrainTumor(imagePath);
      results.push({ imagePath, result, success: true });
    } catch (error) {
      results.push({ imagePath, error: error.message, success: false });
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  console.log(\`\\n✅ Successfully processed: \${successful}/\${imagePaths.length}\`);
  
  return results;
}

// Example usage
if (require.main === module) {
  const imagePath = process.argv[2] || 'brain_scan.jpg';
  
  predictBrainTumor(imagePath)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { predictBrainTumor, predictMultipleScans };`
  }

  return (
    <Box>
      {/* Hero Section */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CodeIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              API Documentation
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Integrate brain tumor detection into your applications with our powerful REST API
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
            <Chip icon={<SpeedIcon />} label="Fast Response" color="success" />
            <Chip icon={<CheckCircleIcon />} label="97% Accuracy" color="primary" />
            <Chip icon={<CodeIcon />} label="RESTful API" color="secondary" />
          </Box>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<DescriptionIcon />}
              onClick={() => window.open(`${API_BASE_URL}/docs`, '_blank')}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              📚 View Full API Documentation
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Live API Testing Section */}
      <Zoom in timeout={1000}>
        <Paper elevation={6} sx={{ p: 4, mb: 4, borderRadius: 4, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <PlayArrowIcon sx={{ fontSize: 36, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={700}>
              🚀 Live API Testing
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Test the API in real-time with your own images or select from our gallery
          </Typography>

          {/* Authentication Mode Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ mb: 1 }}>
              Select Authentication Mode:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper
                elevation={testAuthMode === 'with-key' ? 6 : 2}
                onClick={() => setTestAuthMode('with-key')}
                sx={{
                  flex: 1,
                  p: 2.5,
                  cursor: 'pointer',
                  borderRadius: 3,
                  border: '3px solid',
                  borderColor: testAuthMode === 'with-key' ? 'primary.main' : 'transparent',
                  background: testAuthMode === 'with-key' 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
                    : 'background.paper',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: testAuthMode === 'with-key' ? 'primary.main' : 'grey.200',
                      color: testAuthMode === 'with-key' ? 'white' : 'text.secondary',
                      fontSize: '24px',
                    }}
                  >
                    🔒
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      With API Key
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Authenticated request with X-API-Key header
                    </Typography>
                    {testAuthMode === 'with-key' && (
                      <Chip
                        label={generatedKey ? `Key: ${generatedKey.api_key.substring(0, 16)}...` : 'No key generated'}
                        size="small"
                        color="primary"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                  {testAuthMode === 'with-key' && (
                    <CheckCircleIcon color="primary" sx={{ fontSize: 32 }} />
                  )}
                </Box>
              </Paper>

              <Paper
                elevation={testAuthMode === 'no-key' ? 6 : 2}
                onClick={() => setTestAuthMode('no-key')}
                sx={{
                  flex: 1,
                  p: 2.5,
                  cursor: 'pointer',
                  borderRadius: 3,
                  border: '3px solid',
                  borderColor: testAuthMode === 'no-key' ? 'success.main' : 'transparent',
                  background: testAuthMode === 'no-key' 
                    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(56, 142, 60, 0.15) 100%)'
                    : 'background.paper',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: testAuthMode === 'no-key' ? 'success.main' : 'grey.200',
                      color: testAuthMode === 'no-key' ? 'white' : 'text.secondary',
                      fontSize: '24px',
                    }}
                  >
                    🔓
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Without API Key
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Public endpoint - no authentication required
                    </Typography>
                    {testAuthMode === 'no-key' && (
                      <Chip
                        label="Testing Only"
                        size="small"
                        color="warning"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                  {testAuthMode === 'no-key' && (
                    <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            {/* Left: Image Selection */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  1️⃣ Select Test Image
                </Typography>
                
                <ToggleButtonGroup
                  value={testMode}
                  exclusive
                  onChange={(e, val) => val && setTestMode(val)}
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <ToggleButton value="upload">
                    <CloudUploadIcon sx={{ mr: 1 }} />
                    Upload Image
                  </ToggleButton>
                  <ToggleButton value="gallery">
                    <FolderIcon sx={{ mr: 1 }} />
                    From Gallery
                  </ToggleButton>
                </ToggleButtonGroup>

                {testMode === 'upload' && (
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="upload-test-image"
                      type="file"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="upload-test-image">
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                        size="large"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mb: 2, py: 2 }}
                      >
                        Choose Image File
                      </Button>
                    </label>

                    {uploadPreview && (
                      <Fade in>
                        <Box sx={{ position: 'relative' }}>
                          <Card elevation={4}>
                            <CardMedia
                              component="img"
                              height="300"
                              image={uploadPreview}
                              alt="Upload preview"
                              sx={{ objectFit: 'contain', bgcolor: '#000' }}
                            />
                          </Card>
                          <IconButton
                            size="small"
                            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
                            onClick={() => {
                              setUploadedFile(null)
                              setUploadPreview(null)
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                          <Chip
                            label={uploadedFile?.name}
                            icon={<ImageIcon />}
                            sx={{ mt: 1 }}
                            size="small"
                          />
                        </Box>
                      </Fade>
                    )}
                  </Box>
                )}

                {testMode === 'gallery' && (
                  <Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="large"
                      startIcon={<FolderIcon />}
                      onClick={() => setShowGalleryDialog(true)}
                      sx={{ mb: 2, py: 2 }}
                    >
                      Browse Gallery ({galleryImages.length} images)
                    </Button>

                    {selectedGalleryImage && (
                      <Fade in>
                        <Box sx={{ position: 'relative' }}>
                          <Card elevation={4}>
                            <CardMedia
                              component="img"
                              height="300"
                              image={galleryAPI.getImageUrl(selectedGalleryImage.path)}
                              alt={selectedGalleryImage.filename}
                              sx={{ objectFit: 'contain', bgcolor: '#000' }}
                            />
                          </Card>
                          <IconButton
                            size="small"
                            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
                            onClick={() => setSelectedGalleryImage(null)}
                          >
                            <CloseIcon />
                          </IconButton>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={selectedGalleryImage.filename}
                              icon={<ImageIcon />}
                              size="small"
                            />
                            <Chip
                              label={`True: ${selectedGalleryImage.label}`}
                              color={selectedGalleryImage.label === 'tumor' ? 'error' : 'success'}
                              size="small"
                            />
                          </Box>
                        </Box>
                      </Fade>
                    )}
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Warning if testing with API key but none generated */}
                {testAuthMode === 'with-key' && !generatedKey && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                      ⚠️ No API Key Generated
                    </Typography>
                    <Typography variant="caption">
                      Generate an API key above or switch to "Without API Key" mode for testing.
                    </Typography>
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={testing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                    onClick={handleTestAPI}
                    disabled={testing || (!uploadedFile && !selectedGalleryImage) || (testAuthMode === 'with-key' && !generatedKey)}
                    sx={{
                      background: testAuthMode === 'with-key' 
                        ? 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
                        : 'linear-gradient(45deg, #4caf50 30%, #388e3c 90%)',
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    {testing ? 'Testing API...' : testAuthMode === 'with-key' ? '🔒 Test with API Key' : '🔓 Test without API Key'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleReset}
                    disabled={testing}
                  >
                    Reset
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Right: Test Results */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  2️⃣ API Response
                </Typography>

                {!testing && !testResult && !error && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 400,
                      color: 'text.secondary',
                    }}
                  >
                    <DescriptionIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6">Select an image and click "Test API"</Typography>
                    <Typography variant="body2">Results will appear here</Typography>
                  </Box>
                )}

                {testing && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 400,
                    }}
                  >
                    <CircularProgress size={80} thickness={4} sx={{ mb: 3 }} />
                    <Typography variant="h6" gutterBottom>Analyzing Brain Scan...</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Processing image with neural network
                    </Typography>
                    <LinearProgress sx={{ width: '80%', mt: 3 }} />
                  </Box>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {testResult && (
                  <Zoom in>
                    <Box>
                      {/* API Endpoint Info */}
                      <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight={600} color="primary">
                          📡 API Request Details
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip label="POST" color="primary" size="small" />
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {API_BASE_URL}/api/predict/
                          </Typography>
                          <IconButton size="small" onClick={() => copyToClipboard(`${API_BASE_URL}/api/predict/`)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Headers: Content-Type: multipart/form-data
                          </Typography>
                          {testAuthMode === 'with-key' ? (
                            <>
                              <Chip 
                                icon={<CheckCircleIcon />}
                                label="🔒 Authenticated" 
                                color="primary" 
                                size="small" 
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                X-API-Key: {generatedKey?.api_key?.substring(0, 20)}...
                              </Typography>
                            </>
                          ) : (
                            <Chip 
                              icon={<CheckCircleIcon />}
                              label="🔓 Public (No Auth)" 
                              color="success" 
                              size="small" 
                            />
                          )}
                        </Box>
                      </Paper>

                      {/* Response Time */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          icon={<SpeedIcon />}
                          label={`Response Time: ${testDuration}ms`}
                          color="success"
                        />
                        <Chip
                          label={testDuration < 500 ? 'Fast' : testDuration < 1000 ? 'Normal' : 'Slow'}
                          color={testDuration < 500 ? 'success' : testDuration < 1000 ? 'warning' : 'error'}
                          size="small"
                        />
                      </Box>

                      {/* Prediction Result */}
                      <Paper
                        elevation={4}
                        sx={{
                          p: 3,
                          mb: 2,
                          background: testResult.prediction === 'tumor'
                            ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)'
                            : 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                          border: '3px solid',
                          borderColor: testResult.prediction === 'tumor' ? 'error.main' : 'success.main',
                          borderRadius: 3,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          {testResult.prediction === 'tumor' ? (
                            <LocalHospitalIcon sx={{ fontSize: 48, color: 'error.main' }} />
                          ) : (
                            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
                          )}
                          <Box>
                            <Typography variant="h4" fontWeight={900}>
                              {testResult.prediction.toUpperCase()}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                              Confidence: {typeof testResult.confidence === 'number' 
                                ? (testResult.confidence > 1 ? testResult.confidence.toFixed(2) : (testResult.confidence * 100).toFixed(2))
                                : '0.00'}%
                            </Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                          Probability Distribution:
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Healthy</Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {(() => {
                                // Backend returns "Healthy" and "Tumor" with capital letters
                                const healthyVal = testResult.all_predictions?.Healthy || testResult.all_predictions?.healthy || 0
                                return (healthyVal > 1 ? healthyVal : healthyVal * 100).toFixed(2)
                              })()}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(() => {
                              const healthyVal = testResult.all_predictions?.Healthy || testResult.all_predictions?.healthy || 0
                              return healthyVal > 1 ? healthyVal : healthyVal * 100
                            })()}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': { bgcolor: 'success.main' },
                            }}
                          />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Tumor</Typography>
                            <Typography variant="body2" fontWeight={700}>
                              {(() => {
                                // Backend returns "Healthy" and "Tumor" with capital letters
                                const tumorVal = testResult.all_predictions?.Tumor || testResult.all_predictions?.tumor || 0
                                return (tumorVal > 1 ? tumorVal : tumorVal * 100).toFixed(2)
                              })()}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(() => {
                              const tumorVal = testResult.all_predictions?.Tumor || testResult.all_predictions?.tumor || 0
                              return tumorVal > 1 ? tumorVal : tumorVal * 100
                            })()}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': { bgcolor: 'error.main' },
                            }}
                          />
                        </Box>
                      </Paper>

                      {/* JSON Response */}
                      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        Raw JSON Response:
                      </Typography>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: '#1e1e1e',
                          borderRadius: 2,
                          position: 'relative',
                          maxHeight: 200,
                          overflow: 'auto',
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
                          onClick={() => copyToClipboard(JSON.stringify(testResult, null, 2))}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                        <pre style={{
                          margin: 0,
                          fontSize: '0.75rem',
                          color: '#d4d4d4',
                          fontFamily: 'Consolas, Monaco, monospace',
                        }}>
                          {JSON.stringify(testResult, null, 2)}
                        </pre>
                      </Paper>
                    </Box>
                  </Zoom>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Zoom>

      {/* API Key Generation */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Zoom in timeout={1200}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <KeyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={700}>
                  Generate API Key
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <TextField
                fullWidth
                label="Key Name"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                margin="normal"
                placeholder="My Application Key"
              />

              <TextField
                fullWidth
                label="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                multiline
                rows={2}
                placeholder="Production API key for..."
              />

              <TextField
                fullWidth
                label="Expires In (Days)"
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 365)}
                margin="normal"
                InputProps={{
                  inputProps: { min: 1, max: 3650 }
                }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGenerateKey}
                disabled={loading || !keyName}
                sx={{
                  mt: 3,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  fontWeight: 600,
                }}
                startIcon={<KeyIcon />}
              >
                Generate API Key
              </Button>

              {generatedKey && (
                <Fade in>
                  <Card sx={{ mt: 3, bgcolor: 'success.light', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon /> API Key Generated!
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                        <TextField
                          fullWidth
                          value={generatedKey.api_key}
                          InputProps={{
                            readOnly: true,
                            style: { fontFamily: 'monospace', fontSize: '0.9rem', backgroundColor: 'white' },
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                                  <IconButton onClick={() => copyToClipboard(generatedKey.api_key)}>
                                    {copied ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <strong>Important:</strong> Save this key securely! You won't be able to see it again.
                      </Alert>
                    </CardContent>
                  </Card>
                </Fade>
              )}
            </Paper>
          </Zoom>
        </Grid>

        <Grid item xs={12} md={6}>
          <Zoom in timeout={1400}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <DescriptionIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={700}>
                  API Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <List>
                <ListItem>
                  <ListItemText
                    primary={<Typography variant="subtitle1" fontWeight={600}>Base URL</Typography>}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                          {API_BASE_URL}
                        </Typography>
                        <IconButton size="small" onClick={() => copyToClipboard(API_BASE_URL)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary={<Typography variant="subtitle1" fontWeight={600}>Prediction Endpoint</Typography>}
                    secondary={
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block', mt: 0.5 }}>
                        POST /api/predict/
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary={<Typography variant="subtitle1" fontWeight={600}>Authentication</Typography>}
                    secondary={<Typography variant="body2">Header: X-API-Key</Typography>}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary={<Typography variant="subtitle1" fontWeight={600}>Supported Formats</Typography>}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip label="JPG" size="small" />
                        <Chip label="JPEG" size="small" />
                        <Chip label="PNG" size="small" />
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary={<Typography variant="subtitle1" fontWeight={600}>Max File Size</Typography>}
                    secondary={<Typography variant="body2">10 MB per image</Typography>}
                  />
                </ListItem>
              </List>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<CodeIcon />}
                onClick={() => setShowExample(true)}
                sx={{ mt: 2 }}
              >
                View Code Examples
              </Button>
            </Paper>
          </Zoom>
        </Grid>
      </Grid>

      {/* Quick Start Guide */}
      <Fade in timeout={1600}>
        <Paper 
          elevation={6} 
          sx={{ 
            p: 5, 
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
            border: '2px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography 
              variant="h4" 
              fontWeight={800} 
              gutterBottom
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🚀 Quick Start Guide
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Get started with the Brain Tumor Detection API in just 4 simple steps
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Step 1: Generate API Key */}
            <Grid item xs={12} md={6}>
              <Zoom in timeout={800}>
                <Paper 
                  elevation={4} 
                  sx={{ 
                    p: 4, 
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '2px solid transparent',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: 12,
                      borderColor: 'primary.main',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '1.5rem',
                        boxShadow: 4,
                      }}
                    >
                      1
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        Generate API Key
                      </Typography>
                      <Chip icon={<KeyIcon />} label="Authentication" size="small" color="primary" />
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Create your unique API key using the form at the top of this page. Enter a descriptive name to help you identify this key later.
                  </Typography>

                  <Alert severity="info" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                      Your API key will be displayed once - save it securely!
                    </Typography>
                  </Alert>

                  <Box sx={{ bgcolor: '#1e1e1e', p: 2, borderRadius: 2, mt: 2 }}>
                    <Typography variant="caption" sx={{ color: '#858585', fontFamily: 'monospace' }}>
                      # Example API Key
                    </Typography>
                    <Typography sx={{ color: '#4ec9b0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      X-API-Key: bt_1a2b3c4d5e6f7g8h9i0j...
                    </Typography>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>

            {/* Step 2: Install Library */}
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1000}>
                <Paper 
                  elevation={4} 
                  sx={{ 
                    p: 4, 
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '2px solid transparent',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: 12,
                      borderColor: 'success.main',
                      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.05) 100%)',
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '1.5rem',
                        boxShadow: 4,
                      }}
                    >
                      2
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        Install Dependencies
                      </Typography>
                      <Chip icon={<CodeIcon />} label="Setup" size="small" color="success" />
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Install the required HTTP client library for your preferred programming language.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label="🐍 Python" size="small" variant="outlined" />
                    <Chip label="📦 Node.js" size="small" variant="outlined" />
                    <Chip label="⚡ JavaScript" size="small" variant="outlined" />
                  </Box>

                  <Box sx={{ bgcolor: '#1e1e1e', p: 2, borderRadius: 2, mt: 2 }}>
                    <Typography variant="caption" sx={{ color: '#858585', fontFamily: 'monospace' }}>
                      # Python
                    </Typography>
                    <Typography sx={{ color: '#ce9178', fontFamily: 'monospace', fontSize: '0.9rem', mb: 1 }}>
                      pip install requests pillow
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#858585', fontFamily: 'monospace' }}>
                      # Node.js
                    </Typography>
                    <Typography sx={{ color: '#ce9178', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      npm install axios form-data
                    </Typography>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>

            {/* Step 3: Make Request */}
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1200}>
                <Paper 
                  elevation={4} 
                  sx={{ 
                    p: 4, 
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '2px solid transparent',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: 12,
                      borderColor: 'warning.main',
                      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(245, 124, 0, 0.05) 100%)',
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '1.5rem',
                        boxShadow: 4,
                      }}
                    >
                      3
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        Make API Request
                      </Typography>
                      <Chip icon={<PlayArrowIcon />} label="Execute" size="small" color="warning" />
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Send a POST request to the prediction endpoint with your brain MRI image and API key in the header.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label="POST" color="warning" size="small" />
                    <Chip label="/api/predict/" variant="outlined" size="small" />
                    <Chip label="multipart/form-data" variant="outlined" size="small" />
                  </Box>

                  <Box sx={{ bgcolor: '#1e1e1e', p: 2, borderRadius: 2, mt: 2 }}>
                    <Typography sx={{ color: '#569cd6', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      import <Typography component="span" sx={{ color: '#dcdcaa' }}>requests</Typography>
                    </Typography>
                    <Typography sx={{ color: '#dcdcaa', fontFamily: 'monospace', fontSize: '0.85rem', mt: 0.5 }}>
                      response = requests.post(
                    </Typography>
                    <Typography sx={{ color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem', ml: 2 }}>
                      <Typography component="span" sx={{ color: '#ce9178' }}>"http://localhost:8000/api/predict/"</Typography>,
                    </Typography>
                    <Typography sx={{ color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem', ml: 2 }}>
                      files={'{'}{'{'}<Typography component="span" sx={{ color: '#ce9178' }}>'file'</Typography>: f{'}'}{'}'}, 
                    </Typography>
                    <Typography sx={{ color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem', ml: 2 }}>
                      headers={'{'}{'{'}<Typography component="span" sx={{ color: '#ce9178' }}>'X-API-Key'</Typography>: key{'}'}{'}'} 
                    </Typography>
                    <Typography sx={{ color: '#dcdcaa', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      )
                    </Typography>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>

            {/* Step 4: Get Results */}
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1400}>
                <Paper 
                  elevation={4} 
                  sx={{ 
                    p: 4, 
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '2px solid transparent',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: 12,
                      borderColor: 'error.main',
                      background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(211, 47, 47, 0.05) 100%)',
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '1.5rem',
                        boxShadow: 4,
                      }}
                    >
                      4
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        Parse Results
                      </Typography>
                      <Chip icon={<CheckCircleIcon />} label="Response" size="small" color="error" />
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Receive the prediction results with detailed confidence scores for both healthy and tumor classifications.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label="JSON Response" color="error" size="small" />
                    <Chip label="97% Accuracy" variant="outlined" size="small" />
                    <Chip label="~300ms" variant="outlined" size="small" />
                  </Box>

                  <Box sx={{ bgcolor: '#1e1e1e', p: 2, borderRadius: 2, mt: 2 }}>
                    <Typography sx={{ color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {'{'}
                    </Typography>
                    <Typography sx={{ color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem', ml: 2 }}>
                      <Typography component="span" sx={{ color: '#9cdcfe' }}>"prediction"</Typography>: 
                      <Typography component="span" sx={{ color: '#ce9178' }}> "tumor"</Typography>,
                    </Typography>
                    <Typography sx={{ color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem', ml: 2 }}>
                      <Typography component="span" sx={{ color: '#9cdcfe' }}>"confidence"</Typography>: 
                      <Typography component="span" sx={{ color: '#b5cea8' }}> 94.31</Typography>,
                    </Typography>
                    <Typography sx={{ color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem', ml: 2 }}>
                      <Typography component="span" sx={{ color: '#9cdcfe' }}>"all_predictions"</Typography>: {'{'}
                    </Typography>
                    <Typography sx={{ color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem', ml: 4 }}>
                      <Typography component="span" sx={{ color: '#9cdcfe' }}>"Healthy"</Typography>: 
                      <Typography component="span" sx={{ color: '#b5cea8' }}> 5.69</Typography>,
                    </Typography>
                    <Typography sx={{ color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem', ml: 4 }}>
                      <Typography component="span" sx={{ color: '#9cdcfe' }}>"Tumor"</Typography>: 
                      <Typography component="span" sx={{ color: '#b5cea8' }}> 94.31</Typography>
                    </Typography>
                    <Typography sx={{ color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem', ml: 2 }}>
                      {'}'}
                    </Typography>
                    <Typography sx={{ color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {'}'}
                    </Typography>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>

          {/* Additional Resources Section */}
          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Divider sx={{ my: 4 }}>
              <Chip label="Need Help?" color="primary" />
            </Divider>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                startIcon={<CodeIcon />}
                onClick={() => setShowExample(true)}
                size="large"
              >
                View Code Examples
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PlayArrowIcon />}
                size="large"
                onClick={() => {
                  // Scroll to Live API Testing section (around line 854)
                  window.scrollTo({ top: 400, behavior: 'smooth' })
                }}
              >
                Try Live Testing Above
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<DescriptionIcon />}
                size="large"
                onClick={() => {
                  // Scroll to top (API Documentation header)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                API Documentation
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* Gallery Selection Dialog */}
      <Dialog
        open={showGalleryDialog}
        onClose={() => setShowGalleryDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={700}>
              Select Test Image from Gallery
            </Typography>
            <IconButton onClick={() => setShowGalleryDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {galleryImages.map((image, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Card
                  elevation={3}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 8,
                    },
                  }}
                  onClick={() => handleGalleryImageSelect(image)}
                >
                  <CardMedia
                    component="img"
                    height="150"
                    image={galleryAPI.getImageUrl(image.path)}
                    alt={image.filename}
                    sx={{ objectFit: 'contain', bgcolor: '#000' }}
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="caption" noWrap display="block">
                      {image.filename}
                    </Typography>
                    <Chip
                      label={image.label}
                      size="small"
                      color={image.label === 'tumor' ? 'error' : 'success'}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Code Examples Dialog */}
      <Dialog open={showExample} onClose={() => setShowExample(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CodeIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Code Examples
              </Typography>
            </Box>
            <IconButton onClick={() => setShowExample(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Authentication Mode Toggle */}
          <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
            <Chip
              icon={authMode === 'with-key' ? <CheckCircleIcon /> : null}
              label="🔒 With API Key (Authenticated)"
              onClick={() => setAuthMode('with-key')}
              color={authMode === 'with-key' ? 'primary' : 'default'}
              variant={authMode === 'with-key' ? 'filled' : 'outlined'}
              sx={{ 
                flex: 1,
                height: 48,
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            />
            <Chip
              icon={authMode === 'no-key' ? <CheckCircleIcon /> : null}
              label="🔓 Without API Key (Public)"
              onClick={() => setAuthMode('no-key')}
              color={authMode === 'no-key' ? 'success' : 'default'}
              variant={authMode === 'no-key' ? 'filled' : 'outlined'}
              sx={{ 
                flex: 1,
                height: 48,
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            />
          </Box>

          {/* Language Tabs */}
          <Tabs value={selectedLanguage} onChange={(e, val) => setSelectedLanguage(val)} sx={{ mb: 2 }}>
            <Tab label="🐍 Python" />
            <Tab label="💻 cURL" />
            <Tab label="⚡ JavaScript" />
            <Tab label="📦 Node.js" />
          </Tabs>

          <Paper
            sx={{
              p: 2,
              bgcolor: '#1e1e1e',
              position: 'relative',
              maxHeight: 600,
              overflow: 'auto',
              borderRadius: 2,
            }}
          >
            <IconButton
              size="small"
              sx={{ position: 'absolute', right: 8, top: 8, color: 'white', zIndex: 1 }}
              onClick={() => copyToClipboard(
                Object.values(authMode === 'with-key' ? codeExamples : codeExamplesNoKey)[selectedLanguage]
              )}
            >
              <Tooltip title="Copy Code">
                <ContentCopyIcon fontSize="small" />
              </Tooltip>
            </IconButton>
            <pre style={{
              margin: 0,
              fontSize: '0.85rem',
              color: '#d4d4d4',
              fontFamily: 'Consolas, Monaco, monospace',
              lineHeight: 1.6,
            }}>
              {Object.values(authMode === 'with-key' ? codeExamples : codeExamplesNoKey)[selectedLanguage]}
            </pre>
          </Paper>

          <Alert severity={authMode === 'with-key' ? 'info' : 'warning'} sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom fontWeight={600}>
              {authMode === 'with-key' ? '💡 Quick Tips (Authenticated):' : '⚠️ Public API Notes:'}
            </Typography>
            <Typography variant="body2" component="div">
              {authMode === 'with-key' ? (
                <>
                  • Include the <code>X-API-Key</code> header in all requests<br />
                  • Supported formats: JPG, JPEG, PNG<br />
                  • Max file size: 10 MB<br />
                  • Response time: ~100-500ms<br />
                  • Recommended for production use
                </>
              ) : (
                <>
                  • No API key required - open endpoint<br />
                  • Supported formats: JPG, JPEG, PNG<br />
                  • Max file size: 10 MB<br />
                  • Response time: ~100-500ms<br />
                  • For testing only - use API keys in production
                </>
              )}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExample(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default APIKeysPage
