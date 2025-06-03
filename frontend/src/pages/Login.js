import React, { useState } from 'react';
import API from '../api';

const Login = ({ onLogin }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = loginId.includes('@') ? { email: loginId } : { username: loginId };
    const res = await API.post('/auth/login', { ...payload, password });
    onLogin(res.data);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded">
      <h2 className="text-2xl mb-4">Logowanie</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Email lub nazwa użytkownika"
          className="w-full p-2 rounded bg-gray-700"
          value={loginId}
          onChange={e => setLoginId(e.target.value)}
        />
        <input type="password" placeholder="Hasło" className="w-full p-2 rounded bg-gray-700" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-blue-600 py-2 rounded">Zaloguj</button>
      </form>
    </div>
  );
};

export default Login;
