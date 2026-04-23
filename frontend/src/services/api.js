import axios from 'axios';

let envApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Auto-fix for Mixed Content (forces HTTPS on Vercel)
if (envApiUrl.includes('vercel.app') && envApiUrl.startsWith('http://')) {
  envApiUrl = envApiUrl.replace('http://', 'https://');
}

export const API_BASE_URL = envApiUrl;
export const BASE_URL = API_BASE_URL.replace('/api', '');
console.log('🌐 API URL sendo usada:', API_BASE_URL);
export const UPLOADS_BASE_URL = `${BASE_URL}/uploads`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { BASE_URL };
export default api;