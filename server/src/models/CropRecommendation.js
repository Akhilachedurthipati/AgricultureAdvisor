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
      ph: { type: Number, required: false },
      rainfall: { type: Number, required: true },
      landArea: { type: Number, default: 1 },
      location: { type: mongoose.Schema.Types.Mixed },
      npk: { type: mongoose.Schema.Types.Mixed }
    },
    recommendation: {
      cropName: { type: String, required: true },
      confidenceScore: { type: Number, required: true },
      isConfident: { type: Boolean, default: true },
      confidenceLevel: { type: String, enum: ['high', 'moderate', 'low'], default: 'high' },
      uncertaintyWarning: { type: String, default: null },
      suitabilityExplanation: { type: String, required: true },
      cultivationTips: { type: String, required: true },
      agronomicParameters: { type: mongoose.Schema.Types.Mixed },
      suitableCrops: [{ type: mongoose.Schema.Types.Mixed }]
    },
    allocatedLand: [
      {
        cropName: { type: String, required: true },
        acres: { type: Number, required: true }
      }
    ],
    weatherTelemetry: { type: mongoose.Schema.Types.Mixed },
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

