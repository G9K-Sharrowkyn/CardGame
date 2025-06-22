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
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded">
      <h2 className="text-2xl mb-4">Logowanie</h2>
      {error && (
        <div className="bg-red-600 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Email lub nazwa użytkownika"
          className="w-full p-2 rounded bg-gray-700"
          value={loginId}
          onChange={e => setLoginId(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Hasło" 
          className="w-full p-2 rounded bg-gray-700" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button 
          type="submit" 
          className="w-full bg-blue-600 py-2 rounded disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? 'Logowanie...' : 'Zaloguj'}
        </button>
      </form>
    </div>
  );
};

export default Login;
