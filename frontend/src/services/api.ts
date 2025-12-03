import axios from 'axios';

// Use environment variable or fallback to dynamic hostname (for LAN access)
const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Si estamos en desarrollo (localhost o IP), asumir backend en puerto 8000
    return `http://${window.location.hostname}:8000`;
};

const API_URL = getBaseUrl();

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Add token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
