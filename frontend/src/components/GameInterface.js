import React, { useState, useEffect } from 'react';
import socket from '../utils/socket';
import cardsSpecifics from '../mechanics/CardsSpecifics';
import GameMechanics, { Phases } from '../mechanics/GameMechanics';
import '../assets/css/CardGame.css';

const GameInterface = ({ user, roomId, initialDeck }) => {
  const [deck, setDeck] = useState(initialDeck);
  const [hand, setHand] = useState([]);
  const [playerUnits, setPlayerUnits] = useState([]);
  const [playerCommands, setPlayerCommands] = useState([]);
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
    <div className="flex flex-col h-full">
      <div className="flex justify-between p-4 bg-gray-800">
        <div>HP: {playerHP}</div>
        <div>Faza: {currentPhase}</div>
        <div>Mana: {commandPoints}</div>
        <div>HP Przeciwnika: {opponentHP}</div>
        <button className={`bg-blue-600 px-4 py-2 rounded ${shouldAnimateButton ? 'animate-golden-line' : ''}`} onClick={endPhase}>
          {currentPhase === Phases.BATTLE ? 'Zakończ Turę' : 'Koniec Fazy'}
        </button>
      </div>
      <div className="flex-grow flex flex-col game-board">
        <div className="flex flex-1 space-x-2 p-4">
          <div className="w-1/2 zone">Strefa Przeciwnika (jednostki)</div>
          <div className="w-1/2 zone">Strefa Przeciwnika (mana)</div>
        </div>
        <div className="flex-grow flex flex-col justify-end">
          <div className="flex space-x-2 p-4">
            <div className="flex-1 zone grid grid-cols-5 gap-1 cursor-pointer" onClick={() => deploy('unit-zone')}>
              {playerUnits.map((card, idx) => (
                <img
                  key={idx}
                  src={card.imageUrl}
                  alt={card.name}
                  className={`w-16 sm:w-20 md:w-24 m-1 rounded shadow-lg transition-transform duration-200 ${selectedCard === card ? 'ring-2 ring-yellow-400 transform scale-125 z-10' : 'hover:scale-105'}`}
                  onClick={(e) => { e.stopPropagation(); selectCard(card); }}
                />
              ))}
            </div>
            <div className="flex-1 zone grid grid-cols-5 gap-1 cursor-pointer" onClick={() => deploy('command-zone')}>
              {playerCommands.map((card, idx) => (
                <img
                  key={idx}
                  src={card.imageUrl}
                  alt={card.name}
                  className={`w-16 sm:w-20 md:w-24 m-1 rounded shadow-lg transition-transform duration-200 ${selectedCard === card ? 'ring-2 ring-yellow-400 transform scale-125 z-10' : 'hover:scale-105'}`}
                  onClick={(e) => { e.stopPropagation(); selectCard(card); }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex space-x-2 p-4 items-center">
          <button className={`bg-blue-600 px-4 py-2 rounded ${currentPhase === Phases.COMMAND && !hasDrawnCard ? 'animate-golden-line' : ''}`} onClick={drawCard}>
            Dobierz Karty ({deck.length})
          </button>
          <div className="flex flex-wrap justify-center">
            {hand.map((card, idx) => (
              <img
                key={idx}
                src={card.imageUrl}
                alt={card.name}
                className={`w-16 sm:w-20 md:w-24 m-1 bg-white rounded shadow-lg cursor-pointer transition-transform duration-200 ${selectedCard === card ? 'ring-2 ring-blue-500 transform scale-125 z-10' : 'hover:scale-105'}`}
                onClick={() => selectCard(card)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
