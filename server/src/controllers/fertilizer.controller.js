import { z } from 'zod';
import mongoose from 'mongoose';
import { calculateFertilizerRecommendation } from '../services/fertilizer.service.js';
import FertilizerRecommendation from '../models/FertilizerRecommendation.js';

// Memory fallback store for fertilizer recommendation history
export const memoryFertilizerHistory = [];

/**
 * Validates whether a YYYY-MM-DD string represents a real, valid calendar date
 */
export const isValidCalendarDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const [yearStr, monthStr, dayStr] = parts;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dateObj = new Date(Date.UTC(year, month - 1, day));
  return (
    dateObj.getUTCFullYear() === year &&
    dateObj.getUTCMonth() + 1 === month &&
    dateObj.getUTCDate() === day
  );
};

/**
 * Preprocessor to normalize null/empty values to undefined for optional inputs
 */
const optionalNumberPreprocessor = (schema) => z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return undefined;
  return val;
}, schema.optional().nullable());

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
  nitrogen: optionalNumberPreprocessor(
    z.coerce.number({
      invalid_type_error: 'Nitrogen must be a valid number'
    }).min(0, 'Nitrogen value cannot be negative').max(1000, 'Nitrogen value exceeds realistic agronomic range')
  ),
  phosphorus: optionalNumberPreprocessor(
    z.coerce.number({
      invalid_type_error: 'Phosphorus must be a valid number'
    }).min(0, 'Phosphorus value cannot be negative').max(500, 'Phosphorus value exceeds realistic agronomic range')
  ),
  potassium: optionalNumberPreprocessor(
    z.coerce.number({
      invalid_type_error: 'Potassium must be a valid number'
    }).min(0, 'Potassium value cannot be negative').max(1000, 'Potassium value exceeds realistic agronomic range')
  ),
  ph: optionalNumberPreprocessor(
    z.coerce.number({
      invalid_type_error: 'Soil pH must be a valid number'
    }).min(3.0, 'Soil pH must be at least 3.0').max(11.0, 'Soil pH cannot exceed 11.0')
  ),
  sowingDate: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    return val;
  }, z.string({
    invalid_type_error: 'Sowing date must be a text string'
  }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Sowing date must follow YYYY-MM-DD format')
    .refine((val) => isValidCalendarDate(val), {
      message: 'Sowing date must represent a valid calendar date'
    })
  ).optional().nullable(),
  landArea: z.coerce.number({
    required_error: 'Land area is required',
    invalid_type_error: 'Land area must be a valid number'
  }).gt(0, 'Land area must be greater than 0').max(5000, 'Land area cannot exceed 5000 acres')
});

/**
 * Validates that lifecycle schedule contains required agronomic structures
 */
export const validateLifecycleSchedule = (schedule) => {
  if (!Array.isArray(schedule) || schedule.length === 0) {
    return false;
  }
  for (const stage of schedule) {
    if (!stage.stageId || !stage.stageName || !Array.isArray(stage.fertilizers)) {
      return false;
    }
  }
  return true;
};

/**
 * @desc    Generate precision crop life-cycle fertilizer dosage recommendation
 * @route   POST /api/fertilizer/recommend
 * @access  Private (JWT Protected)
 */
export const recommendFertilizer = async (req, res, next) => {
  try {
    const inputs = req.body;

    // Run agronomic calculation engine with verified life-cycle scheduling
    const recommendation = calculateFertilizerRecommendation({
      soilType: inputs.soilType,
      season: inputs.season,
      crop: inputs.crop,
      nitrogen: inputs.nitrogen,
      phosphorus: inputs.phosphorus,
      potassium: inputs.potassium,
      ph: inputs.ph,
      landArea: inputs.landArea,
      sowingDate: inputs.sowingDate
    });

    // Validate lifecycle integrity before storage
    if (!validateLifecycleSchedule(recommendation.lifecycleSchedule)) {
      throw new Error('Agronomic calculation error: Incomplete crop life-cycle schedule generated');
    }

    const userId = req.user?._id || req.user?.id;

    // Persist in database for authenticated farmer
    if (userId) {
      const recordPayload = {
        userId,
        inputs: {
          soilType: inputs.soilType,
          season: inputs.season,
          crop: inputs.crop,
          nitrogen: inputs.nitrogen !== undefined && inputs.nitrogen !== null ? Number(inputs.nitrogen) : null,
          phosphorus: inputs.phosphorus !== undefined && inputs.phosphorus !== null ? Number(inputs.phosphorus) : null,
          potassium: inputs.potassium !== undefined && inputs.potassium !== null ? Number(inputs.potassium) : null,
          ph: inputs.ph !== undefined && inputs.ph !== null ? Number(inputs.ph) : null,
          sowingDate: inputs.sowingDate ? String(inputs.sowingDate) : null,
          landArea: Number(inputs.landArea),
          landAreaUnit: 'Acres'
        },
        recommendation: {
          recommendationMode: recommendation.recommendationMode,
          fertilizerCombination: recommendation.fertilizerCombination,
          nutrientDeficitAnalysis: recommendation.nutrientDeficitAnalysis,
          soilPhAdvisory: recommendation.soilPhAdvisory,
          dosageBreakdown: recommendation.dosageBreakdown,
          lifecycleSchedule: recommendation.lifecycleSchedule,
          institutionReference: recommendation.institutionReference,
          explanations: recommendation.explanations,
          applicationGuidance: recommendation.applicationGuidance,
          safetyPrecautions: recommendation.safetyPrecautions
        },
        disclaimer: recommendation.advisoryDisclaimer
      };

      if (mongoose.connection.readyState === 1) {
        await FertilizerRecommendation.create(recordPayload);
      } else {
        // Memory fallback persistence
        memoryFertilizerHistory.push({
          id: new mongoose.Types.ObjectId().toString(),
          _id: new mongoose.Types.ObjectId().toString(),
          userId: userId.toString(),

          ...recordPayload,
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

export default {
  fertilizerInputSchema,
  recommendFertilizer,
  getFertilizerHistory,
  isValidCalendarDate,
  validateLifecycleSchedule
};
