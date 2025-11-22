import axios from 'axios';

// API Base URL - use environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Only redirect if not already on login page and not verifying
      const isLoginPage = window.location.pathname === '/login';
      const isVerifyPage = window.location.pathname.startsWith('/verify');
      
      if (!isLoginPage && !isVerifyPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Batch APIs
export const batchAPI = {
  create: (data) => api.post('/batches', data),
  getAll: (params) => api.get('/batches', { params }),
  getById: (id) => api.get(`/batches/${id}`),
  update: (id, data) => api.put(`/batches/${id}`, data),
  addDocument: (id, formData) => api.post(`/batches/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: () => api.get('/batches/stats'),
};

// Inspection APIs
export const inspectionAPI = {
  getPending: () => api.get('/inspections/pending'),
  start: (batchId, data) => api.post(`/inspections/start/${batchId}`, data),
  submit: (id, data) => api.put(`/inspections/${id}`, data),
  getById: (id) => api.get(`/inspections/${id}`),
  getAll: (params) => api.get('/inspections', { params }),
};

// Credential APIs
export const credentialAPI = {
  issue: (batchId) => api.post(`/credentials/issue/${batchId}`),
  verify: (credentialId) => {
    // Create a new axios instance without auth for public verification
    return axios.get(`${API_URL}/credentials/verify/${credentialId}`);
  },
  getByBatch: (batchId) => api.get(`/credentials/batch/${batchId}`),
  revoke: (id, reason) => api.put(`/credentials/${id}/revoke`, { reason }),
  getAll: (params) => api.get('/credentials', { params }),
  getQR: (id) => api.get(`/credentials/${id}/qr`),
};

export default api;