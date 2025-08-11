// ... (na górze pliku)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { readFile } from 'fs/promises';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import gameRoutes from './routes/game.js';
import { Server } from 'socket.io';
import Game from './game/Game.js';
import { makeBotTurnActions } from './game/bot_logic.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);

const io = new Server(server, { cors: { origin: '*' } });
const roomPlayers = {};
const activeGames = {};

// Helper function to send personalized game state to each player
const sendGameState = (roomId) => {
  const game = activeGames[roomId];
  if (!game) return;

  for (const socketId in roomPlayers[roomId]) {
    const player = roomPlayers[roomId][socketId];
    const isPlayer1 = game.players[0].id === player.id;

    const state = {
      ...game.getState(),
      myHand: isPlayer1 ? game.hands.player1 : game.hands.player2,
      opponentHandSize: isPlayer1 ? game.hands.player2.length : game.hands.player1.length,
    };
    delete state.hands; // Remove the full hands object

    io.to(socketId).emit('gameStateUpdate', state);
  }

  // Check for game over condition
  if (game.life.player1 <= 0 || game.life.player2 <= 0) {
    const winner = game.life.player1 <= 0 ? game.players[1] : game.players[0];
    io.to(roomId).emit('gameEnd', { winner });
    delete activeGames[roomId];
  }
};

const executeBotActions = async (roomId) => {
    const game = activeGames[roomId];
    if (!game || game.getCurrentPlayer().id !== 'bot') return;

    const botId = 'bot';
    const actions = makeBotTurnActions(game.getState(), botId);

    for (const action of actions) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between actions

        if (!activeGames[roomId]) return; // Game might have ended

        try {
            switch (action.type) {
                case 'drawCard':
                    game.drawCard(botId);
                    break;
                case 'playCardAsMana':
                    game.playCardAsMana(botId, action.cardId);
                    break;
                case 'playUnitCard':
                    game.playUnitCard(botId, action.cardId);
                    break;
                case 'passPhase':
                    game.passPhase(botId);
                    break;
                case 'enterAttackPhase':
                    game.enterAttackPhase(botId);
                    break;
                case 'declareAttack':
                    game.declareAttack(botId, action.attackerIds);
                    // In a real game, we'd wait for defender response. Bot games are simplified.
                    if (game.phase === 'defend') {
                       // Bot vs Bot not supported, so defender is always human.
                       // We will let the human player respond.
                    }
                    break;
                case 'endTurn':
                    game.endTurn(botId);
                    break;
            }
            sendGameState(roomId);
        } catch (e) {
            console.error("Bot error:", e.message);
            // If bot makes an error, just end its turn
            if(activeGames[roomId]) {
                game.endTurn(botId);
                sendGameState(roomId);
            }
            return;
        }
    }
};

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ roomId, user }) => {
    socket.join(roomId);
    if (!roomPlayers[roomId]) {
      roomPlayers[roomId] = {};
    }
    roomPlayers[roomId][socket.id] = { id: user.id, username: user.username };
    const players = Object.values(roomPlayers[roomId]);
    io.to(roomId).emit('playersUpdate', players);
  });

  socket.on('startGame', async ({ roomId }) => {
    try {
      const cardsPath = path.join(process.cwd(), 'data', 'cards.json');
      const usersPath = path.join(process.cwd(), 'data', 'users.json');

      const cardsData = await readFile(cardsPath, 'utf-8');
      const allCards = JSON.parse(cardsData);
      const allUsers = JSON.parse(usersData);

      const getDeckForPlayer = (player) => {
        const user = allUsers.find(u => u.id === player.id);
        if (!user) throw new Error(`Nie znaleziono użytkownika ${player.username}`);
        if (!user.activeDeck) throw new Error(`Gracz ${player.username} nie ma aktywnej talii.`);
        const deck = user.decks.find(d => d.name === user.activeDeck);
        if (!deck) throw new Error(`Aktywna talia gracza ${player.username} nie została znaleziona.`);
        if (deck.cards.length !== 40) throw new Error(`Talia gracza ${player.username} musi mieć 40 kart.`);
        return deck.cards.map(cardName => allCards.find(c => c.name === cardName)).filter(Boolean);
      };

      let game;
      if (roomId.startsWith('bot_match_')) {
        // Bot game logic
        if (Object.keys(roomPlayers[roomId]).length !== 1) {
          return io.to(roomId).emit('error', 'Błąd podczas tworzenia gry z botem.');
        }
        const humanPlayer = Object.values(roomPlayers[roomId])[0];
        const botPlayer = { id: 'bot', username: 'Bot' };

        const humanDeck = getDeckForPlayer(humanPlayer);
        const botDeck = [...allCards].sort(() => 0.5 - Math.random()).slice(0, 40);

        game = new Game(
          [humanPlayer, botPlayer],
          { [humanPlayer.id]: humanDeck, [botPlayer.id]: botDeck }
        );

      } else {
        // 2-player game logic
        if (Object.keys(roomPlayers[roomId]).length !== 2) {
          return io.to(roomId).emit('error', 'Potrzeba 2 graczy, by rozpocząć grę.');
        }
        const players = Object.values(roomPlayers[roomId]);
        const deck1 = getDeckForPlayer(players[0]);
        const deck2 = getDeckForPlayer(players[1]);
        game = new Game(
          [players[0], players[1]],
          { [players[0].id]: deck1, [players[1].id]: deck2 }
        );
      }

      activeGames[roomId] = game;
      io.to(roomId).emit('gameStart');
      sendGameState(roomId);

      // If bot is player 1, it takes the first turn
      if (game.getCurrentPlayer().id === 'bot') {
        executeBotActions(roomId);
      }

    } catch (err) {
      console.error('Błąd podczas rozpoczynania gry:', err);
      io.to(roomId).emit('gameError', { message: err.message || 'Wystąpił błąd podczas rozpoczynania gry.' });
    }
  });

  const handleGameAction = (handler) => {
    try {
      handler();
    } catch (error) {
      socket.emit('gameError', { message: error.message });
    }
  };

  socket.on('drawCard', ({ roomId }) => handleGameAction(() => {
    const game = activeGames[roomId];
    const player = roomPlayers[roomId][socket.id];
    game.drawCard(player.id);
    sendGameState(roomId);
  }));

  socket.on('playManaCard', ({ roomId, cardId }) => handleGameAction(() => {
    const game = activeGames[roomId];
    const player = roomPlayers[roomId][socket.id];
    game.playCardAsMana(player.id, cardId);
    sendGameState(roomId);
  }));

  socket.on('playUnitCard', ({ roomId, cardId }) => handleGameAction(() => {
    const game = activeGames[roomId];
    const player = roomPlayers[roomId][socket.id];
    game.playUnitCard(player.id, cardId);
    sendGameState(roomId);
  }));

  socket.on('endTurn', ({ roomId }) => handleGameAction(() => {
    const game = activeGames[roomId];
    if (!game) return;
    const player = roomPlayers[roomId][socket.id];
    game.endTurn(player.id);
    sendGameState(roomId);

    if (game.getCurrentPlayer().id === 'bot') {
        executeBotActions(roomId);
    }
  }));

  socket.on('passPhase', ({ roomId }) => handleGameAction(() => {
    const game = activeGames[roomId];
    const player = roomPlayers[roomId][socket.id];
    game.passPhase(player.id);
    sendGameState(roomId);
  }));

  socket.on('enterAttackPhase', ({ roomId }) => handleGameAction(() => {
    const game = activeGames[roomId];
    const player = roomPlayers[roomId][socket.id];
    game.enterAttackPhase(player.id);
    sendGameState(roomId);
  }));

  socket.on('declareAttack', ({ roomId, attackerIds }) => handleGameAction(() => {
    const game = activeGames[roomId];
    const player = roomPlayers[roomId][socket.id];
    game.declareAttack(player.id, attackerIds);
    sendGameState(roomId);
  }));

  socket.on('declareDefense', ({ roomId, assignments }) => handleGameAction(() => {
    const game = activeGames[roomId];
    const player = roomPlayers[roomId][socket.id];
    game.declareDefense(player.id, assignments);
    sendGameState(roomId);
  }));

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomPlayers[roomId]) {
        delete roomPlayers[roomId][socket.id];
        // Also clean up the game if a player leaves
        if (activeGames[roomId]) {
          delete activeGames[roomId];
          io.to(roomId).emit('gameEnd', { message: 'Przeciwnik opuścił grę.' });
        }
        io.to(roomId).emit('playersUpdate', Object.values(roomPlayers[roomId]));
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
  });
}

export default app;
export { server };
