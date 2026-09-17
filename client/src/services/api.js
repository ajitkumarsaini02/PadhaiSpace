import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL;
let baseURL = '/api';

if (rawBaseURL && rawBaseURL.trim()) {
  const trimmed = rawBaseURL.trim().replace(/\/+$/, '');
  baseURL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const API = axios.create({ baseURL });

export const getApiBaseUrl = () => baseURL;

// Request interceptor to add JWT token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error responses
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth Service
export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// Subject Service
export const subjectService = {
  getAll: (params) => API.get('/subjects', { params }),
  getById: (id) => API.get(`/subjects/${id}`),
  create: (data) => API.post('/subjects', data),
  update: (id, data) => API.put(`/subjects/${id}`, data),
  delete: (id) => API.delete(`/subjects/${id}`),
};

// Unit Service
export const unitService = {
  getAll: (subjectId) => API.get('/units', { params: { subjectId } }),
  create: (data) => API.post('/units', data),
  update: (id, data) => API.put(`/units/${id}`, data),
  delete: (id) => API.delete(`/units/${id}`),
};

// Resource Service
export const resourceService = {
  getAll: (params) => API.get('/resources', { params }),
  getSources: (params) => API.get('/resources/meta/sources', { params }),
  getAcademicYears: (params) => API.get('/resources/meta/academic-years', { params }),
  getPaperYears: (params) => API.get('/resources/meta/paper-years', { params }),
  getPYQSubjects: (params) => API.get('/resources/meta/pyq-subjects', { params }),
  getById: (id) => API.get(`/resources/${id}`),
  create: (formData) => API.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => API.put(`/resources/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => API.delete(`/resources/${id}`),
  incrementViews: (id) => API.post(`/resources/${id}/view`),
  incrementDownloads: (id) => API.post(`/resources/${id}/download`),
};

// Bookmark Service
export const bookmarkService = {
  getAll: () => API.get('/bookmarks'),
  add: (resourceId) => API.post(`/bookmarks/${resourceId}`),
  remove: (resourceId) => API.delete(`/bookmarks/${resourceId}`),
};

// Search Service
export const searchService = {
  globalSearch: (q) => API.get('/search', { params: { q } }),
};

// Activity Logging Service
export const activityService = {
  log: (data) => API.post('/resource-activities', data),
};

// Admin Service
export const adminService = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  toggleUserStatus: (id, isBlocked) => API.put(`/admin/users/${id}/status`, { isBlocked }),
  globalSearch: (q) => API.get('/admin/search', { params: { q } }),
  getAuditLogs: (params) => API.get('/admin/audit-logs', { params }),
  getActivities: (params) => API.get('/admin/resource-activities', { params }),
  getActivityStats: (params) => API.get('/admin/resource-activities/stats', { params }),
};

export default API;
