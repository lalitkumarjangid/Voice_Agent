import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, { initSequelize } from './config/database.js';
import config from './config/config.js';

// Import routes
import jobRoutes from './routes/jobRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import voiceAgentRoutes from './routes/voiceAgentRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Update this to match your Vite frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/voice', voiceAgentRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to Voice Agent API');
});

// Database connection and server startup
const PORT = config.port;

const startServer = async () => {
  try {
    // Initialize database with auto-creation if needed
    const sequelizeInstance = await initSequelize();
    
    // Sync database models
    await sequelizeInstance.sync({ alter: true });
    console.log('Database synchronized successfully');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();