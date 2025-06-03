import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => (
  <nav className="bg-gray-800 p-4 flex justify-between items-center">
    <div>
      <Link to="/" className="text-white font-bold">Gra Karciana</Link>
    </div>
    <div className="space-x-4">
      {user ? (
        <>
          <Link to="/collection" className="text-gray-300 hover:text-white">Kolekcja</Link>
          <Link to="/profile" className="text-gray-300 hover:text-white">Profil</Link>
          <Link to="/lobby" className="text-gray-300 hover:text-white">Lobby</Link>
          <button onClick={onLogout} className="text-gray-300 hover:text-white">Wyloguj</button>
        </>
      ) : (
        <>
          <Link to="/login" className="text-gray-300 hover:text-white">Zaloguj</Link>
          <Link to="/register" className="text-gray-300 hover:text-white">Zarejestruj</Link>
        </>
      )}
    </div>
  </nav>
);

export default Navbar;
