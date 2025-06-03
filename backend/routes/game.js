import express from 'express';
import { createRoom, joinRoom, getRoomState } from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/room', protect, createRoom);
router.post('/room/:roomId/join', protect, joinRoom);
router.get('/room/:roomId', protect, getRoomState);

export default router;
