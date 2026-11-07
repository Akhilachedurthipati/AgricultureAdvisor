import { z } from 'zod';
import mongoose from 'mongoose';
import ChatHistory from '../models/ChatHistory.js';
import { processFarmingQuery } from '../services/ai.service.js';

// Input validation schema
export const chatInputSchema = z.object({
  message: z
    .string({ required_error: 'Query message is required' })
    .trim()
    .min(2, { message: 'Query message must be at least 2 characters long' })
    .max(1500, { message: 'Query message cannot exceed 1500 characters' }),
  language: z
    .string()
    .trim()
    .default('en'),
  isVoice: z
    .boolean()
    .optional()
    .default(false)
});

// In-memory chat store fallback for offline test environments
export const inMemoryChatHistory = [];

/**
 * Handle incoming farmer AI chat query
 * POST /api/chat/message
 */
export async function handleChatMessage(req, res, next) {
  try {
    const parseResult = chatInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chat query parameters',
        errors: parseResult.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    const { message, language, isVoice } = parseResult.data;
    const userId = req.user?.id || req.user?._id;

    // Process agricultural query
    const consultation = await processFarmingQuery({
      message,
      language: language || req.user?.preferredLanguage || 'en',
      isVoice
    });

    let savedRecord = null;

    // Persist to MongoDB if connected, else fallback to in-memory store
    if (mongoose.connection.readyState === 1 && userId) {
      try {
        savedRecord = await ChatHistory.create({
          userId,
          message: consultation.message,
          response: consultation.response,
          language: consultation.language,
          category: consultation.category,
          isVoice: consultation.isVoice,
          tokensUsed: consultation.tokensUsed
        });
      } catch (dbErr) {
        // Non-blocking log if DB write fails
        console.error('[Chat Controller] Failed to persist chat record to DB:', dbErr.message);
      }
    }

    if (!savedRecord) {
      const mockId = `mem_chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      savedRecord = {
        _id: mockId,
        id: mockId,
        userId: userId ? userId.toString() : 'guest',
        message: consultation.message,
        response: consultation.response,
        language: consultation.language,
        category: consultation.category,
        isVoice: consultation.isVoice,
        tokensUsed: consultation.tokensUsed,
        createdAt: new Date().toISOString()
      };
      inMemoryChatHistory.unshift(savedRecord);
    }

    return res.status(200).json({
      success: true,
      message: 'Agricultural advisory consultation generated successfully.',
      data: {
        id: savedRecord._id || savedRecord.id,
        message: consultation.message,
        response: consultation.response,
        language: consultation.language,
        category: consultation.category,
        isVoice: consultation.isVoice,
        source: consultation.source,
        createdAt: savedRecord.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetch authenticated farmer's past chat history
 * GET /api/chat/history
 */
export async function getChatHistory(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

    let history = [];

    if (mongoose.connection.readyState === 1 && userId) {
      history = await ChatHistory.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    } else {
      const uStr = userId ? userId.toString() : 'guest';
      history = inMemoryChatHistory
        .filter((c) => c.userId === uStr)
        .slice(0, limit);
    }

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Clear authenticated farmer's chat history
 * DELETE /api/chat/history
 */
export async function clearChatHistory(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;

    if (mongoose.connection.readyState === 1 && userId) {
      await ChatHistory.deleteMany({ userId });
    } else {
      const uStr = userId ? userId.toString() : 'guest';
      const toRemove = inMemoryChatHistory.filter((c) => c.userId === uStr);
      for (const item of toRemove) {
        const idx = inMemoryChatHistory.indexOf(item);
        if (idx !== -1) inMemoryChatHistory.splice(idx, 1);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation history cleared successfully.'
    });
  } catch (error) {
    next(error);
  }
}

