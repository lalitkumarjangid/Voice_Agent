// config/config.js
import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  companyName: process.env.COMPANY_NAME || 'Vepio',
  voskModelPath: process.env.VOSK_MODEL_PATH || './models/vosk-model',
  ttsMozillaApiKey: process.env.TTS_MOZILLA_API_KEY
};