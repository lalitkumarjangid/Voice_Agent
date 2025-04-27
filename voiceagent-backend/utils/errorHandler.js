// utils/errorHandler.js
// Centralized error handling

const errorHandler = {
    // Handle database errors
    handleDbError: (err) => {
      console.error('Database error:', err);
      
      let message = 'Database error occurred';
      let statusCode = 500;
      
      // Specific error handling based on error type
      if (err.name === 'SequelizeUniqueConstraintError') {
        message = 'A record with this information already exists';
        statusCode = 409;
      } else if (err.name === 'SequelizeValidationError') {
        message = err.errors[0].message;
        statusCode = 400;
      }
      
      return { message, statusCode };
    },
    
    // Handle validation errors
    handleValidationError: (errors) => {
      console.error('Validation errors:', errors.array());
      
      return {
        message: 'Validation failed',
        errors: errors.array(),
        statusCode: 400
      };
    }
  };
  
  export default errorHandler;