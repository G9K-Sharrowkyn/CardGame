import React, { useState } from 'react';
import API from '../api';

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await API.post('/auth/register', { username, email, password });
    onRegister(res.data);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded">
      <h2 className="text-2xl mb-4">Rejestracja</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nazwa użytkownika" className="w-full p-2 rounded bg-gray-700" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="email" placeholder="Email" className="w-full p-2 rounded bg-gray-700" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Hasło" className="w-full p-2 rounded bg-gray-700" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-green-600 py-2 rounded">Zarejestruj</button>
      </form>
    </div>
  );
};

export default Register;
