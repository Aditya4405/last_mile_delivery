import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const isLive = () => import.meta.env.VITE_APP_MODE === 'live';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors, Refresh token lookup
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized / Token Expiry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if (refreshToken) {
          let newToken = `mock-refreshed-jwt-token-${Date.now()}`;
          if (isLive()) {
            // Real refresh call on backend
            const refreshRes = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
            newToken = refreshRes.data.data.accessToken;
          }
          
          const storageEngine = localStorage.getItem('token') ? localStorage : sessionStorage;
          storageEngine.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Clear auth and logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('refreshToken');
        window.location.href = '/login';
        toast.error('Session expired. Please log in again.');
        return Promise.reject(refreshError);
      }
    }

    // Standard Error notifications based on API responses
    const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
    
    // Ignore console errors for aborted requests
    if (!axios.isCancel(error)) {
      if (error.response?.status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (error.response?.status === 500) {
        toast.error('Internal Server Error. Please contact support.');
      } else {
        toast.error(errorMessage);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
