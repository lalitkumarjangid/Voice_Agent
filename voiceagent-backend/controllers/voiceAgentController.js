// controllers/voiceAgentController.js
import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import Conversation from '../models/Conversation.js';
import Appointment from '../models/Appointment.js';
import voiceService from '../services/voiceService.js';
import dialogueService from '../services/dialogueService.js';
import entityExtractionService from '../services/entityExtractionService.js';
import config from '../config/config.js';

const voiceAgentController = {
  // Initiate a call with a candidate
  initiateCall: async (req, res) => {
    try {
      const { candidate_id, job_id } = req.body;
      
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
      
      // In a real implementation, this would actually make a call
      // For now, we'll just simulate the call flow
      
      // Create a conversation record to track this interaction
      const conversation = await Conversation.create({
        candidate_id,
        transcript: `Call initiated for job: ${job.title}`,
        entities_extracted: {}
      });
      
      return res.status(200).json({
        success: true,
        message: 'Call initiated successfully',
        conversation_id: conversation.id,
        data: {
          candidate: candidate,
          job: job
        }
      });
    } catch (error) {
      console.error('Error initiating call:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate call',
        error: error.message
      });
    }
  },
  
  // Process speech to text
  processSpeech: async (req, res) => {
    try {
      // This would typically receive audio data and use Vosk to convert to text
      // For simulation purposes, we'll just accept text directly
      
      const { conversation_id, audio_text } = req.body;
      
      if (!audio_text) {
        return res.status(400).json({
          success: false,
          message: 'No speech input provided'
        });
      }
      
      // Retrieve conversation to update
      const conversation = await Conversation.findByPk(conversation_id);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
      
      // Extract entities from the text
      const entities = await entityExtractionService.extractEntities(audio_text);
      
      // Update conversation with new transcript and entities
      const updatedTranscript = conversation.transcript + '\nCandidate: ' + audio_text;
      const updatedEntities = { ...conversation.entities_extracted, ...entities };
      
      await conversation.update({
        transcript: updatedTranscript,
        entities_extracted: updatedEntities
      });
      
      // Process dialogue and get appropriate response
      const response = await dialogueService.processDialogue(audio_text, entities, conversation_id);
      
      // Update transcript with agent response
      await conversation.update({
        transcript: conversation.transcript + '\nAgent: ' + response
      });
      
      return res.status(200).json({
        success: true,
        data: {
          input: audio_text,
          entities: entities,
          response: response
        }
      });
    } catch (error) {
      console.error('Error processing speech:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process speech',
        error: error.message
      });
    }
  },
  
  // Generate speech from text
  generateSpeech: async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'No text provided for speech generation'
        });
      }
      
      // In a real implementation, this would use Mozilla TTS to generate audio
      // For simulation purposes, we'll just acknowledge the request
      
      return res.status(200).json({
        success: true,
        message: 'Speech generation request received',
        data: {
          text: text,
          // This would normally include audio data or a URL
          audio_placeholder: 'This would be audio data in a real implementation'
        }
      });
    } catch (error) {
      console.error('Error generating speech:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate speech',
        error: error.message
      });
    }
  },
  
  // Book an appointment based on conversation data
  bookAppointment: async (req, res) => {
    try {
      const { conversation_id, date_time } = req.body;
      
      // Retrieve conversation
      const conversation = await Conversation.findByPk(conversation_id);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
      
      // Get candidate from conversation
      const candidate = await Candidate.findByPk(conversation.candidate_id);
      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }
      
      // For this example, we'll assume the job_id is stored in the entities_extracted
      // In a real implementation, you would need to track this properly
      const job_id = conversation.entities_extracted.job_id;
      
      if (!job_id) {
        return res.status(400).json({
          success: false,
          message: 'No job associated with this conversation'
        });
      }
      
      // Create the appointment
      const appointment = await Appointment.create({
        job_id,
        candidate_id: candidate.id,
        date_time,
        status: 'scheduled'
      });
      
      // Update conversation transcript with booking confirmation
      await conversation.update({
        transcript: conversation.transcript + 
          `\nAgent: We've scheduled your interview on ${new Date(date_time).toLocaleString()}. Is that correct?`
      });
      
      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: appointment
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to book appointment',
        error: error.message
      });
    }
  },
  
  // Get conversation history
  getConversationHistory: async (req, res) => {
    try {
      const { candidateId } = req.params;
      
      const conversations = await Conversation.findAll({
        where: { candidate_id: candidateId },
        order: [['created_at', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        count: conversations.length,
        data: conversations
      });
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation history',
        error: error.message
      });
    }
  }
};

export default voiceAgentController;