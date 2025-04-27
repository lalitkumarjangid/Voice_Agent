/**
 * Enhanced Speech Service for Voice Agent
 * Handles both speech recognition (input) and synthesis (output)
 */
class SpeechService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.initialized = false;
    this.isSpeaking = false;
    this.speechQueue = [];
    
    // Initialize speech synthesis voices
    if (this.synthesis) {
      // Force load voices
      this.loadVoices();
      
      // Chrome requires waiting for voiceschanged event
      this.synthesis.addEventListener('voiceschanged', () => {
        this.loadVoices();
      });
    }
  }
  
  // Load available voices and select a preferred one
  loadVoices() {
    try {
      this.voices = this.synthesis.getVoices();
      console.log(`Loaded ${this.voices.length} voices for speech synthesis`);
      
      // Debug: log available voices
      if (this.voices.length > 0) {
        console.log("Available voices:", this.voices.map(v => `${v.name} (${v.lang})`));
      }
    } catch (err) {
      console.error("Error loading voices:", err);
    }
  }
  
  // Find a suitable voice
  findVoice() {
    if (!this.voices || this.voices.length === 0) {
      this.voices = this.synthesis.getVoices();
    }
    
    // First priority: English female voice
    let voice = this.voices.find(v => 
      (v.name.includes('Female') || v.name.includes('female')) && 
      (v.lang.startsWith('en-'))
    );
    
    // Second priority: Any English voice
    if (!voice) {
      voice = this.voices.find(v => v.lang.startsWith('en-'));
    }
    
    // Fallback: any voice
    if (!voice && this.voices.length > 0) {
      voice = this.voices[0];
    }
    
    if (voice) {
      console.log(`Selected voice: ${voice.name} (${voice.lang})`);
    } else {
      console.warn("No suitable voice found for speech synthesis");
    }
    
    return voice;
  }
  
  /**
   * Set up the speech recognition service
   */
  setupSpeechRecognition() {
    // Clean up any existing instance
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (err) {
        console.warn("Error cleaning up previous recognition instance:", err);
      }
      this.recognition = null;
    }
    
    // Create a new instance
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      try {
        this.recognition = new SpeechRecognition();
        
        // Configure recognition parameters
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        console.log("Speech recognition initialized successfully");
      } catch (err) {
        console.error("Error initializing speech recognition:", err);
      }
    } else {
      console.error("Speech recognition not supported in this browser");
    }
  }

  /**
   * Start listening for speech input
   * @param {Function} onResult - Callback when speech is recognized
   * @param {Function} onError - Callback when an error occurs
   * @param {Function} onEnd - Callback when recognition session ends
   * @returns {Boolean} Whether listening started successfully
   */
  startListening(onResult, onError, onEnd) {
    if (!this.recognition) {
      console.error("Speech recognition not initialized");
      if (onError) onError("Speech recognition not initialized");
      return false;
    }
    
    try {
      // Set up event handlers
      this.recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        console.log(`Speech recognized: "${text}"`);
        this.isListening = false;
        if (onResult) onResult(text);
      };
      
      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        this.isListening = false;
        if (onError) onError(event.error);
      };
      
      this.recognition.onend = () => {
        console.log("Speech recognition ended");
        this.isListening = false;
        if (onEnd) onEnd();
      };
      
      // Start recognition
      this.recognition.start();
      this.isListening = true;
      console.log("Speech recognition started");
      return true;
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      this.isListening = false;
      if (onError) onError(err.message);
      return false;
    }
  }
  
  /**
   * Stop listening for speech input
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        console.log("Speech recognition stopped");
      } catch (err) {
        console.error("Error stopping speech recognition:", err);
      }
      this.isListening = false;
    }
  }
  
  /**
   * Speak the provided text
   * @param {String} text - Text to speak
   * @param {Function} onEnd - Callback when speech completes
   */
  speak(text, onEnd) {
    if (!this.synthesis) {
      console.error("Speech synthesis not supported in this browser");
      if (onEnd) onEnd();
      return;
    }

    if (!text || text.trim() === '') {
      console.warn("Empty text provided to speech synthesis");
      if (onEnd) onEnd();
      return;
    }

    console.log(`Speaking: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

    // Cancel any ongoing speech
    this.synthesis.cancel();
    
    try {
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice (try to find a good one)
      const voice = this.findVoice();
      if (voice) {
        utterance.voice = voice;
      }
      
      // Set speech parameters
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Add event handlers
      utterance.onstart = () => {
        console.log("Speech started");
        this.isSpeaking = true;
      };
      
      utterance.onend = () => {
        console.log("Speech ended");
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      
      // Speak the text
      this.synthesis.speak(utterance);
      
      // Chrome bug workaround: sometimes speech synthesis doesn't start
      if (!this.synthesis.speaking) {
        console.warn("Speech synthesis didn't start automatically. Trying again...");
        setTimeout(() => {
          this.synthesis.speak(utterance);
        }, 50);
      }
      
    } catch (err) {
      console.error("Error with speech synthesis:", err);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }
  
  /**
   * Check if speech synthesis is speaking
   */
  isSpeakingNow() {
    return this.synthesis ? this.synthesis.speaking : false;
  }
  
  /**
   * Check if the service is ready
   */
  isReady() {
    return {
      recognition: !!this.recognition,
      synthesis: !!this.synthesis,
      voices: this.voices ? this.voices.length : 0,
      speaking: this.isSpeakingNow(),
      listening: this.isListening
    };
  }
}

// Export a singleton instance
const speechService = new SpeechService();
export default speechService;