import { z } from 'zod';
import { 
  findUserByEmail, 
  createUser, 
  updateUserProfile 
} from '../services/userService.js';
import { generateToken } from '../utils/jwt.js';

// Input Validation Schemas
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Full name must have at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().trim().optional(),
  preferredLanguage: z.enum(['en', 'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'bn']).optional().default('en'),
  location: z.object({
    state: z.string().optional().default(''),
    district: z.string().optional().default(''),
    city: z.string().optional().default('')
  }).optional().default({})
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().optional(),
  preferredLanguage: z.enum(['en', 'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'bn']).optional(),
  location: z.object({
    state: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional()
  }).optional()
});

/**
 * @desc    Register a new farmer account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, preferredLanguage, location } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.'
      });
    }

    const newUser = await createUser({
      name,
      email,
      password,
      phone,
      preferredLanguage,
      location
    });

    const userId = newUser._id || newUser.id;
    const token = generateToken(userId);

    const safeUser = typeof newUser.toJSON === 'function' ? newUser.toJSON() : newUser;

    res.status(201).json({
      success: true,
      message: 'Farmer account created successfully!',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate farmer and get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.'
      });
    }

    const userId = user._id || user.id;
    const token = generateToken(userId);
    const safeUser = typeof user.toJSON === 'function' ? user.toJSON() : user;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in farmer profile
 * @route   GET /api/auth/profile
 * @access  Private (JWT protected)
 */
export const getProfile = async (req, res) => {
  const safeUser = typeof req.user.toJSON === 'function' ? req.user.toJSON() : req.user;
  res.status(200).json({
    success: true,
    user: safeUser
  });
};

/**
 * @desc    Update logged-in farmer profile
 * @route   PUT /api/auth/profile
 * @access  Private (JWT protected)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const updated = await updateUserProfile(userId, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Farmer profile updated successfully',
      user: updated
    });
  } catch (error) {
    next(error);
  }
};

