import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    response: {
      type: String,
      required: true,
      trim: true
    },
    language: {
      type: String,
      default: 'en',
      trim: true
    },
    category: {
      type: String,
      enum: ['crop', 'fertilizer', 'disease', 'weather', 'pest_control', 'schemes', 'general'],
      default: 'general'
    },
    isVoice: {
      type: Boolean,
      default: false
    },
    tokensUsed: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound index for user query sorting
chatHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ChatHistory', chatHistorySchema);

