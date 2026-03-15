import axiosInstance from '../utils/axiosInstance';

const sessionService = {
  start:   (taskId) => axiosInstance.post('/api/sessions/start', { taskId }),
  pause:   (id)     => axiosInstance.put(`/api/sessions/${id}/pause`),
  resume:  (id)     => axiosInstance.put(`/api/sessions/${id}/resume`),
  end:     (id)     => axiosInstance.put(`/api/sessions/${id}/end`),
  current: ()       => axiosInstance.get('/api/sessions/current'),
};

export default sessionService;