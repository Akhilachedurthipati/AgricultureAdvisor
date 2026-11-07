import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import CropRecommendation from '../models/CropRecommendation.js';
import FertilizerRecommendation from '../models/FertilizerRecommendation.js';
import DiseaseReport from '../models/DiseaseReport.js';
import ChatHistory from '../models/ChatHistory.js';

import { memoryCropHistory } from './crop.controller.js';
import { memoryFertilizerHistory } from './fertilizer.controller.js';
import { memoryDiseaseHistory } from './disease.controller.js';
import { inMemoryChatHistory } from './chat.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Standardize records across all four agricultural modules into a unified presentation schema
 */
function standardizeRecord(item, moduleType) {
  const rawId = item._id ? item._id.toString() : (item.id || item.id?.toString() || '');
  const date = item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString();

  if (moduleType === 'crop') {
    const cropName = item.recommendation?.cropName || 'Crop';
    return {
      id: rawId,
      module: 'crop',
      title: `${cropName} Recommendation`,
      crop: cropName,
      resultType: 'Crop Recommendation',
      summary: `${item.inputs?.soilType || 'Soil'} • ${item.inputs?.season || 'Season'} • Suitability: ${item.recommendation?.confidenceScore || 0}%`,
      date,
      badgeColor: 'agri',
      details: {
        inputs: item.inputs,
        recommendation: item.recommendation,
        disclaimer: item.disclaimer
      }
    };
  }

  if (moduleType === 'fertilizer') {
    const targetCrop = item.inputs?.crop || 'Crop';
    return {
      id: rawId,
      module: 'fertilizer',
      title: `${targetCrop} Fertilizer Plan`,
      crop: targetCrop,
      resultType: 'Fertilizer Plan',
      summary: `${item.recommendation?.fertilizerCombination || 'Nutrient Schedule'} • ${item.inputs?.landArea || 1} ${item.inputs?.landAreaUnit || 'Acres'}`,
      date,
      badgeColor: 'amber',
      details: {
        inputs: item.inputs,
        recommendation: item.recommendation,
        disclaimer: item.disclaimer
      }
    };
  }

  if (moduleType === 'disease') {
    const isClean = Boolean(item.detection?.isHealthy);
    const targetCrop = item.crop || item.detection?.crop || 'Foliar Specimen';
    const title = isClean
      ? `${targetCrop} Clean Foliage`
      : (item.detection?.diseaseName || `${targetCrop} Pathology`);

    return {
      id: rawId,
      module: 'disease',
      title,
      crop: targetCrop,
      resultType: isClean ? 'Clean Foliage' : 'Pathology Diagnosis',
      summary: isClean
        ? 'Healthy leaf tissue (No foliar infection detected)'
        : `Severity: ${item.detection?.severity || 'Moderate'} • Certainty: ${item.detection?.confidenceScore || 0}%`,
      date,
      badgeColor: isClean ? 'success' : 'danger',
      details: {
        crop: item.crop,
        imageUrl: item.imageUrl,
        detection: item.detection,
        featuresExtracted: item.featuresExtracted,
        disclaimer: item.disclaimer
      }
    };
  }

  if (moduleType === 'chat') {
    const querySnippet = item.message
      ? (item.message.length > 45 ? `${item.message.substring(0, 45)}...` : item.message)
      : 'Farmer Consultation';

    return {
      id: rawId,
      module: 'chat',
      title: `AI Advisory: ${querySnippet}`,
      crop: null,
      resultType: 'AI Consultation',
      summary: `${item.category ? item.category.toUpperCase() : 'GENERAL'} • ${item.response ? item.response.substring(0, 80) + '...' : ''}`,
      date,
      badgeColor: 'purple',
      details: {
        message: item.message,
        response: item.response,
        language: item.language,
        category: item.category,
        isVoice: item.isVoice,
        tokensUsed: item.tokensUsed
      }
    };
  }

  return {
    id: rawId,
    module: moduleType,
    title: 'Agricultural Record',
    crop: null,
    resultType: 'General',
    summary: '',
    date,
    badgeColor: 'neutral',
    details: item
  };
}

/**
 * Fetch unified history records with module filtering, search, pagination, and date filtering
 * GET /api/history
 */
export async function getUnifiedHistory(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access records.'
      });
    }

    const {
      module = 'all',
      search = '',
      crop = '',
      startDate = '',
      endDate = '',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const uStr = userId.toString();

    let allStandardized = [];

    // Query collections according to requested module filter
    const shouldFetch = (mod) => module === 'all' || module === mod;

    if (mongoose.connection.readyState === 1) {
      // 1. Crop Recommendations
      if (shouldFetch('crop')) {
        const crops = await CropRecommendation.find({ userId }).lean();
        allStandardized.push(...crops.map(c => standardizeRecord(c, 'crop')));
      }

      // 2. Fertilizer Recommendations
      if (shouldFetch('fertilizer')) {
        const ferts = await FertilizerRecommendation.find({ userId }).lean();
        allStandardized.push(...ferts.map(f => standardizeRecord(f, 'fertilizer')));
      }

      // 3. Disease Reports
      if (shouldFetch('disease')) {
        const diseases = await DiseaseReport.find({ userId }).lean();
        allStandardized.push(...diseases.map(d => standardizeRecord(d, 'disease')));
      }

      // 4. Chat Consultations
      if (shouldFetch('chat')) {
        const chats = await ChatHistory.find({ userId }).lean();
        allStandardized.push(...chats.map(ch => standardizeRecord(ch, 'chat')));
      }
    } else {
      // Memory Fallback
      if (shouldFetch('crop')) {
        const crops = memoryCropHistory.filter(c => String(c.userId) === uStr);
        allStandardized.push(...crops.map(c => standardizeRecord(c, 'crop')));
      }
      if (shouldFetch('fertilizer')) {
        const ferts = memoryFertilizerHistory.filter(f => String(f.userId) === uStr);
        allStandardized.push(...ferts.map(f => standardizeRecord(f, 'fertilizer')));
      }
      if (shouldFetch('disease')) {
        const diseases = memoryDiseaseHistory.filter(d => String(d.userId) === uStr);
        allStandardized.push(...diseases.map(d => standardizeRecord(d, 'disease')));
      }
      if (shouldFetch('chat')) {
        const chats = inMemoryChatHistory.filter(ch => String(ch.userId) === uStr);
        allStandardized.push(...chats.map(ch => standardizeRecord(ch, 'chat')));
      }
    }

    // Apply Filters

    // 1. Search Query Filter
    if (search && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      allStandardized = allStandardized.filter(item => {
        const inTitle = item.title?.toLowerCase().includes(q);
        const inCrop = item.crop?.toLowerCase().includes(q);
        const inSummary = item.summary?.toLowerCase().includes(q);
        const inMsg = item.details?.message?.toLowerCase().includes(q);
        const inResp = item.details?.response?.toLowerCase().includes(q);
        return inTitle || inCrop || inSummary || inMsg || inResp;
      });
    }

    // 2. Crop Filter
    if (crop && crop.trim().length > 0 && crop !== 'all') {
      const cLower = crop.trim().toLowerCase();
      allStandardized = allStandardized.filter(item =>
        item.crop?.toLowerCase().includes(cLower)
      );
    }

    // 3. Date Range Filter
    if (startDate) {
      const startMs = new Date(startDate).getTime();
      if (!isNaN(startMs)) {
        allStandardized = allStandardized.filter(item => new Date(item.date).getTime() >= startMs);
      }
    }
    if (endDate) {
      const endMs = new Date(endDate).getTime();
      if (!isNaN(endMs)) {
        allStandardized = allStandardized.filter(item => new Date(item.date).getTime() <= endMs);
      }
    }

    // Sort by date descending
    allStandardized.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Compute Pagination
    const totalCount = allStandardized.length;
    const totalPages = Math.ceil(totalCount / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedRecords = allStandardized.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      count: totalCount,
      page: pageNum,
      totalPages,
      limit: limitNum,
      data: paginatedRecords
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetch full details of an individual record with multi-tenant ownership check
 * GET /api/history/:module/:id
 */
export async function getHistoryItemById(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { module: mod, id } = req.params;

    if (!['crop', 'fertilizer', 'disease', 'chat'].includes(mod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module specified. Must be crop, fertilizer, disease, or chat.'
      });
    }

    const uStr = userId.toString();
    let rawItem = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      if (mod === 'crop') rawItem = await CropRecommendation.findById(id).lean();
      else if (mod === 'fertilizer') rawItem = await FertilizerRecommendation.findById(id).lean();
      else if (mod === 'disease') rawItem = await DiseaseReport.findById(id).lean();
      else if (mod === 'chat') rawItem = await ChatHistory.findById(id).lean();
    } else {
      if (mod === 'crop') rawItem = memoryCropHistory.find(c => (c.id === id || c._id === id));
      else if (mod === 'fertilizer') rawItem = memoryFertilizerHistory.find(f => (f.id === id || f._id === id));
      else if (mod === 'disease') rawItem = memoryDiseaseHistory.find(d => (d.id === id || d._id === id));
      else if (mod === 'chat') rawItem = inMemoryChatHistory.find(ch => (ch.id === id || ch._id === id));
    }

    if (!rawItem) {
      return res.status(404).json({
        success: false,
        message: 'Agricultural history record not found.'
      });
    }

    // Strict multi-tenant data isolation: User can only access their own records
    const itemUserId = rawItem.userId ? rawItem.userId.toString() : '';
    if (itemUserId !== uStr) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to access this record.'
      });
    }

    const standardized = standardizeRecord(rawItem, mod);
    return res.status(200).json({
      success: true,
      data: standardized
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an individual history record with multi-tenant ownership check & disk cleanup
 * DELETE /api/history/:module/:id
 */
export async function deleteHistoryItemById(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { module: mod, id } = req.params;

    if (!['crop', 'fertilizer', 'disease', 'chat'].includes(mod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module specified. Must be crop, fertilizer, disease, or chat.'
      });
    }

    const uStr = userId.toString();
    let rawItem = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      if (mod === 'crop') rawItem = await CropRecommendation.findById(id);
      else if (mod === 'fertilizer') rawItem = await FertilizerRecommendation.findById(id);
      else if (mod === 'disease') rawItem = await DiseaseReport.findById(id);
      else if (mod === 'chat') rawItem = await ChatHistory.findById(id);
    } else {
      if (mod === 'crop') rawItem = memoryCropHistory.find(c => (c.id === id || c._id === id));
      else if (mod === 'fertilizer') rawItem = memoryFertilizerHistory.find(f => (f.id === id || f._id === id));
      else if (mod === 'disease') rawItem = memoryDiseaseHistory.find(d => (d.id === id || d._id === id));
      else if (mod === 'chat') rawItem = inMemoryChatHistory.find(ch => (ch.id === id || ch._id === id));
    }

    if (!rawItem) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or already deleted.'
      });
    }

    // Strict multi-tenant security verification
    const itemUserId = rawItem.userId ? rawItem.userId.toString() : '';
    if (itemUserId !== uStr) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this record.'
      });
    }

    // If disease record, clean up scan image file from disk
    if (mod === 'disease' && rawItem.imageFileName) {
      const filePath = path.join(__dirname, '../../uploads/leaf-scans', rawItem.imageFileName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fErr) {
          console.error('[History Controller] Failed to remove leaf image file:', fErr.message);
        }
      }
    }

    // Perform deletion
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      if (mod === 'crop') await CropRecommendation.findByIdAndDelete(id);
      else if (mod === 'fertilizer') await FertilizerRecommendation.findByIdAndDelete(id);
      else if (mod === 'disease') await DiseaseReport.findByIdAndDelete(id);
      else if (mod === 'chat') await ChatHistory.findByIdAndDelete(id);
    } else {
      if (mod === 'crop') {
        const idx = memoryCropHistory.findIndex(c => (c.id === id || c._id === id));
        if (idx !== -1) memoryCropHistory.splice(idx, 1);
      } else if (mod === 'fertilizer') {
        const idx = memoryFertilizerHistory.findIndex(f => (f.id === id || f._id === id));
        if (idx !== -1) memoryFertilizerHistory.splice(idx, 1);
      } else if (mod === 'disease') {
        const idx = memoryDiseaseHistory.findIndex(d => (d.id === id || d._id === id));
        if (idx !== -1) memoryDiseaseHistory.splice(idx, 1);
      } else if (mod === 'chat') {
        const idx = inMemoryChatHistory.findIndex(ch => (ch.id === id || ch._id === id));
        if (idx !== -1) inMemoryChatHistory.splice(idx, 1);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Record deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Clear history for a specific module or all modules for authenticated farmer
 * DELETE /api/history/clear
 */
export async function clearUnifiedHistory(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { module: mod = 'all' } = req.query;
    const uStr = userId.toString();

    const shouldClear = (m) => mod === 'all' || mod === m;

    if (mongoose.connection.readyState === 1) {
      if (shouldClear('crop')) await CropRecommendation.deleteMany({ userId });
      if (shouldClear('fertilizer')) await FertilizerRecommendation.deleteMany({ userId });
      if (shouldClear('disease')) {
        const reports = await DiseaseReport.find({ userId });
        for (const rep of reports) {
          if (rep.imageFileName) {
            const filePath = path.join(__dirname, '../../uploads/leaf-scans', rep.imageFileName);
            if (fs.existsSync(filePath)) {
              try { fs.unlinkSync(filePath); } catch {}
            }
          }
        }
        await DiseaseReport.deleteMany({ userId });
      }
      if (shouldClear('chat')) await ChatHistory.deleteMany({ userId });
    } else {
      if (shouldClear('crop')) {
        const toRem = memoryCropHistory.filter(c => String(c.userId) === uStr);
        for (const r of toRem) {
          const idx = memoryCropHistory.indexOf(r);
          if (idx !== -1) memoryCropHistory.splice(idx, 1);
        }
      }
      if (shouldClear('fertilizer')) {
        const toRem = memoryFertilizerHistory.filter(f => String(f.userId) === uStr);
        for (const r of toRem) {
          const idx = memoryFertilizerHistory.indexOf(r);
          if (idx !== -1) memoryFertilizerHistory.splice(idx, 1);
        }
      }
      if (shouldClear('disease')) {
        const toRem = memoryDiseaseHistory.filter(d => String(d.userId) === uStr);
        for (const r of toRem) {
          const idx = memoryDiseaseHistory.indexOf(r);
          if (idx !== -1) memoryDiseaseHistory.splice(idx, 1);
        }
      }
      if (shouldClear('chat')) {
        const toRem = inMemoryChatHistory.filter(ch => String(ch.userId) === uStr);
        for (const r of toRem) {
          const idx = inMemoryChatHistory.indexOf(r);
          if (idx !== -1) inMemoryChatHistory.splice(idx, 1);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `History cleared successfully for ${mod === 'all' ? 'all modules' : mod}.`
    });
  } catch (error) {
    next(error);
  }
}

