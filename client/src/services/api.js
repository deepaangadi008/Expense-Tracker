import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

const cleanAuthPayload = (data = {}) => ({
  ...data,
  email: String(data.email || '').trim(),
});

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const isAuthFailure = (error) => {
  const status = error?.response?.status;
  const message = String(error?.response?.data?.message || '').toLowerCase();
  return status === 401 && message.includes('not authorized');
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAuthFailure(error)) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', cleanAuthPayload(data)),
  login: (data) => apiClient.post('/auth/login', cleanAuthPayload(data)),
};

export const transactionAPI = {
  add: (data) => apiClient.post('/transactions', data, { headers: authHeaders() }),
  getAll: () => apiClient.get('/transactions', { headers: authHeaders() }),
  delete: (id) => apiClient.delete(`/transactions/${id}`, { headers: authHeaders() }),
  summary: () => apiClient.get('/transactions/summary', { headers: authHeaders() }),
  generateRecurring: () => apiClient.post('/transactions/generate-recurring', {}, { headers: authHeaders() }),
};

export const budgetAPI = {
  getCurrent: () => apiClient.get('/budget/current', { headers: authHeaders() }),
  setCurrent: (amount) => apiClient.put('/budget/current', { amount }, { headers: authHeaders() }),
};

export const profileAPI = {
  get: () => apiClient.get('/profile', { headers: authHeaders() }),
  update: (payload) => apiClient.put('/profile', payload, { headers: authHeaders() }),
};
