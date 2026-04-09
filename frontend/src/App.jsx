import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Chatbot from './pages/Chatbot';
import Login from './pages/Login';
import { useState } from 'react';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    // Optionally hit backend logout, then scrub UI session
    try {
      if (localStorage.getItem('token')) {
        await fetch('/api/auth/logout', { 
          method: 'POST', 
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
        });
      }
    } catch (e) {
      console.error(e);
    }
    
    // Purge all secure tokens and caches
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('predictFormData');
    localStorage.removeItem('latestAssessment');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
            <Route path="/predict" element={isAuthenticated ? <Predict /> : <Navigate to="/login" replace />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />
            <Route path="/chatbot" element={isAuthenticated ? <Chatbot /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
