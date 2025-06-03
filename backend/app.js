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

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);

const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ roomId, user }) => {
    socket.join(roomId);
    const players = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    io.to(roomId).emit('playersUpdate', players);
  });

  socket.on('startGame', async ({ roomId }) => {
    try {
      // VERSJA A: używamy fs.readFile, zamiast import(...)
      const cardsPath = path.join(process.cwd(), 'data', 'cards.json');
      const raw = await readFile(cardsPath, 'utf-8');
      const fullDeck = JSON.parse(raw);
      const shuffled = fullDeck.sort(() => 0.5 - Math.random()).slice(0, 40);
      io.to(roomId).emit('gameStart', { deck: shuffled });
    } catch (err) {
      console.error('Błąd wczytywania cards.json:', err);
    }
  });

  socket.on('playMove', ({ roomId, move }) => {
    socket.to(roomId).emit('opponentMove', move);
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
