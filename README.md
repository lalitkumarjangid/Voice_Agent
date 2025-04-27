# Voice Agent Interview System

A full-stack application for automating interview scheduling through voice conversations using speech recognition and natural language processing.

## Project Structure

The project is divided into two main parts:

- **Frontend**: React application built with Vite
- **Backend**: Node.js/Express API server with MySQL database

## Features

- 🎤 **Voice Conversations**: Browser-based speech recognition and text-to-speech
- 📅 **Automated Scheduling**: Book candidate interviews through voice interactions
- 📊 **Dashboard**: View jobs, candidates, and appointments at a glance
- 📝 **Data Management**: Create and edit jobs, candidates, and appointments
- 🧠 **Entity Extraction**: Automatically extract date/time, notice period, and CTC information from conversations

## Technology Stack

### Frontend
- React (with React hooks)
- Vite build tool
- Web Speech API for browser-based speech recognition and synthesis
- RESTful API integration
- React DatePicker for scheduling

### Backend
- Node.js & Express
- Sequelize ORM
- MySQL database
- Natural language processing with chrono-node and natural
- Express Validator for input validation

## Getting Started

### Prerequisites

- Node.js (v14+)
- MySQL database

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/lalitkumarjangid/voice-agent.git
cd voice-agent
```

2. **Setup the backend**

```bash
cd voiceagent-backend
npm install
```

3. **Configure environment variables**

Create a `.env` file in the backend directory:

```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_NAME=voice_agent
DB_USER=root
DB_PASSWORD=Lalit@12345
COMPANY_NAME=Voice Agent
VOSK_MODEL_PATH=./models/vosk-model
```

4. **Setup the frontend**

```bash
cd ../voiceagent-frontend
npm install
```

5. **Start the application**

- Start the backend:
```bash
cd voiceagent-backend
npm run dev
```

- In a new terminal, start the frontend:
```bash
cd voiceagent-frontend
npm run dev
```

6. **Access the application**

Open your browser and go to: http://localhost:5173

## Usage

1. **Data Management**: First create jobs and candidates in the "Manage Data" tab.
2. **Voice Test**: Use the "Voice Test" tab to initiate an interview. Enter a candidate ID and job ID.
3. **Dashboard**: View all jobs, candidates and appointments in the dashboard.

## Browser Compatibility

For best results, use Chrome, Edge, or Safari, which have good support for the Web Speech API.

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgements

- Speech recognition powered by Web Speech API
- Date/time parsing with chrono-node
- NLP capabilities with natural.js
