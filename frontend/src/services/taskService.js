import axiosInstance from '../utils/axiosInstance';

const taskService = {
  getAll:    ()         => axiosInstance.get('/api/tasks'),
  getToday:  ()         => axiosInstance.get('/api/tasks/today'),
  create:    (data)     => axiosInstance.post('/api/tasks', data),
  update:    (id, data) => axiosInstance.put(`/api/tasks/${id}`, data),
  complete:  (id)       => axiosInstance.put(`/api/tasks/${id}/complete`),
  delete:    (id)       => axiosInstance.delete(`/api/tasks/${id}`),
};

export default taskService;