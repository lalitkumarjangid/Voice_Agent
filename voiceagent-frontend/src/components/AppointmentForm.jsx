import React, { useState, useEffect } from 'react';
import appointmentApi from '../api/appointmentApi';
import jobApi from '../api/jobApi';
import candidateApi from '../api/candidateApi';

const AppointmentForm = ({ onSuccess, initialData = null, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    job_id: initialData?.job_id || '',
    candidate_id: initialData?.candidate_id || '',
    date_time: initialData?.date_time ? new Date(initialData.date_time).toISOString().slice(0, 16) : '',
    status: initialData?.status || 'scheduled',
  });

  // Fetch jobs and candidates data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [jobsResponse, candidatesResponse] = await Promise.all([
          jobApi.getAllJobs(),
          candidateApi.getAllCandidates()
        ]);
        
        setJobs(jobsResponse.data || []);
        setCandidates(candidatesResponse.data || []);
      } catch (err) {
        setError('Failed to load data. Please refresh the page.');
        console.error('Error loading form data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      let response;
      
      // Make sure job_id and candidate_id are numbers
      const appointmentData = {
        ...formData,
        job_id: parseInt(formData.job_id),
        candidate_id: parseInt(formData.candidate_id),
      };
      
      if (initialData) {
        // Update existing appointment
        response = await appointmentApi.updateAppointment(initialData.id, appointmentData);
      } else {
        // Create new appointment
        response = await appointmentApi.createAppointment(appointmentData);
      }
      
      if (response.success) {
        onSuccess(response.data);
      } else {
        setError(response.message || 'Failed to save appointment');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving the appointment');
      console.error('Appointment form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading form data...</div>;
  }

  return (
    <div className="form-container">
      <h2>{initialData ? 'Edit Appointment' : 'Schedule New Appointment'}</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="job_id">Select Job</label>
          <select
            id="job_id"
            name="job_id"
            value={formData.job_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a Job --</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="candidate_id">Select Candidate</label>
          <select
            id="candidate_id"
            name="candidate_id"
            value={formData.candidate_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a Candidate --</option>
            {candidates.map(candidate => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name} ({candidate.phone})
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="date_time">Appointment Date & Time</label>
          <input
            type="datetime-local"
            id="date_time"
            name="date_time"
            value={formData.date_time}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Appointment' : 'Schedule Appointment')}
          </button>
          
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;