// routes/appointmentRoutes.js
import express from 'express';
import { body } from 'express-validator';
import appointmentController from '../controllers/appointmentController.js';

const router = express.Router();

// Validation middleware for appointment data
const validateAppointment = [
  body('job_id').notEmpty().withMessage('Job ID is required'),
  body('candidate_id').notEmpty().withMessage('Candidate ID is required'),
  body('date_time').notEmpty().isISO8601().withMessage('Valid date and time are required'),
  body('status').optional().isIn(['scheduled', 'completed', 'cancelled', 'no_show']).withMessage('Invalid status')
];

// Routes
router.post('/', validateAppointment, appointmentController.createAppointment);
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.get('/candidate/:candidateId', appointmentController.getAppointmentsByCandidate);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

export default router;