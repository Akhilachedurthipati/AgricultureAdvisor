import { z } from 'zod';
import mongoose from 'mongoose';
import { calculateFertilizerRecommendation } from '../services/fertilizer.service.js';
import FertilizerRecommendation from '../models/FertilizerRecommendation.js';

// Memory fallback store for fertilizer recommendation history
const memoryFertilizerHistory = [];

export const fertilizerInputSchema = z.object({
  soilType: z.string({
    required_error: 'Soil type is required'
  }).trim().min(2, 'Please select a valid soil type'),
  season: z.string({
    required_error: 'Cropping season is required'
  }).trim().min(2, 'Please select a valid cropping season'),
  crop: z.string({
    required_error: 'Selected crop is required'
  }).trim().min(2, 'Please choose a target crop'),
  nitrogen: z.coerce.number({
    required_error: 'Nitrogen (N) value is required',
    invalid_type_error: 'Nitrogen must be a valid number'
  }).min(0, 'Nitrogen value cannot be negative').max(1000, 'Nitrogen value exceeds realistic agronomic range'),
  phosphorus: z.coerce.number({
    required_error: 'Phosphorus (P) value is required',
    invalid_type_error: 'Phosphorus must be a valid number'
  }).min(0, 'Phosphorus value cannot be negative').max(500, 'Phosphorus value exceeds realistic agronomic range'),
  potassium: z.coerce.number({
    required_error: 'Potassium (K) value is required',
    invalid_type_error: 'Potassium must be a valid number'
  }).min(0, 'Potassium value cannot be negative').max(1000, 'Potassium value exceeds realistic agronomic range'),
  landArea: z.coerce.number({
    required_error: 'Land area is required',
    invalid_type_error: 'Land area must be a valid number'
  }).gt(0, 'Land area must be greater than 0').max(5000, 'Land area cannot exceed 5000 acres')
});

/**
 * @desc    Generate precision fertilizer dosage recommendation
 * @route   POST /api/fertilizer/recommend
 * @access  Private (JWT Protected)
 */
export const recommendFertilizer = async (req, res, next) => {
  try {
    const inputs = req.body;

    // Run agronomic calculation engine
    const recommendation = calculateFertilizerRecommendation(inputs);

    const userId = req.user?._id || req.user?.id;

    // Persist in database for authenticated farmer
    if (userId) {
      if (mongoose.connection.readyState === 1) {
        await FertilizerRecommendation.create({
          userId,
          inputs: {
            soilType: inputs.soilType,
            season: inputs.season,
            crop: inputs.crop,
            nitrogen: inputs.nitrogen,
            phosphorus: inputs.phosphorus,
            potassium: inputs.potassium,
            landArea: inputs.landArea,
            landAreaUnit: 'Acres'
          },
          recommendation: {
            fertilizerCombination: recommendation.fertilizerCombination,
            nutrientDeficitAnalysis: recommendation.nutrientDeficitAnalysis,
            dosageBreakdown: recommendation.dosageBreakdown,
            explanations: recommendation.explanations,
            applicationGuidance: recommendation.applicationGuidance,
            safetyPrecautions: recommendation.safetyPrecautions
          },
          disclaimer: recommendation.advisoryDisclaimer
        });
      } else {
        // Memory fallback persistence
        memoryFertilizerHistory.push({
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
      message: `Fertilizer recommendation calculated for ${inputs.crop}`,
      data: recommendation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's previous fertilizer recommendations
 * @route   GET /api/fertilizer/history
 * @access  Private
 */
export const getFertilizerHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const history = await FertilizerRecommendation.find({ userId }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: history.length,
        data: history
      });
    }

    // Memory fallback
    const userHistory = memoryFertilizerHistory
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

