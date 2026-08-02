import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Sisipkan token JWT ke setiap request jika ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('td_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tangani token kedaluwarsa secara global
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('td_token');
      localStorage.removeItem('td_user');
    }
    return Promise.reject(err);
  }
);

export default api;
