import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { uploadLeafImage } from '../middleware/upload.middleware.js';
import {
  detectDisease,
  getDiseaseHistory,
  getDiseaseReportById,
  deleteDiseaseReport
} from '../controllers/disease.controller.js';

const router = express.Router();

// Multer error handling wrapper
const handleUpload = (req, res, next) => {
  uploadLeafImage.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed. Ensure image is under 10MB in JPEG, PNG, or WebP format.'
      });
    }
    next();
  });
};

/**
 * @route   POST /api/disease/detect
 * @desc    Analyze uploaded leaf image for plant disease
 * @access  Private (JWT)
 */
router.post('/detect', protect, handleUpload, detectDisease);

/**
 * @route   GET /api/disease/history
 * @desc    Get authenticated user's scan history
 * @access  Private (JWT)
 */
router.get('/history', protect, getDiseaseHistory);

/**
 * @route   GET /api/disease/:id
 * @desc    Get specific disease report
 * @access  Private (JWT)
 */
router.get('/:id', protect, getDiseaseReportById);

/**
 * @route   DELETE /api/disease/:id
 * @desc    Delete disease report & scan image
 * @access  Private (JWT)
 */
router.delete('/:id', protect, deleteDiseaseReport);

export default router;

