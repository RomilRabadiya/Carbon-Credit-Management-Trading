import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // Simple state-based routing suitable for a student project
  return (
    <div className="App">
      {currentUser ? (
        <Dashboard user={currentUser} onLogout={() => setCurrentUser(null)} />
      ) : (
        <LoginPage onLoginSuccess={setCurrentUser} />
      )}
    </div>
  );
}

export default App;
