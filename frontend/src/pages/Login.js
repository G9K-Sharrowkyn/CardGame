import React, { useState } from 'react';
import API from '../api';

const Login = ({ onLogin }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const payload = loginId.includes('@') ? { email: loginId } : { username: loginId };
      const res = await API.post('/auth/login', { ...payload, password });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd podczas logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-dark via-space-blue to-space-purple flex items-center justify-center p-4 relative overflow-hidden">
      {/* Tło kosmiczne z efektami */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-900/10 to-purple-900/10"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full pulse-glow"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-pink-400 rounded-full pulse-glow" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-green-400 rounded-full pulse-glow" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Terminal dostępowy */}
      <div className="access-terminal max-w-md w-full p-8 relative z-10">
        {/* Nagłówek terminala */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center pulse-glow">
              <span className="text-black font-bold text-2xl">🔐</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-green-400 font-mono mb-2 flicker-effect">
            SYSTEM ACCESS TERMINAL
          </h1>
          <div className="text-green-300 text-sm font-mono">
            [PROTEUS NEBULE SECURITY PROTOCOL]
          </div>
          <div className="text-green-300 text-xs font-mono mt-1">
            STATUS: AWAITING CREDENTIALS
          </div>
        </div>

        {/* Komunikat o błędzie */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg">
            <div className="text-red-400 font-mono text-sm">
              [ERROR] {error}
            </div>
          </div>
        )}

        {/* Formularz logowania */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">
              USER_ID / EMAIL_ADDRESS:
            </label>
            <input
              type="text"
              placeholder="Enter identification..."
              className="terminal-input w-full font-mono text-sm"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-green-400 text-sm font-mono mb-2">
              ACCESS_CODE:
            </label>
            <input 
              type="password" 
              placeholder="Enter security code..."
              className="terminal-input w-full font-mono text-sm"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={`scifi-button green w-full py-3 text-lg font-bold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⚡</span>
                AUTHENTICATING...
              </span>
            ) : (
              'INITIATE ACCESS'
            )}
          </button>
        </form>
        
        {/* Dodatkowe informacje */}
        <div className="mt-8 text-center">
          <div className="text-green-400 text-xs font-mono mb-2">
            [SECURITY NOTICE]
          </div>
          <div className="text-green-300 text-xs font-mono">
            Unauthorized access is prohibited by Galactic Law 2387-B
          </div>
        </div>
        
        {/* Animowane linie kodu */}
        <div className="absolute bottom-4 left-4 text-green-500 text-xs font-mono opacity-30">
          <div className="flicker-effect">
            &gt; system.auth.validate()
          </div>
          <div className="flicker-effect" style={{animationDelay: '0.5s'}}>
            &gt; crypto.hash.verify()
          </div>
          <div className="flicker-effect" style={{animationDelay: '1s'}}>
            &gt; access.grant.pending()
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
