import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL; // Sesuaikan port jika berbeda

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor untuk menambahkan token JWT ke setiap request jika ada
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor untuk response error (opsional, bisa untuk handling global error seperti 401)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Contoh: otomatis logout atau redirect ke login jika token expired/invalid
            // localStorage.removeItem('token');
            // localStorage.removeItem('user');
            // window.location.href = '/login'; // Hard redirect
            console.error("Unauthorized access - 401. Potentially redirect to login.");
        }
        return Promise.reject(error);
    }
);

export default apiClient;