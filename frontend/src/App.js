import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import API, { setAuthToken } from './api';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Collection from './pages/Collection';
import Lobby from './pages/Lobby';
import PlayGame from './pages/PlayGame';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      setAuthToken(stored);
      API.get('/users/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setAuthToken(null);
        });
    }
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    setAuthToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to={user ? '/lobby' : '/login'} />} />
          <Route path="/login" element={user ? <Navigate to="/lobby" /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={user ? <Navigate to="/lobby" /> : <Register onRegister={handleLogin} />} />
          <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
          <Route path="/collection" element={user ? <Collection /> : <Navigate to="/login" />} />
          <Route path="/lobby" element={user ? <Lobby user={user} /> : <Navigate to="/login" />} />
          <Route path="/game/:roomId" element={user ? <PlayGame user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
