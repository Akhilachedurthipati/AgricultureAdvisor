import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import DiseaseReport from '../models/DiseaseReport.js';
import { classifyLeafImage } from '../ml/diseaseClassifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Memory fallback store for disease history when MongoDB is not connected
export const memoryDiseaseHistory = [];

/**
 * @desc    Analyze uploaded leaf image and detect disease/pathogen
 * @route   POST /api/disease/detect
 * @access  Private (JWT Protected)
 */
export const detectDisease = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No leaf image uploaded. Please upload a valid JPEG, PNG, or WebP leaf image.'
      });
    }

    const { crop = 'auto' } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const imageUrl = `/uploads/leaf-scans/${fileName}`;

    // Perform Computer Vision Inference
    const diagnosis = await classifyLeafImage(filePath, {
      cropHint: crop,
      fileName: req.file.originalname
    });

    if (!diagnosis.isConclusive) {
      // Clean up uploaded image if inconclusive / not a leaf
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupErr) {
        console.warn('[DiseaseController] Failed to delete inconclusive image:', cleanupErr.message);
      }

      return res.status(422).json({
        success: false,
        isConclusive: false,
        message: diagnosis.message || 'Image does not contain recognizable plant leaf tissue.',
        details: diagnosis
      });
    }

    const userId = req.user?._id || req.user?.id;
    const reportData = {
      userId,
      crop: diagnosis.crop || crop || 'General Foliar',
      imageUrl,
      imageFileName: fileName,
      imageMimeType: req.file.mimetype,
      imageSize: req.file.size,
      detection: {
        crop: diagnosis.crop,
        diseaseName: diagnosis.diseaseName,
        scientificName: diagnosis.scientificName,
        isHealthy: diagnosis.isHealthy,
        confidenceScore: diagnosis.confidenceScore,
        severity: diagnosis.severity,
        affectedAreaPercentage: diagnosis.affectedAreaPercentage,
        symptoms: diagnosis.symptoms,
        causes: diagnosis.causes,
        prevention: diagnosis.prevention,
        treatment: diagnosis.treatment
      },
      featuresExtracted: diagnosis.featuresExtracted,
      disclaimer: diagnosis.disclaimer
    };

    let savedReport = null;

    // Persist in MongoDB or fallback memory store
    if (userId) {
      if (mongoose.connection.readyState === 1) {
        savedReport = await DiseaseReport.create(reportData);
      } else {
        savedReport = {
          _id: `mem_dis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          ...reportData,
          createdAt: new Date().toISOString()
        };
        memoryDiseaseHistory.unshift(savedReport);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Foliar pathology screening completed successfully.',
      data: savedReport || reportData
    });
  } catch (error) {
    // If error occurs, attempt to clean up uploaded file
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    next(error);
  }
};

/**
 * @desc    Get user's disease detection scan history
 * @route   GET /api/disease/history
 * @access  Private (JWT Protected)
 */
export const getDiseaseHistory = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access scan history.'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const history = await DiseaseReport.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      return res.status(200).json({
        success: true,
        count: history.length,
        data: history
      });
    }

    // Memory fallback
    const userHistory = memoryDiseaseHistory
      .filter(item => String(item.userId) === String(userId))
      .slice(0, 50);

    return res.status(200).json({
      success: true,
      count: userHistory.length,
      data: userHistory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single disease detection report by ID
 * @route   GET /api/disease/:id
 * @access  Private (JWT Protected)
 */
export const getDiseaseReportById = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const report = await DiseaseReport.findById(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Diagnostic report not found.'
        });
      }

      if (String(report.userId) !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this diagnostic report.'
        });
      }

      return res.status(200).json({
        success: true,
        data: report
      });
    }

    const report = memoryDiseaseHistory.find(
      r => String(r._id) === String(id) && String(r.userId) === String(userId)
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic report not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete disease report and its associated scan image
 * @route   DELETE /api/disease/:id
 * @access  Private (JWT Protected)
 */
export const deleteDiseaseReport = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;

    let targetReport = null;

    if (mongoose.connection.readyState === 1) {
      targetReport = await DiseaseReport.findById(id);
      if (!targetReport) {
        return res.status(404).json({
          success: false,
          message: 'Diagnostic report not found.'
        });
      }

      if (String(targetReport.userId) !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this diagnostic report.'
        });
      }

      await targetReport.deleteOne();
    } else {
      const idx = memoryDiseaseHistory.findIndex(
        r => String(r._id) === String(id) && String(r.userId) === String(userId)
      );
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Diagnostic report not found.'
        });
      }
      targetReport = memoryDiseaseHistory.splice(idx, 1)[0];
    }

    // Delete image file from filesystem if exists
    if (targetReport?.imageFileName) {
      const fullPath = path.resolve(__dirname, '../../uploads/leaf-scans', targetReport.imageFileName);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (unlinkErr) {
          console.warn('[DiseaseController] Failed to unlink file:', unlinkErr.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Diagnostic report and leaf scan image removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};
