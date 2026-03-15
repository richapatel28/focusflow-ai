import axiosInstance from '../utils/axiosInstance';

const analyticsService = {
  getDashboard: () =>
    axiosInstance.get('/api/analytics/dashboard'),

  getWeekly: () =>
    axiosInstance.get('/api/analytics/weekly'),

  generate: (date) =>
    axiosInstance.post('/api/analytics/generate', { date: date || null }),
};

export default analyticsService;