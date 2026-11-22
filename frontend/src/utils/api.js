import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 180_000,
});

// Auto-attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('rl_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rl_token');
      localStorage.removeItem('rl_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────
export const login    = (email, password) => api.post('/auth/login',    { email, password }).then(r => r.data);
export const register = (name, email, password) => api.post('/auth/register', { name, email, password }).then(r => r.data);
export const getMe    = () => api.get('/auth/me').then(r => r.data);

// ── Reviews ───────────────────────────────────────────────
export const uploadCSV     = (file, onProgress) => {
  const form = new FormData();
  form.append('csv', file);
  return api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => onProgress?.(Math.round((e.loaded / e.total) * 100)),
  }).then(r => r.data);
};
export const getReviews    = (params = {}) => api.get('/reviews', { params }).then(r => r.data);
export const getInsights   = session => api.get('/reviews/insights', { params: { session } }).then(r => r.data);
export const getProducts   = ()      => api.get('/reviews/products').then(r => r.data);
export const generateReply = id      => api.post(`/reviews/${id}/reply`).then(r => r.data.reply);
