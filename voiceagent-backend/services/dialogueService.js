// services/dialogueService.js
// This service handles the conversation flow and dialogue management

import Conversation from '../models/Conversation.js';
import config from '../config/config.js';

const dialogueService = {
  // Define the conversation flow stages
  CONVERSATION_STAGES: {
    GREETING: 'greeting',
    INTEREST: 'interest',
    NOTICE_PERIOD: 'notice_period',
    CTC: 'ctc',
    AVAILABILITY: 'availability',
    CONFIRMATION: 'confirmation',
    CLOSING: 'closing'
  },
  
  // Process dialogue and determine appropriate response
  processDialogue: async (userInput, entities, conversationId) => {
    try {
      // Retrieve conversation to determine context
      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      // Determine current stage based on conversation history
      const currentStage = dialogueService.determineConversationStage(conversation);
      console.log("Current stage before processing:", currentStage);
      
      // Generate appropriate response based on stage
      let response;
      let newStage = currentStage; // Default to keeping the same stage
      
      switch (currentStage) {
        case dialogueService.CONVERSATION_STAGES.GREETING:
          response = dialogueService.handleInterestQuestion(userInput);
          // If positive response, move to next stage
          if (userInput.toLowerCase().includes('yes') || 
              userInput.toLowerCase().includes('interested') ||
              userInput.toLowerCase().includes('sure')) {
            newStage = dialogueService.CONVERSATION_STAGES.NOTICE_PERIOD;
          } else if (userInput.toLowerCase().includes('no') || 
                    userInput.toLowerCase().includes('not interested')) {
            newStage = dialogueService.CONVERSATION_STAGES.CLOSING;
          }
          break;
          
        case dialogueService.CONVERSATION_STAGES.NOTICE_PERIOD:
          response = dialogueService.handleNoticePeriodQuestion(userInput, entities);
          // If notice period provided, move to next stage
          if (userInput.match(/\d+\s*(month|months|day|days|week|weeks)/i) || 
              (entities && entities.notice_period)) {
            newStage = dialogueService.CONVERSATION_STAGES.CTC;
          }
          break;
          
        case dialogueService.CONVERSATION_STAGES.CTC:
          response = dialogueService.handleCTCQuestion(userInput, entities);
          // If salary info provided, move to next stage
          if (userInput.match(/\d+\s*(k|lakh|lakhs|thousand|lpa)/i) || 
              (entities && (entities.current_ctc || entities.expected_ctc))) {
            newStage = dialogueService.CONVERSATION_STAGES.AVAILABILITY;
          }
          break;
          
        case dialogueService.CONVERSATION_STAGES.AVAILABILITY:
          response = dialogueService.handleAvailabilityQuestion(userInput, entities);
          // If date/time provided, move to next stage
          if (userInput.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i) ||
              userInput.match(/\d+:\d+/i) ||
              userInput.match(/(am|pm|morning|afternoon|evening)/i) ||
              (entities && entities.date_time)) {
            newStage = dialogueService.CONVERSATION_STAGES.CONFIRMATION;
          }
          break;
          
        case dialogueService.CONVERSATION_STAGES.CONFIRMATION:
          response = dialogueService.handleConfirmationQuestion(userInput);
          // If confirmed, move to closing
          if (userInput.toLowerCase().includes('yes') || 
              userInput.toLowerCase().includes('correct') || 
              userInput.toLowerCase().includes('that works')) {
            newStage = dialogueService.CONVERSATION_STAGES.CLOSING;
          } else if (userInput.toLowerCase().includes('no') || 
                    userInput.toLowerCase().includes('not correct')) {
            newStage = dialogueService.CONVERSATION_STAGES.AVAILABILITY;
          }
          break;
          
        case dialogueService.CONVERSATION_STAGES.CLOSING:
          response = "Thank you for your time. We look forward to speaking with you soon!";
          break;
          
        default:
          response = "I'm sorry, I didn't understand that. Could you please repeat?";
      }
      
      // Update the conversation with the new stage
      await conversation.update({ 
        current_stage: newStage 
      });
      
      console.log("Stage updated to:", newStage);
      return response;
    } catch (error) {
      console.error('Error processing dialogue:', error);
      return "I'm sorry, there was an error processing your response. Please try again.";
    }
  },

  // Determine the current stage of the conversation
  determineConversationStage: (conversation) => {
    // First check if we have a stored current_stage
    if (conversation.current_stage) {
      return conversation.current_stage;
    }

    // Otherwise use the heuristic approach as fallback
    if (!conversation.transcript || conversation.transcript.length < 10) {
      return dialogueService.CONVERSATION_STAGES.GREETING;
    }
    
    const transcript = conversation.transcript.toLowerCase();
    
    // Check stages in reverse order (most advanced first)
    if (transcript.includes('calendar invitation') || 
        transcript.includes('anything else you')) {
      return dialogueService.CONVERSATION_STAGES.CLOSING;
    }
    
    if (transcript.includes('scheduled your interview') && 
        transcript.includes('is that correct')) {
      return dialogueService.CONVERSATION_STAGES.CONFIRMATION;
    }
    
    if (transcript.includes('available for an interview')) {
      return dialogueService.CONVERSATION_STAGES.AVAILABILITY;
    }
    
    if (transcript.includes('current and expected ctc')) {
      return dialogueService.CONVERSATION_STAGES.CTC;
    }
    
    if (transcript.includes('notice period')) {
      return dialogueService.CONVERSATION_STAGES.NOTICE_PERIOD;
    }
    
    if (transcript.includes('interested in')) {
      return dialogueService.CONVERSATION_STAGES.GREETING;
    }
    
    return dialogueService.CONVERSATION_STAGES.GREETING;
  },
  
  // Generate appropriate greeting
  generateGreeting: (conversation) => {
    try {
      // In a real implementation, this would use candidate and job data
      // from the conversation or related models
      return `Hello, this is ${config.companyName} calling regarding a job opportunity. Are you interested in hearing more about this role?`;
    } catch (error) {
      console.error('Error generating greeting:', error);
      return "Hello, this is an automated call about a job opportunity. Are you interested in hearing more?";
    }
  },
  
  // Handle response to interest question
  handleInterestQuestion: (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('yes') || input.includes('sure') || input.includes('interested')) {
      return "Great! What is your current notice period?";
    } else if (input.includes('no') || input.includes('not interested')) {
      return "I understand. Thank you for your time. Have a great day!";
    } else {
      return "I'm sorry, I didn't catch that. Are you interested in this job opportunity?";
    }
  },
  
  // Handle response to notice period question
  handleNoticePeriodQuestion: (userInput, entities) => {
    // Check if we successfully extracted a notice period or if the input includes number + time unit
    if ((entities && entities.notice_period) || userInput.match(/\d+\s*(month|months|day|days|week|weeks)/i)) {
      return `Thank you. Can you share your current and expected CTC (Cost to Company)?`;
    } else {
      return "I didn't catch your notice period. Could you please specify it in months?";
    }
  },
  
  // Handle response to CTC question
  handleCTCQuestion: (userInput, entities) => {
    // Check if we successfully extracted CTC values or input has salary indicators
    if ((entities && (entities.current_ctc || entities.expected_ctc)) || 
         userInput.match(/\d+\s*(k|lakh|lakhs|thousand|lpa)/i)) {
      return "Thank you for sharing that information. When are you available for an interview next week?";
    } else {
      return "I didn't catch your CTC details. Could you please share your current and expected salary?";
    }
  },
  
  // Handle response to availability question
  handleAvailabilityQuestion: (userInput, entities) => {
    // Check if we successfully extracted date and time or basic time indicators
    if ((entities && entities.date_time) || 
         userInput.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i) ||
         userInput.match(/\d+:\d+/i) ||
         userInput.match(/(am|pm|morning|afternoon|evening)/i)) {
         
      // In a real system, we would extract the actual date/time here
      const dateTime = entities?.date_time ? 
                        new Date(entities.date_time).toLocaleString() : 
                        "the time you suggested";
                        
      return `We've scheduled your interview on ${dateTime}. Is that correct?`;
    } else {
      return "I didn't catch your availability. Could you please specify a day and time next week?";
    }
  },
  
  // Handle response to confirmation question
  handleConfirmationQuestion: (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('yes') || input.includes('correct') || input.includes('that works')) {
      return "Excellent! You will receive a calendar invitation shortly. Is there anything else you'd like to know about the role?";
    } else if (input.includes('no') || input.includes('not correct') || input.includes("doesn't work")) {
      return "I apologize for the misunderstanding. Could you please suggest an alternative date and time?";
    } else {
      return "I'm sorry, I didn't catch that. Is the scheduled interview time correct?";
    }
  }
};

export default dialogueService;