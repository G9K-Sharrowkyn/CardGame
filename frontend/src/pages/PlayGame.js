import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../utils/socket';
import GameInterface from '../components/GameInterface';
import API from '../api';

const PlayGame = ({ user }) => {
  const { roomId } = useParams();
  const [deck, setDeck] = useState([]);
  const [opponent, setOpponent] = useState(null);

  useEffect(() => {
    socket.emit('joinRoom', { roomId, user: { id: user.id, username: user.username } });
    socket.on('playersUpdate', (list) => {
      const opp = list.find(u => u.id !== user.id);
      if (opp) setOpponent(opp);
    });
    socket.on('gameStart', ({ deck }) => {
      setDeck(deck);
    });

    API.post(`/game/room/${roomId}/join`);
    return () => {
      socket.off('playersUpdate');
      socket.off('gameStart');
    };
  }, [roomId]);

  const startGame = () => {
    socket.emit('startGame', { roomId });
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-gray-800 flex justify-between">
        <div>Pokój: {roomId}</div>
        <button className="bg-red-600 px-4 py-2 rounded" onClick={startGame}>Rozpocznij Grę</button>
      </div>
      <div className="flex-grow">
        {deck.length > 0 && <GameInterface user={user} roomId={roomId} initialDeck={deck} />}
      </div>
    </div>
  );
};

export default PlayGame;
