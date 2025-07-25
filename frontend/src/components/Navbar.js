import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => (
  <nav className="space-nav p-0 relative overflow-hidden">
    {/* Efekt danych w tle */}
    <div className="data-stream"></div>
    
    {/* Główny panel nawigacyjny */}
    <div className="scifi-panel flex justify-between items-center p-4 m-2 tech-corners">
      {/* Logo/Tytuł */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full pulse-glow flex items-center justify-center">
          <span className="text-white font-bold text-xl">⚡</span>
        </div>
        <Link to="/" className="space-nav-item text-2xl font-bold text-white hover:text-cyan-400 transition-all duration-300">
          <span className="flicker-effect">PROTEUS NEBULE</span>
        </Link>
      </div>
      
      {/* Menu nawigacyjne */}
      <div className="flex items-center space-x-2">
        {user ? (
          <>
            {/* Panel użytkownika */}
            <div className="modular-frame mr-4 px-3 py-1">
              <div className="text-cyan-400 text-sm font-mono">
                COMMANDER: <span className="text-white font-bold">{user.username}</span>
              </div>
              <div className="text-green-400 text-xs font-mono">
                STATUS: ONLINE
              </div>
            </div>
            
            {/* Przyciski nawigacyjne */}
            <Link to="/shop" className="scifi-button orange text-sm px-3 py-2">
              SKLEP
            </Link>
            <Link to="/collection" className="scifi-button purple text-sm px-3 py-2">
              KOLEKCJA
            </Link>
            <Link to="/decks" className="scifi-button green text-sm px-3 py-2">
              TALIE
            </Link>
            <Link to="/crafting" className="scifi-button pink text-sm px-3 py-2">
              CRAFTING
            </Link>
            <Link to="/lobby" className="scifi-button text-sm px-3 py-2">
              LOBBY
            </Link>
            <Link to="/profile" className="scifi-button text-sm px-3 py-2">
              PROFIL
            </Link>
            
            {/* Przycisk wyloguj */}
            <button 
              onClick={onLogout} 
              className="scifi-button text-sm px-3 py-2 ml-2"
              style={{
                borderColor: '#ff0040',
                color: '#ff0040'
              }}
            >
              WYLOGUJ
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="scifi-button green text-sm px-4 py-2">
              DOSTĘP
            </Link>
            <Link to="/register" className="scifi-button text-sm px-4 py-2">
              REJESTRACJA
            </Link>
          </>
        )}
      </div>
    </div>
    
    {/* Linia skanująca */}
    <div className="scan-lines"></div>
  </nav>
);

export default Navbar;
