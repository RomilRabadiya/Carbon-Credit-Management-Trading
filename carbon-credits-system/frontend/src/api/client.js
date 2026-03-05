import axios from 'axios';
import { toast } from 'react-toastify';

// Create a configured Axios instance
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a request interceptor to automatically attach the JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle global errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized responses globally
            if (error.response.status === 401) {
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('currentUser');
                window.location.href = '/login';
            } else if (error.response.status >= 500) {
                toast.error('A server error occurred. Please try again later.');
            }
        } else if (error.request) {
            // Network error
            toast.error('Network error. Check your connection to the server.');
        }

        return Promise.reject(error);
    }
);

export default apiClient;
