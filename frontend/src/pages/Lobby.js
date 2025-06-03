import React, { useState, useEffect } from 'react';
import API from '../api';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

let socket;

const Lobby = ({ user }) => {
  const [roomId, setRoomId] = useState('');
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket = io('http://localhost:5000');
    socket.on('playersUpdate', (list) => {
      setPlayers(list);
    });
    return () => { socket.disconnect(); };
  }, []);

  const create = async () => {
    const res = await API.post('/game/room');
    const id = res.data.roomId;
    socket.emit('joinRoom', { roomId: id, user: { id: user.id, username: user.username } });
    navigate(`/game/${id}`);
  };

  const join = async () => {
    if (!roomId) return;
    await API.post(`/game/room/${roomId}/join`);
    socket.emit('joinRoom', { roomId, user: { id: user.id, username: user.username } });
    navigate(`/game/${roomId}`);
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded">
      <h2 className="text-2xl mb-4">Lobby</h2>
      <div className="space-y-4">
        <button className="w-full bg-green-600 py-2 rounded" onClick={create}>Utwórz Pokój</button>
        <div className="flex space-x-2">
          <input type="text" placeholder="ID pokoju" className="flex-1 p-2 rounded bg-gray-700" value={roomId} onChange={e => setRoomId(e.target.value)} />
          <button className="bg-blue-600 px-4 rounded" onClick={join}>Dołącz</button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
