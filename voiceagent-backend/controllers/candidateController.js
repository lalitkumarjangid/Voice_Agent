// controllers/candidateController.js
import Candidate from '../models/Candidate.js';
import { validationResult } from 'express-validator';

const candidateController = {
  // Create a new candidate
  createCandidate: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, phone, current_ctc, expected_ctc, notice_period, experience } = req.body;
      
      // Check if candidate with same phone exists
      const existingCandidate = await Candidate.findOne({ where: { phone } });
      if (existingCandidate) {
        return res.status(409).json({
          success: false,
          message: 'Candidate with this phone number already exists'
        });
      }
      
      const candidate = await Candidate.create({
        name,
        phone,
        current_ctc,
        expected_ctc,
        notice_period,
        experience
      });

      return res.status(201).json({
        success: true,
        data: candidate
      });
    } catch (error) {
      console.error('Error creating candidate:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create candidate',
        error: error.message
      });
    }
  },

  // Get all candidates
  getAllCandidates: async (req, res) => {
    try {
      const candidates = await Candidate.findAll();
      return res.status(200).json({
        success: true,
        count: candidates.length,
        data: candidates
      });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch candidates',
        error: error.message
      });
    }
  },

  // Get a single candidate by ID
  getCandidateById: async (req, res) => {
    try {
      const { id } = req.params;
      const candidate = await Candidate.findByPk(id);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: candidate
      });
    } catch (error) {
      console.error('Error fetching candidate:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch candidate',
        error: error.message
      });
    }
  },

  // Update a candidate
  updateCandidate: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, phone, current_ctc, expected_ctc, notice_period, experience } = req.body;

      const candidate = await Candidate.findByPk(id);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }

      // If phone is being updated, check for duplicates
      if (phone && phone !== candidate.phone) {
        const existingCandidate = await Candidate.findOne({ where: { phone } });
        if (existingCandidate) {
          return res.status(409).json({
            success: false,
            message: 'Another candidate with this phone number already exists'
          });
        }
      }

      await candidate.update({
        name: name || candidate.name,
        phone: phone || candidate.phone,
        current_ctc: current_ctc !== undefined ? current_ctc : candidate.current_ctc,
        expected_ctc: expected_ctc !== undefined ? expected_ctc : candidate.expected_ctc,
        notice_period: notice_period !== undefined ? notice_period : candidate.notice_period,
        experience: experience !== undefined ? experience : candidate.experience
      });

      return res.status(200).json({
        success: true,
        data: candidate
      });
    } catch (error) {
      console.error('Error updating candidate:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update candidate',
        error: error.message
      });
    }
  },

  // Delete a candidate
  deleteCandidate: async (req, res) => {
    try {
      const { id } = req.params;

      const candidate = await Candidate.findByPk(id);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate not found'
        });
      }

      await candidate.destroy();

      return res.status(200).json({
        success: true,
        message: 'Candidate deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete candidate',
        error: error.message
      });
    }
  }
};

export default candidateController;