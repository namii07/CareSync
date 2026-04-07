import axios from 'axios';

// In production (Vercel), VITE_API_URL must be set in Vercel dashboard.
// Fallback to the deployed backend URL directly.
const baseURL = import.meta.env.VITE_API_URL
    || (import.meta.env.PROD ? 'https://care-sync-xi-peach.vercel.app/api' : '/api');

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
