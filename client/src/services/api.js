import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

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

// Branch Service
export const branchService = {
  getAll: () => API.get('/branches'),
  create: (data) => API.post('/branches', data),
  update: (id, data) => API.put(`/branches/${id}`, data),
  delete: (id) => API.delete(`/branches/${id}`),
};

// Semester Service
export const semesterService = {
  getAll: (branchId) => API.get('/semesters', { params: { branchId } }),
  create: (data) => API.post('/semesters', data),
  update: (id, data) => API.put(`/semesters/${id}`, data),
  delete: (id) => API.delete(`/semesters/${id}`),
};

// Subject Service
export const subjectService = {
  getAll: (params) => API.get('/subjects', { params }),
  getById: (id) => API.get(`/subjects/${id}`),
  create: (data) => API.post('/subjects', data),
  update: (id, data) => API.put(`/subjects/${id}`, data),
  delete: (id) => API.delete(`/subjects/${id}`),
};

// Subject Offering Service
export const subjectOfferingService = {
  getAll: (params) => API.get('/subject-offerings', { params }),
  create: (data) => API.post('/subject-offerings', data),
  update: (id, data) => API.put(`/subject-offerings/${id}`, data),
  delete: (id) => API.delete(`/subject-offerings/${id}`),
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
  grantAccess: (data) => API.post('/admin/access/grant', data),
  revokeAccess: (id, reason) => API.put(`/admin/access/${id}/revoke`, { reason }),
  globalSearch: (q) => API.get('/admin/search', { params: { q } }),
  getAuditLogs: (params) => API.get('/admin/audit-logs', { params }),
  getActivities: (params) => API.get('/admin/resource-activities', { params }),
  getActivityStats: (params) => API.get('/admin/resource-activities/stats', { params }),
};

// Payment Service
export const paymentService = {
  createOrder: (subjectId) => API.post('/payments/create-order', { subjectId }),
  verifyPayment: (data) => API.post('/payments/verify', data),
  getMyPurchases: () => API.get('/payments/my'),
  checkAccess: (subjectId) => API.get(`/payments/check-access/${subjectId}`),
  getAdminPayments: (params) => API.get('/payments/admin/payments', { params }),
  getAdminAccess: () => API.get('/payments/admin/access'),
  revokeAccess: (id) => API.put(`/payments/admin/access/${id}/revoke`),
  getRevenueStats: () => API.get('/payments/admin/revenue'),
};

export default API;
