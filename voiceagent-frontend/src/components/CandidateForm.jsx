import React, { useState } from 'react';
import candidateApi from '../api/candidateApi';

const CandidateForm = ({ onSuccess, initialData = null, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    current_ctc: initialData?.current_ctc || '',
    expected_ctc: initialData?.expected_ctc || '',
    notice_period: initialData?.notice_period || '',
    experience: initialData?.experience || '',
  });

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
    
    // Convert numeric fields from strings to numbers
    const candidateData = {
      ...formData,
      current_ctc: formData.current_ctc ? parseFloat(formData.current_ctc) : null,
      expected_ctc: formData.expected_ctc ? parseFloat(formData.expected_ctc) : null,
      notice_period: formData.notice_period ? parseInt(formData.notice_period) : null,
      experience: formData.experience ? parseFloat(formData.experience) : null,
    };
    
    try {
      let response;
      if (initialData) {
        // Update existing candidate
        response = await candidateApi.updateCandidate(initialData.id, candidateData);
      } else {
        // Create new candidate
        response = await candidateApi.createCandidate(candidateData);
      }
      
      if (response.success) {
        onSuccess(response.data);
      } else {
        setError(response.message || 'Failed to save candidate');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving the candidate');
      console.error('Candidate form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{initialData ? 'Edit Candidate' : 'Add New Candidate'}</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91XXXXXXXXXX"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="current_ctc">Current CTC (in lakhs)</label>
          <input
            type="number"
            id="current_ctc"
            name="current_ctc"
            step="0.1"
            min="0"
            value={formData.current_ctc}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="expected_ctc">Expected CTC (in lakhs)</label>
          <input
            type="number"
            id="expected_ctc"
            name="expected_ctc"
            step="0.1"
            min="0"
            value={formData.expected_ctc}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="notice_period">Notice Period (in days)</label>
          <input
            type="number"
            id="notice_period"
            name="notice_period"
            min="0"
            value={formData.notice_period}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="experience">Experience (in years)</label>
          <input
            type="number"
            id="experience"
            name="experience"
            step="0.1"
            min="0"
            value={formData.experience}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Candidate' : 'Add Candidate')}
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

export default CandidateForm;