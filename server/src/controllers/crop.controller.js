import { z } from 'zod';
import mongoose from 'mongoose';
import { predictCrop } from '../ml/cropPredictor.js';
import { getSeasonalClimateForCrop } from '../services/weather.service.js';
import CropRecommendation from '../models/CropRecommendation.js';

// Memory fallback store for crop recommendation history
export const memoryCropHistory = [];

export const cropInputSchema = z.object({
  soilType: z.string({
    required_error: 'Soil type is required'
  }).trim().min(2, 'Please select a valid soil type'),
  season: z.string({
    required_error: 'Cropping season is required'
  }).trim().min(2, 'Please select a valid cropping season'),
  landArea: z.coerce.number({
    invalid_type_error: 'Land area must be a valid number'
  }).positive('Land area must be greater than 0').optional().default(1),

  // Optional soil properties (farmers may lack soil test reports; never pass zero)
  ph: z.coerce.number({
    invalid_type_error: 'Soil pH must be a number'
  }).min(3.0, 'Soil pH cannot be below 3.0').max(10.0, 'Soil pH cannot exceed 10.0').optional().nullable(),
  nitrogen: z.coerce.number().min(0, 'Nitrogen cannot be negative').max(1000).optional().nullable(),
  phosphorus: z.coerce.number().min(0, 'Phosphorus cannot be negative').max(500).optional().nullable(),
  potassium: z.coerce.number().min(0, 'Potassium cannot be negative').max(1000).optional().nullable(),
  npk: z.object({
    n: z.coerce.number().optional().nullable(),
    p: z.coerce.number().optional().nullable(),
    k: z.coerce.number().optional().nullable(),
    nitrogen: z.coerce.number().optional().nullable(),
    phosphorus: z.coerce.number().optional().nullable(),
    potassium: z.coerce.number().optional().nullable()
  }).optional().nullable(),

  // Location parameters (used to auto-retrieve Open-Meteo weather)
  city: z.string().trim().optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  location: z.object({
    name: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable()
  }).optional().nullable(),

  // Direct meteorological overrides (for automated regression tests or offline simulation)
  temperature: z.coerce.number({
    invalid_type_error: 'Temperature must be a valid number'
  }).min(-10, 'Temperature cannot be below -10°C').max(60, 'Temperature cannot exceed 60°C').optional().nullable(),
  humidity: z.coerce.number({
    invalid_type_error: 'Humidity must be a valid number'
  }).min(0, 'Humidity cannot be below 0%').max(100, 'Humidity cannot exceed 100%').optional().nullable(),
  rainfall: z.coerce.number({
    invalid_type_error: 'Rainfall must be a valid number'
  }).min(0, 'Rainfall cannot be negative').max(3000, 'Rainfall cannot exceed 3000 mm').optional().nullable(),

  // Optional manual land allocation chosen by farmer
  allocatedLand: z.array(z.object({
    cropName: z.string().min(1, 'Crop name is required for land allocation'),
    acres: z.coerce.number().positive('Allocated acres must be positive')
  })).optional()
});

/**
 * @desc    Generate intelligent multiple crop recommendations using Open-Meteo weather
 * @route   POST /api/crop/recommend
 * @access  Private (or authenticated session)
 */
export const recommendCrop = async (req, res, next) => {
  try {
    const rawInputs = req.body;
    let { 
      soilType, 
      season, 
      landArea = 1, 
      ph, 
      nitrogen, 
      phosphorus, 
      potassium, 
      npk,
      city, 
      latitude, 
      longitude, 
      location,
      temperature, 
      humidity, 
      rainfall,
      allocatedLand 
    } = rawInputs;

    let weatherTelemetry = null;

    // Check if weather parameters were provided directly (e.g. from regression testing)
    const hasDirectWeather = (
      temperature !== undefined && temperature !== null && !isNaN(Number(temperature)) &&
      humidity !== undefined && humidity !== null && !isNaN(Number(humidity)) &&
      rainfall !== undefined && rainfall !== null && !isNaN(Number(rainfall))
    );

    if (hasDirectWeather) {
      // Use direct parameters provided
      temperature = Number(temperature);
      humidity = Number(humidity);
      rainfall = Number(rainfall);
      weatherTelemetry = {
        dataSource: 'Direct Agronomic Evaluation Inputs',
        temperature,
        humidity,
        seasonalCumulativeRainfall: rainfall,
        monthlyRainfallEquivalent: rainfall,
        rainfallUsedInModel: rainfall,
        location: location || (city ? { name: city } : null)
      };
    } else {
      // Resolve location from request or authenticated profile
      const targetCity = city || location?.name || location?.district || req.user?.location?.district || req.user?.location?.city;
      const targetLat = latitude ?? location?.latitude;
      const targetLon = longitude ?? location?.longitude;

      if (!targetCity && (targetLat == null || targetLon == null)) {
        return res.status(400).json({
          success: false,
          message: 'Location (district, city, or GPS coordinates) is required to automatically retrieve weather data.'
        });
      }

      // Query Open-Meteo for real-time temperature, humidity, and historical seasonal rainfall
      try {
        const climateData = await getSeasonalClimateForCrop({
          city: targetCity,
          latitude: targetLat,
          longitude: targetLon,
          season
        });

        temperature = climateData.temperature;
        humidity = climateData.humidity;
        rainfall = climateData.monthlyRainfallEquivalent; // Model-compatible monthly equivalent (20-300mm)
        weatherTelemetry = climateData;
      } catch (weatherErr) {
        return res.status(503).json({
          success: false,
          message: weatherErr.message || 'Weather telemetry is currently unavailable from Open-Meteo for the selected location. Please verify your district or check connection.'
        });
      }
    }

    // Structure NPK if provided (without fabricating values)
    const resolvedNpk = (nitrogen != null || phosphorus != null || potassium != null)
      ? { nitrogen, phosphorus, potassium }
      : npk || null;

    // Validate land allocation if farmer provided it
    if (allocatedLand && Array.isArray(allocatedLand) && allocatedLand.length > 0) {
      const totalAllocated = allocatedLand.reduce((sum, item) => sum + Number(item.acres || 0), 0);
      if (totalAllocated > Number(landArea) + 0.001) {
        return res.status(400).json({
          success: false,
          message: `Allocated land area (${totalAllocated.toFixed(1)} acres) exceeds your total available land area (${Number(landArea).toFixed(1)} acres).`
        });
      }
    }

    // Run ML inference
    const recommendation = predictCrop({
      soilType,
      season,
      temperature,
      humidity,
      rainfall,
      ph: ph != null ? Number(ph) : null,
      landArea: Number(landArea) || 1,
      npk: resolvedNpk,
      weatherTelemetry
    });

    const userId = req.user?._id || req.user?.id;

    // Persist recommendation in database for authenticated farmers
    let savedId = null;
    if (userId) {
      const recordPayload = {
        userId,
        inputs: {
          soilType,
          season,
          temperature,
          humidity,
          ph: ph != null ? Number(ph) : null,
          rainfall,
          landArea: Number(landArea) || 1,
          location: weatherTelemetry?.location || location || null,
          npk: resolvedNpk
        },
        recommendation: {
          cropName: recommendation.cropName,
          confidenceScore: recommendation.confidenceScore,
          isConfident: recommendation.isConfident,
          confidenceLevel: recommendation.confidenceLevel,
          uncertaintyWarning: recommendation.uncertaintyWarning,
          suitabilityExplanation: recommendation.suitabilityExplanation,
          cultivationTips: recommendation.cultivationInformation,
          agronomicParameters: recommendation.agronomicParameters,
          suitableCrops: recommendation.suitableCrops
        },
        allocatedLand: allocatedLand || [],
        weatherTelemetry,
        disclaimer: recommendation.advisoryDisclaimer
      };

      if (mongoose.connection.readyState === 1) {
        const created = await CropRecommendation.create(recordPayload);
        savedId = created._id.toString();
      } else {
        // Memory fallback persistence
        savedId = new mongoose.Types.ObjectId().toString();
        memoryCropHistory.push({
          id: savedId,
          _id: savedId,
          ...recordPayload,
          createdAt: new Date().toISOString()
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Recommended ${recommendation.suitableCrops.length} suitable crop(s): ${recommendation.suitableCrops.map(c => c.cropName).join(', ')}`,
      data: {
        id: savedId,
        ...recommendation,
        availableLandArea: Number(landArea) || 1,
        allocatedLand: allocatedLand || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save or update farmer's chosen land allocation across recommended crops
 * @route   PUT /api/crop/:id/allocation
 * @access  Private
 */
export const saveCropAllocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { allocatedLand, landArea } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!Array.isArray(allocatedLand)) {
      return res.status(400).json({
        success: false,
        message: 'allocatedLand must be an array of { cropName, acres }.'
      });
    }

    // Validate total acres
    const totalAllocated = allocatedLand.reduce((sum, item) => sum + Number(item.acres || 0), 0);
    const maxLand = Number(landArea) || 1000;
    if (totalAllocated > maxLand + 0.001) {
      return res.status(400).json({
        success: false,
        message: `Total allocated land (${totalAllocated.toFixed(1)} acres) exceeds available land (${maxLand.toFixed(1)} acres).`
      });
    }

    if (mongoose.connection.readyState === 1) {
      const record = await CropRecommendation.findOne({ _id: id, userId });
      if (!record) {
        return res.status(404).json({ success: false, message: 'Crop recommendation record not found.' });
      }
      record.allocatedLand = allocatedLand;
      await record.save();
      return res.status(200).json({
        success: true,
        message: 'Land allocation saved successfully.',
        data: record
      });
    }

    // Memory fallback
    const memRecord = memoryCropHistory.find(item => (item.id === id || item._id === id) && item.userId === userId.toString());
    if (!memRecord) {
      return res.status(404).json({ success: false, message: 'Crop recommendation record not found.' });
    }
    memRecord.allocatedLand = allocatedLand;

    res.status(200).json({
      success: true,
      message: 'Land allocation saved successfully.',
      data: memRecord
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

