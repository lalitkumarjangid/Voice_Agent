const BASE_URL = 'http://localhost:3000/api/voice';

// Helper function for API requests
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`Making ${method} request to ${endpoint} with data:`, data);
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log("Raw API response:", responseData);
    return responseData; // Return the raw response directly
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    throw error; // Throw the error to be caught by the caller
  }
};

const voiceApi = {
  // Start a new conversation with a candidate for a specific job
  initiateCall: async (candidateId, jobId) => {
    return apiRequest('/call', 'POST', { 
      candidate_id: candidateId, 
      job_id: jobId 
    });
  },
  
  // Process speech text from the frontend
  processSpeech: async (conversationId, audioText) => {
    return apiRequest('/speech', 'POST', {
      conversation_id: conversationId,
      audio_text: audioText
    });
  },
  
  // Generate speech from text (server TTS fallback)
  generateSpeech: async (text) => {
    return apiRequest('/tts', 'POST', { text });
  },
  
  // Book an appointment based on conversation
  bookAppointment: async (conversationId, dateTime) => {
    return apiRequest('/book', 'POST', {
      conversation_id: conversationId,
      date_time: dateTime
    });
  },
  
  // Get conversation history for a candidate
  getConversationHistory: async (candidateId) => {
    return apiRequest(`/conversations/${candidateId}`, 'GET');
  }
};

export default voiceApi;