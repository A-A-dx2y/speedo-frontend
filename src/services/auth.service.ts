import api from '../lib/axios.js';
import type { LoginFormData, SignupFormData } from '../validations/auth.schema.js';

export const authService = {
  signup: async (data: SignupFormData) => {
    // We don't send confirmPassword to the backend
    const { confirmPassword, ...signupData } = data;
    const response = await api.post('/auth/signup', signupData);
    return response.data;
  },

  login: async (data: LoginFormData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

};
