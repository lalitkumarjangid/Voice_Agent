import React, { useState } from 'react';
import VoiceTest from './components/VoiceTest';
import Dashboard from './components/Dashboard';
import ManagementPage from './components/ManagementPage';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshData, setRefreshData] = useState(0);

  const handleDataUpdate = () => {
    // This will trigger a refresh of dashboard data when appointments/jobs/candidates are updated
    setRefreshData(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key={refreshData} />;
      case 'voice':
        return <VoiceTest />;
      case 'manage':
        return <ManagementPage onDataUpdate={handleDataUpdate} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Voice Agent Interview System</h1>
        <nav>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'voice' ? 'active' : ''} 
            onClick={() => setActiveTab('voice')}
          >
            Voice Test
          </button>
          <button 
            className={activeTab === 'manage' ? 'active' : ''} 
            onClick={() => setActiveTab('manage')}
          >
            Manage Data
          </button>
        </nav>
      </header>
      
      <main>
        {renderContent()}
      </main>
      
      <footer>
        <p>© 2025 Voice Agent Interview System</p>
      </footer>
    </div>
  );
}

export default App;