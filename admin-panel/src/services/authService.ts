import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/login', { email, password });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const data = error.response.data;
        const err: any = new Error(data.message || 'Error al iniciar sesión');
        err.errors = data.errors;
        throw err;
      }
      throw error;
    }
  },

  register: async (username: string, email: string, password: string, password_confirmation: string) => {
    const response = await api.post('/register', { 
      username, 
      email, 
      password, 
      password_confirmation 
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  }
};
