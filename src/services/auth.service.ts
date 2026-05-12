import api from '../lib/axios.js';
import type { LoginFormData, SignupFormData } from '../validations/auth.schema.js';
import { AUTH_ENDPOINTS } from '../constants/api/auth.js';

export const authService = {
  signup: async (data: SignupFormData) => {
    const { confirmPassword, ...signupData } = data;
    const response = await api.post(AUTH_ENDPOINTS.SIGNUP, signupData);
    return response.data;
  },

  login: async (data: LoginFormData) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post(AUTH_ENDPOINTS.LOGOUT);
    return response.data;
  },

};

