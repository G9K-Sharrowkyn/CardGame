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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Card Game
          </h1>
          <p className="text-slate-400 text-lg">Welcome back, <span className="text-blue-400 font-semibold">{user.username}</span></p>
        </div>

        {/* Main Lobby Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-600 shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Game Lobby</h2>
          
          <div className="space-y-6">
            {/* Create Room */}
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-600/50 p-6">
              <h3 className="text-xl font-bold text-green-400 mb-3">Create New Game</h3>
              <p className="text-slate-300 mb-4">Start a new game room and invite friends to join</p>
              <button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-green-500 hover:to-emerald-500 transform hover:scale-105 transition-all duration-300"
                onClick={create}
              >
                Create Room
              </button>
            </div>

            {/* Join Room */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-600/50 p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-3">Join Existing Game</h3>
              <p className="text-slate-300 mb-4">Enter a room ID to join an existing game</p>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  placeholder="Enter Room ID" 
                  className="flex-1 p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300" 
                  value={roomId} 
                  onChange={e => setRoomId(e.target.value)}
                />
                <button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:from-blue-500 hover:to-purple-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={join}
                  disabled={!roomId.trim()}
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Player Stats */}
          <div className="mt-8 pt-6 border-t border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">{user.points || 0}</div>
                <div className="text-slate-400 text-sm">Points</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{user.collection?.length || 0}</div>
                <div className="text-slate-400 text-sm">Cards Owned</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">0</div>
                <div className="text-slate-400 text-sm">Games Played</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 text-center">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600">
            <h3 className="text-lg font-bold text-white mb-3">Quick Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
              <div>💡 Create a room to play with friends</div>
              <div>🎮 Join existing rooms with room ID</div>
              <div>⚡ Games support real-time multiplayer</div>
              <div>🏆 Earn points by winning matches</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
