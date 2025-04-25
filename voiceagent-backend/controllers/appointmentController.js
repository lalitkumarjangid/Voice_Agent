// controllers/appointmentController.js
import Appointment from '../models/Appointment.js';
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import { validationResult } from 'express-validator';

const appointmentController = {
  // Create a new appointment
  createAppointment: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { job_id, candidate_id, date_time, status } = req.body;
      
      // Verify that job and candidate exist
      const job = await Job.findByPk(job_id);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      const candidate = await Candidate.findByPk(candidate_id);
      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }
      
      const appointment = await Appointment.create({
        job_id,
        candidate_id,
        date_time,
        status: status || 'scheduled'
      });

      return res.status(201).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create appointment',
        error: error.message
      });
    }
  },

  // Get all appointments
  getAllAppointments: async (req, res) => {
    try {
      const appointments = await Appointment.findAll({
        include: [
          { model: Job, attributes: ['title'] },
          { model: Candidate, attributes: ['name', 'phone'] }
        ]
      });
      
      return res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch appointments',
        error: error.message
      });
    }
  },

  // Get a single appointment by ID
  getAppointmentById: async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findByPk(id, {
        include: [
          { model: Job, attributes: ['title'] },
          { model: Candidate, attributes: ['name', 'phone'] }
        ]
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch appointment',
        error: error.message
      });
    }
  },

  // Get appointments by candidate
  getAppointmentsByCandidate: async (req, res) => {
    try {
      const { candidateId } = req.params;
      
      const candidate = await Candidate.findByPk(candidateId);
      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }
      
      const appointments = await Appointment.findAll({
        where: { candidate_id: candidateId },
        include: [{ model: Job, attributes: ['title'] }]
      });

      return res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch appointments',
        error: error.message
      });
    }
  },

  // Update an appointment
  updateAppointment: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { date_time, status } = req.body;

      const appointment = await Appointment.findByPk(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      await appointment.update({
        date_time: date_time || appointment.date_time,
        status: status || appointment.status
      });

      return res.status(200).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update appointment',
        error: error.message
      });
    }
  },

  // Delete an appointment
  deleteAppointment: async (req, res) => {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByPk(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      await appointment.destroy();

      return res.status(200).json({
        success: true,
        message: 'Appointment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete appointment',
        error: error.message
      });
    }
  }
};

export default appointmentController;