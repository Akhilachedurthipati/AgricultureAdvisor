import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  handleChatMessage,
  getChatHistory,
  clearChatHistory
} from '../controllers/chat.controller.js';

const router = express.Router();

// All chat endpoints are protected by JWT authentication
router.post('/message', protect, handleChatMessage);
router.get('/history', protect, getChatHistory);
router.delete('/history', protect, clearChatHistory);

export default router;
