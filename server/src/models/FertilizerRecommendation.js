import mongoose from 'mongoose';

const fertilizerRecommendationSchema = new mongoose.Schema(
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
      crop: { type: String, required: true },
      nitrogen: { type: Number, required: true },
      phosphorus: { type: Number, required: true },
      potassium: { type: Number, required: true },
      landArea: { type: Number, required: true, default: 1 },
      landAreaUnit: { type: String, default: 'Acres' }
    },
    recommendation: {
      fertilizerCombination: { type: String, required: true },
      nutrientDeficitAnalysis: { type: mongoose.Schema.Types.Mixed },
      dosageBreakdown: { type: mongoose.Schema.Types.Mixed },
      explanations: [{ type: String }],
      applicationGuidance: { type: String },
      safetyPrecautions: [{ type: String }]
    },
    disclaimer: {
      type: String,
      default: 'This fertilizer recommendation is an agronomic advisory based on STCR principles. Confirm with a soil testing laboratory or agricultural extension officer.'
    }
  },
  {
    timestamps: true
  }
);

const FertilizerRecommendation = mongoose.model('FertilizerRecommendation', fertilizerRecommendationSchema);
export default FertilizerRecommendation;

