import React, { useState, useEffect } from 'react';
import socket from '../utils/socket';
import Card from './Card';
import '../assets/css/CardGame.css'; // Assuming this has the cool sci-fi styles

const GameInterface = ({ user, roomId }) => {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');
  const [selectedAttackerIds, setSelectedAttackerIds] = useState([]);
  const [selectedBlockerId, setSelectedBlockerId] = useState(null);
  const [defenseAssignments, setDefenseAssignments] = useState({}); // { attackerId: blockerId }

  useEffect(() => {
    socket.on('gameStateUpdate', (newState) => {
      if (gameState && gameState.phase !== newState.phase) {
        setSelectedAttackerIds([]);
        setSelectedBlockerId(null);
        setDefenseAssignments({});
      }
      setGameState(newState);
    });

    socket.on('gameError', (err) => {
      setError(err.message);
      setTimeout(() => setError(''), 4000);
    });
    
    socket.on('gameEnd', ({ winner }) => {
        alert(`Game Over! Winner is ${winner.username}`);
        window.location.href = '/lobby';
    });

    return () => {
      socket.off('gameStateUpdate');
      socket.off('gameError');
      socket.off('gameEnd');
    };
  }, [roomId, gameState]);

  if (!gameState) {
    return <div className="text-white text-center p-10">Waiting for game state...</div>;
  }

  const { players, board, life, mana, myHand, opponentHandSize, currentPlayerId, phase, manaPlayedThisTurn, currentAttackers } = gameState;
  const isMyTurn = currentPlayerId === user.id;
  const me = players.find(p => p.id === user.id) || { username: 'Player' };
  const opponent = players.find(p => p.id !== user.id) || { username: 'Opponent' };

  const myPlayerKey = players.findIndex(p => p.id === user.id) === 0 ? 'player1' : 'player2';
  const opponentPlayerKey = myPlayerKey === 'player1' ? 'player2' : 'player1';

  const handleAction = (action, payload = {}) => {
      socket.emit(action, { roomId, ...payload });
  };

  const renderPlayerBoard = (playerKey, isOpponent = false) => {
      const playerBoard = board[playerKey];
      const playerUnits = playerBoard.units.filter(u => !(currentAttackers && currentAttackers.some(a => a.unit.id === u.id)));

      return (
          <div className="flex-1 space-y-3">
              <div className="game-zone h-24 relative energy-border" style={{borderColor: isOpponent ? 'var(--neon-pink)' : 'var(--neon-cyan)'}}>
                  <div className="flex items-center justify-center h-full space-x-2 pt-6">
                      {playerBoard.mana.map((card, idx) => <Card key={card.id || idx} card={card} size="small" />)}
                  </div>
              </div>
              <div className="game-zone flex-1 relative energy-border min-h-32">
                  <div className="flex items-center justify-center h-full space-x-2 pt-8">
                      {playerUnits.map((card, idx) => (
                          <Card
                              key={card.id || idx}
                              card={card}
                              size="normal"
                              isTapped={card.isTapped}
                              isSelected={(!isOpponent && selectedAttackerIds.includes(card.id)) || (!isOpponent && selectedBlockerId === card.id)}
                              onClick={() => {
                                  if (!isOpponent && isMyTurn && phase === 'attack' && !card.isTapped) {
                                      setSelectedAttackerIds(prev => prev.includes(card.id) ? prev.filter(id => id !== card.id) : [...prev, card.id]);
                                  } else if (!isOpponent && !isMyTurn && phase === 'defend' && !card.isTapped) {
                                      setSelectedBlockerId(card.id);
                                  }
                              }}
                          />
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  const renderPhaseButton = () => {
    if (phase === 'defend' && !isMyTurn) {
        return (
            <button className="scifi-button green" onClick={() => handleAction('declareDefense', { assignments: defenseAssignments })}>
                CONFIRM DEFENSE
            </button>
        );
    }
    if (!isMyTurn) return <div className="text-yellow-400 font-mono">OPPONENT'S TURN</div>;
    
    switch(phase) {
        case 'draw': return <button className="scifi-button green" onClick={() => handleAction('drawCard')}>DRAW CARD</button>;
        case 'mana': return <button className="scifi-button blue" onClick={() => handleAction('passPhase')}>SKIP MANA</button>;
        case 'main': return <button className="scifi-button orange" onClick={() => handleAction('enterAttackPhase')}>ATTACK</button>;
        case 'attack':
            return (
                <div className="flex space-x-2">
                    <button className="scifi-button red" onClick={() => handleAction('declareAttack', { attackerIds: selectedAttackerIds })}>
                        CONFIRM ATTACK ({selectedAttackerIds.length})
                    </button>
                    <button className="scifi-button gray" onClick={() => handleAction('passPhase')}>SKIP ATTACK</button>
                </div>
            );
        default: return <button className="scifi-button gray" onClick={() => handleAction('endTurn')}>END TURN</button>;
    }
  };

  const renderAttackZone = () => {
    if (phase !== 'defend' || !currentAttackers) return null;

    return (
        <div className="h-32 my-2 flex items-center justify-center space-x-4 bg-red-900/30 border-y-2 border-red-500">
            {currentAttackers.map(({ unit }) => (
                <Card
                    key={unit.id}
                    card={unit}
                    size="normal"
                    isAttacking={true}
                    onClick={() => {
                        if (selectedBlockerId) {
                            setDefenseAssignments(prev => ({...prev, [unit.id]: [...(prev[unit.id] || []), selectedBlockerId]}));
                            setSelectedBlockerId(null);
                        }
                    }}
                />
            ))}
        </div>
    )
  }

  return (
    <div className="cosmic-game-board h-screen flex flex-col overflow-hidden relative">
      {error && <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-600 text-white p-2 rounded-b-lg z-50">{error}</div>}

      <div className="scifi-panel m-2 p-4 tech-corners">
          <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                  <div className="text-red-400 font-mono text-lg font-bold">{opponent.username}</div>
                  <div className="text-red-300 font-mono text-sm">HP: <span className="font-bold">{life[opponentPlayerKey]}</span></div>
                  <div className="text-gray-400 font-mono text-sm">HAND: {opponentHandSize}</div>
                  <div className="text-blue-400 font-mono text-sm">MANA: <span className="font-bold">{mana[opponentPlayerKey]}</span></div>
              </div>
              <div className="text-yellow-400 font-mono text-xl font-bold flicker-effect">{phase.toUpperCase()}</div>
              {isMyTurn && phase !== 'draw' && <button className="scifi-button gray" onClick={() => handleAction('endTurn')}>END TURN</button>}
          </div>
      </div>

      <div className="flex-1 flex flex-col relative p-2">
        {renderPlayerBoard(opponentPlayerKey, true)}
        {renderAttackZone()}
        {renderPlayerBoard(myPlayerKey, false)}
      </div>

      <div className="scifi-panel m-2 p-4 tech-corners">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-cyan-400/30">
            <div className="flex items-center space-x-4">
                <div className="text-cyan-400 font-mono text-lg font-bold">{me.username}</div>
                <div className="text-green-400 font-mono text-sm">HP: <span className="font-bold">{life[myPlayerKey]}</span></div>
                <div className="text-blue-400 font-mono text-sm">MANA: <span className="font-bold">{mana[myPlayerKey]}</span></div>
            </div>
            <div className="flex items-center space-x-4">{renderPhaseButton()}</div>
        </div>
        <div className="flex justify-center space-x-3 overflow-x-auto pb-2 hand-container">
            {myHand.map((card, idx) => (
                <Card
                    key={card.id || idx}
                    card={card}
                    size="large"
                    onClick={() => {
                        if (isMyTurn && phase === 'mana' && !manaPlayedThisTurn) handleAction('playCardAsMana', { cardId: card.id });
                        else if (isMyTurn && phase === 'main' && mana[myPlayerKey] >= card.cost) handleAction('playUnitCard', { cardId: card.id });
                    }}
                    isPlayable={isMyTurn && ((phase === 'mana' && !manaPlayedThisTurn) || (phase === 'main' && mana[myPlayerKey] >= card.cost))}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
