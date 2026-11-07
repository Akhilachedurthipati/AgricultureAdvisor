import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getUnifiedHistory,
  getHistoryItemById,
  deleteHistoryItemById,
  clearUnifiedHistory
} from '../controllers/history.controller.js';

const router = express.Router();

// All history routes require JWT authentication
router.get('/', protect, getUnifiedHistory);
router.delete('/clear', protect, clearUnifiedHistory);
router.get('/:module/:id', protect, getHistoryItemById);
router.delete('/:module/:id', protect, deleteHistoryItemById);

export default router;

