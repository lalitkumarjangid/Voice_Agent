// routes/candidateRoutes.js
import express from 'express';
import { body } from 'express-validator';
import candidateController from '../controllers/candidateController.js';

const router = express.Router();

// Validation middleware for candidate data
const validateCandidate = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('current_ctc').optional().isFloat({ min: 0 }).withMessage('Current CTC must be a positive number'),
  body('expected_ctc').optional().isFloat({ min: 0 }).withMessage('Expected CTC must be a positive number'),
  body('notice_period').optional().isInt({ min: 0 }).withMessage('Notice period must be a positive integer'),
  body('experience').optional().isFloat({ min: 0 }).withMessage('Experience must be a positive number')
];

// Routes
router.post('/', validateCandidate, candidateController.createCandidate);
router.get('/', candidateController.getAllCandidates);
router.get('/:id', candidateController.getCandidateById);
router.put('/:id', validateCandidate, candidateController.updateCandidate);
router.delete('/:id', candidateController.deleteCandidate);

export default router;