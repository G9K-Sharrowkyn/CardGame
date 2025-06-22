import React, { useState, useEffect } from 'react';
import socket from '../utils/socket';
import cardsSpecifics from '../mechanics/CardsSpecifics';
import GameMechanics, { Phases } from '../mechanics/GameMechanics';
import Card from './Card';
import '../assets/css/CardGame.css';

const GameInterface = ({ user, roomId, initialDeck }) => {
  const [deck, setDeck] = useState(initialDeck);
  const [hand, setHand] = useState([]);
  const [playerUnits, setPlayerUnits] = useState([]);
  const [playerCommands, setPlayerCommands] = useState([]);
  const [opponentUnits, setOpponentUnits] = useState([]);
  const [opponentCommands, setOpponentCommands] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [gameMechanics] = useState(new GameMechanics());
  const [currentPhase, setCurrentPhase] = useState(gameMechanics.getCurrentPhase());
  const [playerHP, setPlayerHP] = useState(20);
  const [opponentHP, setOpponentHP] = useState(20);
  const [commandPoints, setCommandPoints] = useState(0);
  const [hasPlayedCommandCard, setHasPlayedCommandCard] = useState(false);
  const [hasDrawnCard, setHasDrawnCard] = useState(false);
  const [shouldAnimateButton, setShouldAnimateButton] = useState(false);

  useEffect(() => {
    const initialHand = drawCards(deck, 7);
    setHand(initialHand.hand);
    setDeck(initialHand.deck);
    
    // Add some sample opponent cards for demo purposes
    if (deck.length > 0) {
      const sampleOpponentUnits = deck.slice(0, 2);
      const sampleOpponentCommands = deck.slice(2, 4);
      setOpponentUnits(sampleOpponentUnits);
      setOpponentCommands(sampleOpponentCommands);
    }
    
    socket.on('opponentMove', (move) => {
      // obsługa ruchu przeciwnika
    });
    return () => { socket.off('opponentMove'); };
  }, []);

  useEffect(() => {
    if (currentPhase === Phases.COMMAND) {
      setHasPlayedCommandCard(false);
      setHasDrawnCard(false);
      setCommandPoints(playerCommands.reduce((sum, c) => {
        const d = cardsSpecifics.find(x => x.name === c.name);
        return sum + (d.type.includes('Shipyard') ? 2 : 1);
      }, 0));
    }
  }, [currentPhase, playerCommands]);

  const drawCards = (deckArr, count) => {
    const newHand = [];
    let newDeck = [...deckArr];
    for (let i = 0; i < count && newDeck.length; i++) {
      const idx = Math.floor(Math.random() * newDeck.length);
      newHand.push(newDeck.splice(idx, 1)[0]);
    }
    return { hand: newHand, deck: newDeck };
  };

  const drawCard = () => {
    if (currentPhase !== Phases.COMMAND || hasDrawnCard || deck.length === 0) return;
    const { hand: newCards, deck: newDeck } = drawCards(deck, 1);
    setHand([...hand, ...newCards]);
    setDeck(newDeck);
    setHasDrawnCard(true);
  };

  const endPhase = () => {
    gameMechanics.endCurrentPhase();
    const next = gameMechanics.getCurrentPhase();
    setCurrentPhase(next);
    setShouldAnimateButton(false);
    socket.emit('playMove', { roomId, move: { phaseEnded: next, player: user.id } });
  };

  const selectCard = (card) => {
    if (selectedCard === card) setSelectedCard(null);
    else setSelectedCard(card);
  };

  const deploy = (zone) => {
    if (!selectedCard) return;
    const details = cardsSpecifics.find(c => c.name === selectedCard.name);
    if (gameMechanics.getCurrentPhase() === Phases.COMMAND && zone === 'command-zone') {
      if (hasPlayedCommandCard) return;
      setPlayerCommands([...playerCommands, selectedCard]);
      setCommandPoints(p => p + (details.type.includes('Shipyard') ? 2 : 1));
      setHand(hand.filter(c => c !== selectedCard));
      setSelectedCard(null);
      setHasPlayedCommandCard(true);
      setShouldAnimateButton(true);
      socket.emit('playMove', { roomId, move: { playedCommand: selectedCard, player: user.id } });
    } else if (gameMechanics.getCurrentPhase() === Phases.DEPLOYMENT && zone === 'unit-zone') {
      if (details.commandCost > commandPoints) return;
      setPlayerUnits([...playerUnits, selectedCard]);
      setCommandPoints(p => p - details.commandCost);
      setHand(hand.filter(c => c !== selectedCard));
      setSelectedCard(null);
      socket.emit('playMove', { roomId, move: { playedUnit: selectedCard, player: user.id } });
    }
  };



  return (
    <div className="h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* Top HUD - Opponent Info */}
      <div className="flex justify-between items-center px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-bold text-lg">{opponentHP} HP</span>
          </div>
          <div className="text-slate-400 text-sm">Opponent</div>
        </div>
        
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-xl mb-1">{currentPhase}</div>
          <div className="text-slate-400 text-sm">Current Phase</div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-slate-400 text-sm">Deck: {deck.length}</div>
          <button 
            className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 ${
              shouldAnimateButton 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black animate-pulse shadow-lg' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
            } shadow-lg hover:shadow-xl transform hover:scale-105`}
            onClick={endPhase}
          >
            {currentPhase === Phases.BATTLE ? 'End Turn' : 'End Phase'}
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col relative">
        {/* Opponent Zones */}
        <div className="flex-1 p-4 space-y-3">
          {/* Opponent Command Zone */}
          <div className="h-24 bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-xl border-2 border-red-700/50 shadow-inner relative">
            <div className="absolute top-2 left-4 text-red-400 font-bold text-sm">OPPONENT COMMAND ZONE</div>
            <div className="flex items-center justify-center h-full space-x-2 pt-6">
              {opponentCommands.map((card, idx) => (
                <Card key={idx} card={card} size="small" showStats />
              ))}
              {opponentCommands.length === 0 && (
                <div className="text-red-400/50 text-sm italic">No command cards</div>
              )}
            </div>
          </div>
          
          {/* Opponent Unit Zone */}
          <div className="flex-1 bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl border-2 border-red-600/50 shadow-inner relative min-h-32">
            <div className="absolute top-2 left-4 text-red-400 font-bold text-sm">OPPONENT UNIT ZONE</div>
            <div className="flex items-center justify-center h-full space-x-2 pt-8">
              {opponentUnits.map((card, idx) => (
                <Card key={idx} card={card} size="normal" showStats />
              ))}
              {opponentUnits.length === 0 && (
                <div className="text-red-400/50 text-lg italic">No units deployed</div>
              )}
            </div>
          </div>
        </div>

        {/* Center Divider */}
        <div className="h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent shadow-lg"></div>

        {/* Player Zones */}
        <div className="flex-1 p-4 space-y-3">
          {/* Player Unit Zone */}
          <div className="flex-1 bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-xl border-2 border-blue-600/50 shadow-inner relative min-h-32 cursor-pointer hover:border-blue-500/70 transition-colors" 
               onClick={() => deploy('unit-zone')}>
            <div className="absolute top-2 left-4 text-blue-400 font-bold text-sm">YOUR UNIT ZONE</div>
            <div className="flex items-center justify-center h-full space-x-2 pt-8">
              {playerUnits.map((card, idx) => (
                <Card 
                  key={idx} 
                  card={card} 
                  size="normal" 
                  showStats 
                  isSelected={selectedCard === card}
                  onClick={() => selectCard(card)}
                />
              ))}
              {playerUnits.length === 0 && (
                <div className="text-blue-400/50 text-lg italic">Deploy units here</div>
              )}
            </div>
          </div>
          
          {/* Player Command Zone */}
          <div className="h-24 bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-xl border-2 border-blue-700/50 shadow-inner relative cursor-pointer hover:border-blue-500/70 transition-colors"
               onClick={() => deploy('command-zone')}>
            <div className="absolute top-2 left-4 text-blue-400 font-bold text-sm">YOUR COMMAND ZONE</div>
            <div className="flex items-center justify-center h-full space-x-2 pt-6">
              {playerCommands.map((card, idx) => (
                <Card 
                  key={idx} 
                  card={card} 
                  size="small" 
                  showStats
                  isSelected={selectedCard === card}
                  onClick={() => selectCard(card)}
                />
              ))}
              {playerCommands.length === 0 && (
                <div className="text-blue-400/50 text-sm italic">Play command cards here</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD - Player Info & Hand */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-t border-slate-600 shadow-lg">
        {/* Player Stats */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-slate-600/50">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-400 font-bold text-lg">{playerHP} HP</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-blue-400 font-bold text-lg">{commandPoints} Mana</span>
            </div>
          </div>
          
          <div className="text-slate-400 font-bold">{user.username}</div>
          
          <button 
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
              currentPhase === Phases.COMMAND && !hasDrawnCard
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black animate-pulse shadow-lg' 
                : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-500 hover:to-teal-500'
            } shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={drawCard}
            disabled={currentPhase !== Phases.COMMAND || hasDrawnCard || deck.length === 0}
          >
            Draw Card ({deck.length})
          </button>
        </div>
        
        {/* Hand */}
        <div className="p-4">
          <div className="flex justify-center space-x-2 overflow-x-auto pb-2 hand-container">
            {hand.map((card, idx) => (
              <Card 
                key={idx} 
                card={card} 
                size="large" 
                showStats 
                isSelected={selectedCard === card}
                onClick={() => selectCard(card)}
              />
            ))}
            {hand.length === 0 && (
              <div className="text-slate-400 text-lg italic py-8">Your hand is empty</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
