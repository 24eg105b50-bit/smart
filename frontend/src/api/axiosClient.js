import axios from 'axios';

// Centralized Axios instance with request and response interceptors
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Automatically attach JWT Bearer token if present
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopsphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract payload data and handle unauthorized 401 gracefully
axiosClient.interceptors.response.use(
  (response) => {
    // If backend wrapped in ApiResponse<T>, unwrap data where appropriate
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on login page, clear expired credentials
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('shopsphere_token');
        localStorage.removeItem('shopsphere_user');
      }
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
