import mongoose from 'mongoose';

const cropRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    inputs: {
      soilType: { type: String, required: true },
      season: { type: String, required: true },
      temperature: { type: Number, required: true },
      humidity: { type: Number, required: true },
      ph: { type: Number, required: true },
      rainfall: { type: Number, required: true }
    },
    recommendation: {
      cropName: { type: String, required: true },
      confidenceScore: { type: Number, required: true },
      suitabilityExplanation: { type: String, required: true },
      cultivationTips: { type: String, required: true },
      agronomicParameters: { type: mongoose.Schema.Types.Mixed }
    },
    disclaimer: {
      type: String,
      default: 'This recommendation is advisory and does not guarantee agricultural yield. Consult certified local agricultural officers.'
    }
  },
  {
    timestamps: true
  }
);

const CropRecommendation = mongoose.model('CropRecommendation', cropRecommendationSchema);
export default CropRecommendation;

