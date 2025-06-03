import express from 'express';
import { getProfile, addToCollection, getAllCards } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.post('/collection', protect, addToCollection);
router.get('/cards', getAllCards);

export default router;
