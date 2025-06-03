class Bot {
  initialize(gameState) {
    this.gameState = gameState;
  }

  playTurn(gameState, socket) {
    this.gameState = gameState;
    if (gameState.currentPhase === Phases.COMMAND) this.commandPhase(socket);
    else if (gameState.currentPhase === Phases.DEPLOYMENT) this.deploymentPhase(socket);
    else if (gameState.currentPhase === Phases.BATTLE) this.battlePhase(socket);
    else socket.emit('updateGameState', { ...gameState, currentPhase: Phases.COMMAND, currentPlayer: gameState.playerA.id });
  }

  commandPhase(socket) {
    const newDeck = [...this.gameState.playerB.deck];
    const card = newDeck.shift();
    const newState = { ...this.gameState, playerB: { ...this.gameState.playerB, deck: newDeck, hand: [...this.gameState.playerB.hand, card] } };
    if (newState.playerB.hand.length > 0) {
      const manaCard = newState.playerB.hand[0];
      newState.playerB.mana += manaCard.type.includes('Shipyard') ? 2 : 1;
      newState.playerB.manaZone.push(manaCard);
      newState.playerB.hand.shift();
    }
    newState.currentPhase = Phases.DEPLOYMENT;
    socket.emit('updateGameState', newState);
  }

  deploymentPhase(socket) {
    const newState = { ...this.gameState };
    while (newState.playerB.mana > 0 && newState.playerB.hand.length > 0) {
      const card = newState.playerB.hand[0];
      if (card.commandCost <= newState.playerB.mana) {
        newState.playerB.mana -= card.commandCost;
        newState.playerB.battlefield.push(card);
        newState.playerB.hand.shift();
      } else break;
    }
    newState.currentPhase = Phases.BATTLE;
    socket.emit('updateGameState', newState);
  }

  battlePhase(socket) {
    const newState = { ...this.gameState, currentPhase: Phases.END_TURN };
    socket.emit('updateGameState', newState);
  }
}

export default Bot;
