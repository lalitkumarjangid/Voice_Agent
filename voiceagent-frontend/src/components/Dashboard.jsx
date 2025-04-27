// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import jobApi from '../api/jobApi';
import candidateApi from '../api/candidateApi';
import appointmentApi from '../api/appointmentApi';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [jobsResponse, candidatesResponse, appointmentsResponse] = await Promise.all([
          jobApi.getAllJobs(),
          candidateApi.getAllCandidates(),
          appointmentApi.getAllAppointments(),
        ]);
        
        setJobs(jobsResponse.data || []);
        setCandidates(candidatesResponse.data || []);
        setAppointments(appointmentsResponse.data || []);
        
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading dashboard data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Voice Agent Dashboard</h1>

      <section className="dashboard-section">
        <h2>Jobs ({jobs.length})</h2>
        <div className="data-grid">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Available Slots</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td>{job.title}</td>
                  <td>{job.available_slots ? job.available_slots.length : 0} slots</td>
                  <td>{new Date(job.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Candidates ({candidates.length})</h2>
        <div className="data-grid">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Expected CTC</th>
                <th>Notice Period</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.id}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.phone}</td>
                  <td>{candidate.expected_ctc || 'N/A'}</td>
                  <td>{candidate.notice_period || 'N/A'} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Appointments ({appointments.length})</h2>
        <div className="data-grid">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Candidate</th>
                <th>Job</th>
                <th>Date/Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.Candidate?.name || appointment.candidate_id}</td>
                  <td>{appointment.Job?.title || appointment.job_id}</td>
                  <td>{new Date(appointment.date_time).toLocaleString()}</td>
                  <td>{appointment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;