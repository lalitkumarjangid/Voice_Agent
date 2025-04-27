import React, { useState } from 'react';
import JobForm from './JobForm';
import CandidateForm from './CandidateForm';
import AppointmentForm from './AppointmentForm';

const ManagementPage = ({ onDataUpdate }) => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const handleFormSuccess = (data) => {
    setShowForm(false);
    setEditItem(null);
    if (onDataUpdate) onDataUpdate();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const renderContent = () => {
    if (showForm) {
      switch (activeTab) {
        case 'jobs':
          return <JobForm onSuccess={handleFormSuccess} initialData={editItem} onCancel={handleCancel} />;
        case 'candidates':
          return <CandidateForm onSuccess={handleFormSuccess} initialData={editItem} onCancel={handleCancel} />;
        case 'appointments':
          return <AppointmentForm onSuccess={handleFormSuccess} initialData={editItem} onCancel={handleCancel} />;
        default:
          return null;
      }
    }

    return (
      <div className="management-intro">
        <h3>Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
        <p>Use this section to create and manage {activeTab}.</p>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          {activeTab === 'jobs' && 'Add New Job'}
          {activeTab === 'candidates' && 'Add New Candidate'}
          {activeTab === 'appointments' && 'Schedule New Appointment'}
        </button>
      </div>
    );
  };

  return (
    <div className="management-page">
      <h2>Data Management</h2>
      
      <div className="tab-navigation">
        <button 
          className={activeTab === 'jobs' ? 'active' : ''} 
          onClick={() => { 
            setActiveTab('jobs'); 
            setShowForm(false);
            setEditItem(null);
          }}
        >
          Jobs
        </button>
        <button 
          className={activeTab === 'candidates' ? 'active' : ''} 
          onClick={() => { 
            setActiveTab('candidates');
            setShowForm(false);
            setEditItem(null);
          }}
        >
          Candidates
        </button>
        <button 
          className={activeTab === 'appointments' ? 'active' : ''} 
          onClick={() => { 
            setActiveTab('appointments');
            setShowForm(false);
            setEditItem(null);
          }}
        >
          Appointments
        </button>
      </div>
      
      <div className="management-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ManagementPage;