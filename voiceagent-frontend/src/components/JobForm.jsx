import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import jobApi from '../api/jobApi';

const JobForm = ({ onSuccess, initialData = null, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    requirements: initialData?.requirements || '',
    available_slots: initialData?.available_slots || [],
  });

  // For date picker
  const [selectedDate, setSelectedDate] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a selected date slot to the available slots array
  const handleAddDateSlot = () => {
    if (!selectedDate) return;
    
    const isoString = selectedDate.toISOString();
    
    // Check if date already exists in slots
    if (!formData.available_slots.includes(isoString)) {
      setFormData(prev => ({
        ...prev,
        available_slots: [...prev.available_slots, isoString]
      }));
    }
    
    // Reset the date picker
    setSelectedDate(null);
  };

  // Remove a date slot
  const handleRemoveSlot = (slotToRemove) => {
    setFormData(prev => ({
      ...prev,
      available_slots: prev.available_slots.filter(slot => slot !== slotToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      let response;
      if (initialData) {
        // Update existing job
        response = await jobApi.updateJob(initialData.id, formData);
      } else {
        // Create new job
        response = await jobApi.createJob(formData);
      }
      
      if (response.success) {
        onSuccess(response.data);
      } else {
        setError(response.message || 'Failed to save job');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving the job');
      console.error('Job form error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="form-container">
      <h2>{initialData ? 'Edit Job' : 'Add New Job'}</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Job Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="requirements">Requirements</label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows="3"
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label>Available Slots</label>
          <div className="date-picker-container">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={30}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Select date and time"
              className="date-picker"
              minDate={new Date()}
            />
            <button 
              type="button" 
              className="btn-add-slot"
              onClick={handleAddDateSlot}
              disabled={!selectedDate}
            >
              Add Slot
            </button>
          </div>
          
          <div className="selected-slots">
            <h4>Selected Time Slots: ({formData.available_slots.length})</h4>
            {formData.available_slots.length === 0 ? (
              <p className="no-slots">No slots added yet. Please add at least one available time slot.</p>
            ) : (
              <ul className="slots-list">
                {formData.available_slots.map((slot, index) => (
                  <li key={index} className="slot-item">
                    <span>{formatDate(slot)}</span>
                    <button 
                      type="button"
                      className="btn-remove"
                      onClick={() => handleRemoveSlot(slot)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting || formData.available_slots.length === 0}
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Job' : 'Create Job')}
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

export default JobForm;