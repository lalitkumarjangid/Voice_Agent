// src/api/candidateApi.js
import apiClient from './apiClient';

const candidateApi = {
  getAllCandidates: () => apiClient.get('/candidates'),
  
  getCandidate: (id) => apiClient.get(`/candidates/${id}`),
  
  createCandidate: (candidateData) => apiClient.post('/candidates', candidateData),
  
  updateCandidate: (id, candidateData) => apiClient.put(`/candidates/${id}`, candidateData),
  
  deleteCandidate: (id) => apiClient.delete(`/candidates/${id}`),
};

export default candidateApi;