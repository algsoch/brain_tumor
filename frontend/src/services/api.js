/**
 * API Service - Handles all API calls to the backend
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000, // 90 seconds - allow time for Render cold start + model loading
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Prediction API calls
 */
export const predictionAPI = {
  /**
   * Upload image and get prediction
   * @param {File} file - Image file to upload
   * @param {string} apiKey - Optional API key for authenticated requests
   * @returns {Promise} Prediction result
   */
  predictImage: async (file, apiKey = null) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = {
      'Content-Type': 'multipart/form-data',
    };
    
    // Add API key header if provided
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }
    
    const response = await api.post('/api/predict/', formData, { headers });
    return response.data;
  },

  /**
   * Upload multiple images for batch prediction
   * @param {File[]} files - Array of image files
   * @returns {Promise} Batch prediction results
   */
  predictBatch: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await api.post('/api/predict/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get model information
   * @returns {Promise} Model info
   */
  getModelInfo: async () => {
    const response = await api.get('/api/predict/model-info');
    return response.data;
  },
};

/**
 * Metrics API calls
 */
export const metricsAPI = {
  /**
   * Get training history data
   * @returns {Promise} Training metrics
   */
  getTrainingHistory: async () => {
    const response = await api.get('/api/metrics/training-history');
    return response.data;
  },

  /**
   * Get predictions summary
   * @returns {Promise} Predictions summary
   */
  getPredictionsSummary: async () => {
    const response = await api.get('/api/metrics/predictions-summary');
    return response.data;
  },

  /**
   * Get confusion matrix data
   * @returns {Promise} Confusion matrix
   */
  getConfusionMatrix: async () => {
    const response = await api.get('/api/metrics/confusion-matrix');
    return response.data;
  },

  /**
   * Get performance summary
   * @returns {Promise} Performance metrics
   */
  getPerformanceSummary: async () => {
    const response = await api.get('/api/metrics/performance-summary');
    return response.data;
  },

  /**
   * Download training history CSV
   * @returns {string} Download URL
   */
  downloadTrainingHistory: () => {
    return `${API_BASE_URL}/api/metrics/download/training-history`;
  },

  /**
   * Download training history 2 CSV
   * @returns {string} Download URL
   */
  downloadTrainingHistory2: () => {
    return `${API_BASE_URL}/api/metrics/download/training-history-2`;
  },

  /**
   * Download predictions CSV
   * @returns {string} Download URL
   */
  downloadPredictions: () => {
    return `${API_BASE_URL}/api/metrics/download/predictions`;
  },
};

/**
 * Gallery API calls
 */
export const galleryAPI = {
  /**
   * Get paginated gallery images
   * @param {Object} params - Query parameters
   * @returns {Promise} Gallery images
   */
  getImages: async (params = {}) => {
    const response = await api.get('/api/gallery/images', { params });
    return response.data;
  },

  /**
   * Get image URL
   * @param {string} imagePath - Relative image path
   * @returns {string} Image URL
   */
  getImageUrl: (imagePath) => {
    return `${API_BASE_URL}/api/gallery/image/${imagePath}`;
  },

  /**
   * Get gallery statistics
   * @returns {Promise} Gallery stats
   */
  getStats: async () => {
    const response = await api.get('/api/gallery/stats');
    return response.data;
  },
};

/**
 * Precomputed Predictions API calls
 */
export const precomputedAPI = {
  /**
   * Get all precomputed predictions from CSV
   * @param {number} limit - Optional limit
   * @returns {Promise} Precomputed predictions
   */
  getPredictions: async (limit = null) => {
    const params = limit ? { limit } : {};
    const response = await api.get('/api/precomputed/predictions', { params });
    return response.data;
  },

  /**
   * Get prediction for specific filename
   * @param {string} filename - Image filename
   * @returns {Promise} Prediction data
   */
  getPredictionByFilename: async (filename) => {
    const response = await api.get(`/api/precomputed/predictions/by-filename/${filename}`);
    return response.data;
  },

  /**
   * Get prediction statistics
   * @returns {Promise} Statistics
   */
  getStats: async () => {
    const response = await api.get('/api/precomputed/stats');
    return response.data;
  },
};

/**
 * General API calls
 */
export const generalAPI = {
  /**
   * Health check
   * @returns {Promise} Health status
   */
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  /**
   * Get API info
   * @returns {Promise} API configuration
   */
  getApiInfo: async () => {
    const response = await api.get('/api/info');
    return response.data;
  },

  /**
   * Get root info
   * @returns {Promise} Root endpoint data
   */
  getRootInfo: async () => {
    const response = await api.get('/');
    return response.data;
  },
};

export default api;
