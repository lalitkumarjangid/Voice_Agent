import * as chrono from 'chrono-node';
import natural from 'natural';

const entityExtractionService = {
  // Extract entities from text input
  extractEntities: async (text) => {
    try {
      const entities = {};
      
      // Extract date/time entities using chrono-node
      entities.date_time = entityExtractionService.extractDateTime(text);
      
      // Extract notice period
      entities.notice_period = entityExtractionService.extractNoticePeriod(text);
      
      // Extract CTC information
      const ctcInfo = entityExtractionService.extractCTC(text);
      if (ctcInfo.current_ctc) entities.current_ctc = ctcInfo.current_ctc;
      if (ctcInfo.expected_ctc) entities.expected_ctc = ctcInfo.expected_ctc;
      
      return entities;
    } catch (error) {
      console.error('Error extracting entities:', error);
      return {};
    }
  },
  
  // Extract date and time information
  extractDateTime: (text) => {
    const results = chrono.parse(text);
    
    if (results && results.length > 0) {
      return results[0].start.date();
    }
    
    return null;
  },
  
  // Extract notice period (in days)
  extractNoticePeriod: (text) => {
    const lowerText = text.toLowerCase();
    
    // Simple regex patterns for notice period
    const monthsPattern = /(\d+)\s*(month|months)/i;
    const weeksPattern = /(\d+)\s*(week|weeks)/i;
    const daysPattern = /(\d+)\s*(day|days)/i;
    
    let noticePeriod = null;
    
    // Extract months
    const monthsMatch = lowerText.match(monthsPattern);
    if (monthsMatch) {
      noticePeriod = parseInt(monthsMatch[1]) * 30; // Convert months to days
      return noticePeriod;
    }
    
    // Extract weeks
    const weeksMatch = lowerText.match(weeksPattern);
    if (weeksMatch) {
      noticePeriod = parseInt(weeksMatch[1]) * 7; // Convert weeks to days
      return noticePeriod;
    }
    
    // Extract days
    const daysMatch = lowerText.match(daysPattern);
    if (daysMatch) {
      noticePeriod = parseInt(daysMatch[1]);
      return noticePeriod;
    }
    
    return null;
  },
  
  // Extract current and expected CTC
  extractCTC: (text) => {
    const lowerText = text.toLowerCase();
    const result = {
      current_ctc: null,
      expected_ctc: null
    };
    
    // Pattern for current CTC
    const currentPattern = /current(?:\s+ctc|\s+salary)?\s+(?:is|of)?\s*(?:inr|rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs|lakh|l|lpa)?/i;
    const currentMatch = lowerText.match(currentPattern);
    if (currentMatch) {
      result.current_ctc = parseFloat(currentMatch[1]);
    }
    
    // Pattern for expected CTC
    const expectedPattern = /expect(?:ed|ing)(?:\s+ctc|\s+salary)?\s+(?:is|of)?\s*(?:inr|rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs|lakh|l|lpa)?/i;
    const expectedMatch = lowerText.match(expectedPattern);
    if (expectedMatch) {
      result.expected_ctc = parseFloat(expectedMatch[1]);
    }
    
    return result;
  }
};

export default entityExtractionService;