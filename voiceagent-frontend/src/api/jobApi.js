// src/api/jobApi.js
import apiClient from './apiClient';

const jobApi = {
  getAllJobs: () => apiClient.get('/jobs'),
  
  getJob: (id) => apiClient.get(`/jobs/${id}`),
  
  createJob: (jobData) => apiClient.post('/jobs', jobData),
  
  updateJob: (id, jobData) => apiClient.put(`/jobs/${id}`, jobData),
  
  deleteJob: (id) => apiClient.delete(`/jobs/${id}`),
};

export default jobApi;