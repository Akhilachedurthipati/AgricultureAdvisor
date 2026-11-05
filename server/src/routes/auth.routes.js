import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  registerSchema,
  loginSchema,
  updateProfileSchema
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);

export default router;

