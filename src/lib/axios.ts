import axios from 'axios';
import { AUTH_ENDPOINTS } from '../constants/api/auth';
import { logout } from '../store/slices/authSlice.js';
import { store } from '../store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    // STOP infinite loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== AUTH_ENDPOINTS.REFRESH
    ) {

      originalRequest._retry = true;

      try {

        await api.post(AUTH_ENDPOINTS.REFRESH);

        return api(originalRequest);

      } catch (refreshError) {

        store.dispatch(logout());

        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;