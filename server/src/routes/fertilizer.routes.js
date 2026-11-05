import express from 'express';
import { 
  recommendFertilizer, 
  getFertilizerHistory, 
  fertilizerInputSchema 
} from '../controllers/fertilizer.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected fertilizer recommendation routes
router.post('/recommend', protect, validate(fertilizerInputSchema), recommendFertilizer);
router.get('/history', protect, getFertilizerHistory);

export default router;

