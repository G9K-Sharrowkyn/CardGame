import { users, games, cards } from './database.js';

const createGame = (playerId, vsBot = false) => {
  const user = users.find(u => u.id === playerId);
  if (!user) return null;
  const playerDeck = [...user.collection].sort(() => 0.5 - Math.random()).slice(0, 40);
  const game = {
    id: Date.now().toString(),
    players: {
      [playerId]: {
        life: 20,
        manaPool: 0,
        manaAvailable: 0,
        hand: playerDeck.slice(0, 7),
        deck: playerDeck.slice(7),
        battlefield: [],
        tapped: [],
        isTurn: true
      }
    },
    currentPhase: 'draw',
    turn: 1,
    vsBot
  };
  if (vsBot) {
    game.players['bot'] = {
      life: 20,
      manaPool: 0,
      manaAvailable: 0,
      hand: [...cards].sort(() => 0.5 - Math.random()).slice(0, 7),
      deck: [...cards].sort(() => 0.5 - Math.random()).slice(0, 33),
      battlefield: [],
      tapped: [],
      isTurn: false
    };
  }
  games[game.id] = game;
  return game;
};

const drawCard = (gameId, playerId) => {
  const game = games[gameId];
  if (!game || game.currentPhase !== 'draw' || !game.players[playerId].isTurn) return false;
  const player = game.players[playerId];
  if (player.deck.length === 0) {
    player.life -= 1;
    return true;
  }
  player.hand.push(player.deck.shift());
  return true;
};

const playMana = (gameId, playerId, cardIndex) => {
  const game = games[gameId];
  if (!game || game.currentPhase !== 'mana' || !game.players[playerId].isTurn) return false;
  const player = game.players[playerId];
  if (cardIndex >= player.hand.length) return false;
  const card = player.hand[cardIndex];
  player.manaPool += card.mana;
  player.manaAvailable += card.mana;
  player.hand.splice(cardIndex, 1);
  return true;
};

const playCard = (gameId, playerId, cardIndex) => {
  const game = games[gameId];
  if (!game || game.currentPhase !== 'cast' || !game.players[playerId].isTurn) return false;
  const player = game.players[playerId];
  if (cardIndex >= player.hand.length) return false;
  const card = player.hand[cardIndex];
  if (card.cost > player.manaAvailable) return false;
  player.manaAvailable -= card.cost;
  player.battlefield.push(card);
  player.hand.splice(cardIndex, 1);
  return true;
};

const attack = (gameId, playerId, attackerIndex, blockerIndices) => {
  const game = games[gameId];
  if (!game || game.currentPhase !== 'attack' || !game.players[playerId].isTurn) return false;
  const attackerPlayer = game.players[playerId];
  const defenderId = Object.keys(game.players).find(id => id !== playerId);
  const defenderPlayer = game.players[defenderId];
  const attacker = attackerPlayer.battlefield[attackerIndex];
  if (!attacker || attackerPlayer.tapped.includes(attackerIndex)) return false;

  if (blockerIndices.length === 0) {
    defenderPlayer.life -= attacker.power;
  } else {
    let totalBlockerDefense = 0;
    blockerIndices.forEach(blockerIdx => {
      const blocker = defenderPlayer.battlefield[blockerIdx];
      totalBlockerDefense += blocker.defense;
      if (attacker.power >= blocker.defense) {
        defenderPlayer.battlefield.splice(blockerIdx, 1);
      }
    });
    if (totalBlockerDefense < attacker.power) {
      defenderPlayer.life -= (attacker.power - totalBlockerDefense);
    }
  }
  attackerPlayer.tapped.push(attackerIndex);
  return true;
};

const endTurn = (gameId, playerId) => {
  const game = games[gameId];
  if (!game || !game.players[playerId].isTurn) return false;
  Object.keys(game.players).forEach(id => {
    game.players[id].isTurn = id !== playerId;
    if (id !== playerId) {
      game.players[id].manaAvailable = game.players[id].manaPool;
      game.players[id].tapped = [];
    }
  });
  game.turn++;
  game.currentPhase = 'draw';
  return true;
};

export { createGame, drawCard, playMana, playCard, attack, endTurn };
