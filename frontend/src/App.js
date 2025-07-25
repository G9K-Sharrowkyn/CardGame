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
import ImageTest from './components/ImageTest';
import Shop from './pages/Shop';
import Decks from './pages/Decks';
import Crafting from './pages/Crafting';
import StarBackground from './Background/StarBackground';

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
      {/* Kosmiczne tło dla całej aplikacji */}
      <StarBackground />
      
      <div className="relative z-10">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to={user ? '/lobby' : '/login'} />} />
            <Route path="/login" element={user ? <Navigate to="/lobby" /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={user ? <Navigate to="/lobby" /> : <Register onRegister={handleLogin} />} />
            <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
            <Route path="/collection" element={user ? <Collection /> : <Navigate to="/login" />} />
            <Route path="/lobby" element={user ? <Lobby user={user} /> : <Navigate to="/login" />} />
            <Route path="/test-images" element={<ImageTest />} />
            <Route path="/game/:roomId" element={user ? <PlayGame user={user} /> : <Navigate to="/login" />} />
            <Route path="/shop" element={user ? <Shop user={user} /> : <Navigate to="/login" />} />
            <Route path="/decks" element={user ? <Decks /> : <Navigate to="/login" />} />
            <Route path="/crafting" element={user ? <Crafting /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
