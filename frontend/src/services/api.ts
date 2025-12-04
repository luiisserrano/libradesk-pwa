import axios from "axios";

// Siempre usar el dominio que pongas en .env
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        "Accept": "application/json",
    },
    withCredentials: true,
});

// Add token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
