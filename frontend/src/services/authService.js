import axiosInstance from '../utils/axiosInstance';

const authService = {
  register: (name, email, password) =>
    axiosInstance.post('/api/auth/register', { name, email, password }),

  login: (email, password) =>
    axiosInstance.post('/api/auth/login', { email, password }),

  getMe: () =>
    axiosInstance.get('/api/auth/me'),
};

export default authService;