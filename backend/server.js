import express from 'express';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import http from 'http';
import authRoutes from './auth.js';
import User from './models/User.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

mongoose.connect('mongodb://localhost/ccg', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use('/api/auth', authRoutes);

io.on('connection', (socket) => {
  socket.on('joinGame', async ({ userId, isBot }) => {
    const user = await User.findById(userId);
    socket.join(userId);
    socket.emit('gameState', { playerA: { id: userId, deck: user.collection.slice(0, 40) }, playerB: isBot ? { id: 'bot' } : null });
  });

  socket.on('updateGameState', (gameState) => {
    io.to(gameState.playerA.id).emit('gameState', gameState);
    if (gameState.playerB.id !== 'bot') io.to(gameState.playerB.id).emit('gameState', gameState);
  });
});

server.listen(3001, () => console.log('Server running on port 3001'));
