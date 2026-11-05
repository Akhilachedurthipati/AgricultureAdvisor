import express from 'express';
import { recommendCrop, getCropHistory, cropInputSchema } from '../controllers/crop.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected crop recommendation routes
router.post('/recommend', protect, validate(cropInputSchema), recommendCrop);
router.get('/history', protect, getCropHistory);

export default router;
