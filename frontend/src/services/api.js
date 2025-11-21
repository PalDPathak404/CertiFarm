import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  verify: (credentialId) => api.get(`/credentials/verify/${credentialId}`),
  getByBatch: (batchId) => api.get(`/credentials/batch/${batchId}`),
  revoke: (id, reason) => api.put(`/credentials/${id}/revoke`, { reason }),
  getAll: (params) => api.get('/credentials', { params }),
  getQR: (id) => api.get(`/credentials/${id}/qr`),
};

export default api;