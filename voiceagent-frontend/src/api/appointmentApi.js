// src/api/appointmentApi.js
import apiClient from './apiClient';

const appointmentApi = {
  getAllAppointments: () => apiClient.get('/appointments'),
  
  getAppointment: (id) => apiClient.get(`/appointments/${id}`),
  
  createAppointment: (appointmentData) => apiClient.post('/appointments', appointmentData),
  
  getAppointmentsByCandidate: (candidateId) => apiClient.get(`/appointments/candidate/${candidateId}`),
  
  updateAppointment: (id, appointmentData) => apiClient.put(`/appointments/${id}`, appointmentData),
  
  deleteAppointment: (id) => apiClient.delete(`/appointments/${id}`),
};

export default appointmentApi;