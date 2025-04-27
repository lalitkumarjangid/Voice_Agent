// utils/validators.js
// Utility functions for data validation

const validators = {
    // Validate phone number format
    isValidPhone: (phone) => {
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      return phoneRegex.test(phone);
    },
    
    // Validate date format (ISO format)
    isValidDate: (date) => {
      return !isNaN(Date.parse(date));
    },
    
    // Sanitize inputs to prevent SQL injection and XSS
    sanitizeInput: (input) => {
      if (typeof input !== 'string') return input;
      
      // Replace potentially dangerous characters
      return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    },
    
    // Validate CTC value
    isValidCTC: (ctc) => {
      return typeof ctc === 'number' && ctc >= 0;
    }
  };
  
  export default validators;