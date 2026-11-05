import { z } from 'zod';
import mongoose from 'mongoose';
import { predictCrop } from '../ml/cropPredictor.js';
import CropRecommendation from '../models/CropRecommendation.js';

// Memory fallback store for crop recommendation history
const memoryCropHistory = [];

export const cropInputSchema = z.object({
  soilType: z.string({
    required_error: 'Soil type is required'
  }).trim().min(2, 'Please select a valid soil type'),
  season: z.string({
    required_error: 'Cropping season is required'
  }).trim().min(2, 'Please select a valid cropping season'),
  temperature: z.coerce.number({
    required_error: 'Temperature is required',
    invalid_type_error: 'Temperature must be a valid number'
  }).min(-10, 'Temperature cannot be below -10°C').max(60, 'Temperature cannot exceed 60°C'),
  humidity: z.coerce.number({
    required_error: 'Humidity is required',
    invalid_type_error: 'Humidity must be a valid number'
  }).min(0, 'Humidity cannot be below 0%').max(100, 'Humidity cannot exceed 100%'),
  ph: z.coerce.number({
    required_error: 'Soil pH is required',
    invalid_type_error: 'Soil pH must be a valid number'
  }).min(3.0, 'Soil pH cannot be below 3.0').max(10.0, 'Soil pH cannot exceed 10.0'),
  rainfall: z.coerce.number({
    required_error: 'Rainfall is required',
    invalid_type_error: 'Rainfall must be a valid number'
  }).min(0, 'Rainfall cannot be negative').max(3000, 'Rainfall cannot exceed 3000 mm')
});

/**
 * @desc    Generate intelligent single crop recommendation
 * @route   POST /api/crop/recommend
 * @access  Private (or authenticated session)
 */
export const recommendCrop = async (req, res, next) => {
  try {
    const inputs = req.body;

    // Run ML inference
    const recommendation = predictCrop(inputs);

    const userId = req.user?._id || req.user?.id;

    // Persist recommendation in database for authenticated farmers
    if (userId) {
      if (mongoose.connection.readyState === 1) {
        await CropRecommendation.create({
          userId,
          inputs,
          recommendation: {
            cropName: recommendation.cropName,
            confidenceScore: recommendation.confidenceScore,
            suitabilityExplanation: recommendation.suitabilityExplanation,
            cultivationTips: recommendation.cultivationInformation,
            agronomicParameters: recommendation.agronomicParameters
          },
          disclaimer: recommendation.advisoryDisclaimer
        });
      } else {
        // Memory fallback persistence
        memoryCropHistory.push({
          id: new mongoose.Types.ObjectId().toString(),
          userId: userId.toString(),
          inputs,
          recommendation,
          createdAt: new Date().toISOString()
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Recommended crop: ${recommendation.cropName}`,
      data: recommendation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get crop recommendation history for logged-in user
 * @route   GET /api/crop/history
 * @access  Private
 */
export const getCropHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const history = await CropRecommendation.find({ userId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: history.length,
        data: history
      });
    }

    // Memory fallback
    const userHistory = memoryCropHistory
      .filter(item => item.userId === userId.toString())
      .reverse();

    res.status(200).json({
      success: true,
      count: userHistory.length,
      data: userHistory
    });
  } catch (error) {
    next(error);
  }
};
