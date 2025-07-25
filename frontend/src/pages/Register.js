import React, { useState } from 'react';
import API from '../api';

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await API.post('/auth/register', { username, email, password });
      onRegister(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd podczas rejestracji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-dark via-space-purple to-space-blue flex items-center justify-center p-4 relative overflow-hidden">
      {/* Tło kosmiczne z efektami */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-900/10 to-cyan-900/10"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full pulse-glow"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-cyan-400 rounded-full pulse-glow" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 right-1/2 w-1.5 h-1.5 bg-pink-400 rounded-full pulse-glow" style={{animationDelay: '3s'}}></div>
      </div>
      
      {/* Terminal rejestracyjny */}
      <div className="access-terminal max-w-md w-full p-8 relative z-10" style={{borderColor: 'var(--neon-purple)'}}>
        {/* Nagłówek terminala */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center pulse-glow">
              <span className="text-black font-bold text-2xl">👤</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-purple-400 font-mono mb-2 flicker-effect">
            USER REGISTRATION TERMINAL
          </h1>
          <div className="text-purple-300 text-sm font-mono">
            [PROTEUS NEBULE NEW USER PROTOCOL]
          </div>
          <div className="text-purple-300 text-xs font-mono mt-1">
            STATUS: AWAITING USER DATA
          </div>
        </div>

        {/* Komunikat o błędzie */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg">
            <div className="text-red-400 font-mono text-sm">
              [REGISTRATION ERROR] {error}
            </div>
          </div>
        )}

        {/* Formularz rejestracji */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-purple-400 text-sm font-mono mb-2">
              COMMANDER_NAME:
            </label>
            <input 
              type="text" 
              placeholder="Enter desired callsign..."
              className="terminal-input w-full font-mono text-sm"
              style={{
                borderColor: 'var(--neon-purple)',
                color: 'var(--neon-purple)'
              }}
              value={username} 
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-purple-400 text-sm font-mono mb-2">
              COMMUNICATION_CHANNEL:
            </label>
            <input 
              type="email" 
              placeholder="Enter secure communication address..."
              className="terminal-input w-full font-mono text-sm"
              style={{
                borderColor: 'var(--neon-purple)',
                color: 'var(--neon-purple)'
              }}
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-purple-400 text-sm font-mono mb-2">
              SECURITY_CIPHER:
            </label>
            <input 
              type="password" 
              placeholder="Create encryption key..."
              className="terminal-input w-full font-mono text-sm"
              style={{
                borderColor: 'var(--neon-purple)',
                color: 'var(--neon-purple)'
              }}
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={`scifi-button purple w-full py-3 text-lg font-bold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">🔄</span>
                PROCESSING REGISTRATION...
              </span>
            ) : (
              'INITIALIZE NEW COMMANDER'
            )}
          </button>
        </form>
        
        {/* Dodatkowe informacje */}
        <div className="mt-8 text-center">
          <div className="text-purple-400 text-xs font-mono mb-2">
            [REGISTRATION PROTOCOL]
          </div>
          <div className="text-purple-300 text-xs font-mono">
            By registering, you agree to serve the Galactic Alliance
          </div>
        </div>
        
        {/* Animowane linie kodu */}
        <div className="absolute bottom-4 right-4 text-purple-500 text-xs font-mono opacity-30">
          <div className="flicker-effect">
            &gt; user.create.init()
          </div>
          <div className="flicker-effect" style={{animationDelay: '0.7s'}}>
            &gt; profile.generate()
          </div>
          <div className="flicker-effect" style={{animationDelay: '1.4s'}}>
            &gt; fleet.assign.pending()
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
