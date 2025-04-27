// routes/jobRoutes.js
import express from 'express';
import { body } from 'express-validator';
import jobController from '../controllers/jobController.js';

const router = express.Router();

// Validation middleware for job data
const validateJob = [
  body('title').notEmpty().withMessage('Job title is required'),
  body('description').notEmpty().withMessage('Job description is required'),
  body('requirements').notEmpty().withMessage('Job requirements are required'),
  body('available_slots').isArray().withMessage('Available slots must be an array')
];

// Routes
router.post('/', validateJob, jobController.createJob);
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);
router.put('/:id', validateJob, jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

export default router;