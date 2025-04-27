// routes/voiceAgentRoutes.js
import express from 'express';
import { body } from 'express-validator';
import voiceAgentController from '../controllers/voiceAgentController.js';

const router = express.Router();

// Routes
router.post('/call', [
  body('candidate_id').notEmpty().withMessage('Candidate ID is required'),
  body('job_id').notEmpty().withMessage('Job ID is required')
], voiceAgentController.initiateCall);

router.post('/speech', [
  body('conversation_id').notEmpty().withMessage('Conversation ID is required'),
  body('audio_text').notEmpty().withMessage('Audio text is required')
], voiceAgentController.processSpeech);

router.post('/tts', [
  body('text').notEmpty().withMessage('Text is required for speech generation')
], voiceAgentController.generateSpeech);

router.post('/book', [
  body('conversation_id').notEmpty().withMessage('Conversation ID is required'),
  body('date_time').notEmpty().isISO8601().withMessage('Valid date and time are required')
], voiceAgentController.bookAppointment);

router.get('/conversations/:candidateId', voiceAgentController.getConversationHistory);

export default router;