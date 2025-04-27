import React, { useState, useEffect, useRef } from 'react';
import speechService from '../services/speechServices';
import voiceApi from '../api/voiceApi';

// Conversation stages mirroring backend service
const CONVERSATION_STAGES = {
  GREETING: 'greeting',
  INTEREST: 'interest',
  NOTICE_PERIOD: 'notice_period',
  CTC: 'ctc',
  AVAILABILITY: 'availability',
  CONFIRMATION: 'confirmation',
  CLOSING: 'closing'
};

const VoiceTest = () => {
  // State variables
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [agentResponse, setAgentResponse] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [conversationLog, setConversationLog] = useState([]);
  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [currentStage, setCurrentStage] = useState(CONVERSATION_STAGES.GREETING);
  const [backendStatus, setBackendStatus] = useState({
    connected: true,
    message: ''
  });
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);
  const serviceInitialized = useRef(false);

  // Check if speech recognition is supported and initialize the service
  useEffect(() => {
    const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setSpeechRecognitionSupported(isSupported);
    
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    } else {
      // Initialize the speech service if supported
      try {
        speechService.setupSpeechRecognition();
        
        // Add this to check the service status
        const status = speechService.isReady();
        console.log("Speech service status:", status);
        
        serviceInitialized.current = !!status.recognition;
        
      } catch (err) {
        console.error("Failed to initialize speech recognition:", err);
        setError(`Failed to initialize speech recognition: ${err.message}`);
      }
    }
    // Check backend connectivity
    checkBackendConnection();

    // Cleanup on unmount
    return () => {
      if (isListening) {
        speechService.stopListening();
      }
    };
  }, []);
  
  // Function to check backend connection
   // Function to check backend connection
   const checkBackendConnection = async () => {
    try {
      // Try to ping the backend using the actual API endpoint if possible
      const response = await fetch('http://localhost:3000', { 
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // If the health endpoint doesn't exist, this will still work
      if (response.ok) {
        setBackendStatus({ connected: true, message: '' });
        console.log("Backend connection successful");
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Backend connection error:', error);
      setBackendStatus({ 
        connected: false, 
        message: 'Cannot connect to backend server. Please make sure it is running.' 
      });
    }
  };

// Handle starting a call with the voice agent
const handleStartCall = async () => {
  if (!candidateId || !jobId) {
    setError('Please enter valid Candidate ID and Job ID');
    return;
  }
  
  if (!backendStatus.connected) {
    setError('Cannot start call: Backend server is not available');
    return;
  }

  try {
    setIsProcessing(true);
    setError(null);
    
    // Reset conversation state
    setConversationLog([]);
    setTranscript('');
    setAgentResponse('');

    // Call the backend API to initiate a conversation
    const response = await voiceApi.initiateCall(parseInt(candidateId), parseInt(jobId));
    console.log("Call initiation response:", response);
    
    if (response && response.success) {
      setConversationId(response.conversation_id);
      
      // Update stage if provided in response, otherwise default to INTEREST
      if (response.stage) {
        setCurrentStage(response.stage);
      } else {
        setCurrentStage(CONVERSATION_STAGES.INTEREST);
      }
      
      // Add system message to log
      addToConversationLog('system', 'Call initiated successfully');
      
      // Get the greeting from the API response
      const greetingText = response.greeting;
      
      if (greetingText) {
        console.log("Using greeting:", greetingText);
        setAgentResponse(greetingText);
        addToConversationLog('agent', greetingText);
        
        // Speak the greeting
        try {
          speechService.speak(greetingText);
        } catch (err) {
          console.error("Error speaking greeting:", err);
        }
      } else {
        console.error("No greeting received from backend");
        setError("No greeting received from backend");
      }
      
    } else {
      throw new Error(response?.message || 'Failed to initiate call. No response from backend.');
    }
  } catch (error) {
    console.error('Error initiating call:', error);
    setError(`Failed to start call: ${error.message}`);
    addToConversationLog('system', `Error: ${error.message}`);
  } finally {
    setIsProcessing(false);
  }
};


  const handleStopListening = () => {
    if (isListening) {
      console.log("Stopping speech recognition...");
      setIsListening(false);
      try {
        speechService.stopListening();
      } catch (err) {
        console.error("Error stopping speech recognition:", err);
      }
    }
  };

// Handle the user's speech input by sending it to the backend
const handleSpeechInput = async (text) => {
  if (!conversationId) {
    addToConversationLog('system', 'Error: No active conversation');
    return;
  }
  
  if (!backendStatus.connected) {
    setError('Cannot process speech: Backend server is not available');
    return;
  }

  addToConversationLog('user', text);
  setIsProcessing(true);
  setError(null);

  try {
    // Send the transcribed speech to the backend for processing
    const response = await voiceApi.processSpeech(conversationId, text);
    console.log("Speech processing response:", JSON.stringify(response, null, 2));
    
    if (response && response.success) {
      // Extract response text and other details with additional debug info
      console.log("Response data:", response.data);
      const agentText = response.data?.response;
      
      if (agentText) {
        console.log("Agent response text:", agentText);
        setAgentResponse(agentText);
        
        // Add the response to the conversation log
        addToConversationLog('agent', agentText);
        
        // Speak the response
        try {
          speechService.speak(agentText);
        } catch (err) {
          console.error("Error speaking response:", err);
        }
      } else {
        console.error("Missing agent response text in API response");
        setError("No agent response received");
      }
      
      // Update the conversation stage if provided
      if (response.data?.stage) {
        console.log("Updating conversation stage to:", response.data.stage);
        setCurrentStage(response.data.stage);
      }
    } else {
      throw new Error(response?.message || 'Failed to process speech. No response from backend.');
    }
  } catch (error) {
    console.error('Error processing speech:', error);
    setError(`Error: ${error.message}`);
    addToConversationLog('system', `Error: ${error.message}`);
    
    // If the error is likely due to backend connectivity
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      setBackendStatus({
        connected: false,
        message: 'Lost connection to backend server'
      });
    }
  } finally {
    setIsProcessing(false);
  }
};

  // Add an entry to the conversation log
  const addToConversationLog = (speaker, text) => {
    setConversationLog(prev => [
      ...prev, 
      { speaker, text, timestamp: new Date().toLocaleTimeString() }
    ]);
  };

  // Function to end the current call
  const handleEndCall = () => {
    if (conversationId) {
      handleStopListening();
      try {
        speechService.speak("Call ended. Thank you for using the voice agent system.");
      } catch (err) {
        console.error("Error speaking end message:", err);
      }
      addToConversationLog('system', 'Call ended by user');
      setConversationId(null);
      setCurrentStage(CONVERSATION_STAGES.GREETING);
    }
  };

  // Function to check browser and system status
  const getSystemStatus = () => {
    return {
      browserSupport: speechRecognitionSupported,
      backendConnected: backendStatus.connected,
      hasActiveCall: conversationId !== null,
      currentStage: currentStage,
      serviceInitialized: serviceInitialized.current,
      isListening: isListening
    };
  };
// Add this function to check microphone permissions
const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // If we got here, permission was granted
      stream.getTracks().forEach(track => track.stop()); // Clean up
      return true;
    } catch (err) {
      console.error("Microphone permission error:", err);
      setError("Microphone access denied. Please allow microphone access in your browser settings.");
      return false;
    }
  };
  
  // Modify handleStartListening to check for permissions first
   // Implement the complete handleStartListening function
   const handleStartListening = async () => {
    if (!speechRecognitionSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }
    
    if (!conversationId) {
      setError('Cannot start listening: No active conversation');
      return;
    }
    
    // Check for microphone permissions
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      return;
    }
    
    // Force re-initialization of speech recognition for reliability
    try {
      setError(null); // Clear any previous errors
      
      // First, ensure any existing session is stopped
      if (isListening) {
        speechService.stopListening();
      }
      
      // Re-initialize the service
      speechService.setupSpeechRecognition();
      serviceInitialized.current = true;
      
      console.log("Starting new speech recognition session...");
      
      // Set the state before actually starting to show UI feedback immediately
      setIsListening(true);
      
      // Short timeout to ensure UI updates before starting recognition
      setTimeout(() => {
        const success = speechService.startListening(
          // On successful speech recognition
          (result) => {
            console.log("Speech recognized:", result);
            setTranscript(result);
            handleSpeechInput(result);
          },
          // On error in speech recognition
          (error) => {
            console.error('Speech recognition error:', error);
            setIsListening(false);
            setError(`Speech recognition error: ${error}`);
            addToConversationLog('system', `Speech recognition error: ${error}`);
          },
          // On end of speech recognition
          () => {
            console.log("Speech recognition ended");
            setIsListening(false);
          }
        );
        
        if (!success) {
          setIsListening(false);
          setError("Failed to start speech recognition");
          console.error("Failed to start speech recognition");
        } else {
          console.log("Speech recognition started successfully");
        }
      }, 100);
      
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setIsListening(false);
      setError(`Failed to start speech recognition: ${err.message}`);
    }
  };
  return (
    <div className="voice-test">
      <h2>Voice Agent Interview Scheduler</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {!backendStatus.connected && (
        <div className="backend-error">
          <h3>⚠️ Backend Connection Issue</h3>
          <p>{backendStatus.message || 'Cannot connect to the backend server.'}</p>
          <button onClick={checkBackendConnection}>Retry Connection</button>
        </div>
      )}
      
      <div className="setup-section">
        <div>
          <label>Candidate ID:</label>
          <input 
            type="text" 
            value={candidateId} 
            onChange={(e) => setCandidateId(e.target.value)}
            disabled={conversationId !== null || isProcessing}
            placeholder="Enter candidate ID"
          />
        </div>
        <div>
          <label>Job ID:</label>
          <input 
            type="text" 
            value={jobId} 
            onChange={(e) => setJobId(e.target.value)}
            disabled={conversationId !== null || isProcessing}
            placeholder="Enter job ID"
          />
        </div>
        {!conversationId ? (
          <button 
            className="btn-primary"
            onClick={handleStartCall}
            disabled={!candidateId || !jobId || isProcessing || !backendStatus.connected}
          >
            {isProcessing ? 'Starting Call...' : 'Start Interview Call'}
          </button>
        ) : (
          <button 
            className="btn-danger"
            onClick={handleEndCall}
            disabled={isProcessing}
          >
            End Call
          </button>
        )}
      </div>

      {conversationId && (
        <div className="conversation-status">
          <div>Current Stage: <span>{currentStage}</span></div>
          <div>Conversation ID: <span>{conversationId}</span></div>
        </div>
      )}

      <div className="speech-section">
        <div className="transcript">
          <h3>Your Speech {isListening && <span className="listening-indicator"></span>}</h3>
          <p className={isListening ? "active" : ""}>
            {transcript || (isListening ? 'Listening...' : '[Waiting for speech...]')}
          </p>
        </div>
        
        <div className="controls">
        <button 
  className={isListening ? "btn-danger" : "btn-primary"}
  onClick={(e) => {
    console.log("Speech button clicked, current state:", isListening);
    if (isListening) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  }}
  disabled={!conversationId || isProcessing || !speechRecognitionSupported || !backendStatus.connected}
>
  {isListening ? 'Stop Speaking' : 'Start Speaking'}
</button>
          <div className="status-indicators">
            {!speechRecognitionSupported && <span className="indicator error">Speech Recognition Not Supported</span>}
            {!backendStatus.connected && <span className="indicator error">Backend Disconnected</span>}
            {isProcessing && <span className="indicator processing">Processing...</span>}
          </div>
        </div>
        
        <div className="agent-response">
          <h3>Agent Response</h3>
          <p>{agentResponse || '[Waiting for response...]'}</p>
        </div>
      </div>

      <div className="conversation-log">
        <h3>Conversation History</h3>
        <div className="log-entries">
          {conversationLog.length === 0 ? (
            <div className="empty-log">Start a call to begin the conversation</div>
          ) : (
            conversationLog.map((entry, index) => (
              <div key={index} className={`log-entry ${entry.speaker}`}>
                <span className="timestamp">{entry.timestamp}</span>
                <span className="speaker">
                  {entry.speaker === 'agent' ? 'Agent' : 
                  entry.speaker === 'user' ? 'You' : 'System'}
                </span>
                <span className="message">{entry.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="debug-section">
        <details>
          <summary>Debug Information</summary>
          <pre>{JSON.stringify(getSystemStatus(), null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default VoiceTest;