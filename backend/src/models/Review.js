import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true },
  product: { type: String, required: true },
  rating: { type: Number, default: null },
  text: { type: String, required: true },
  textHash: { type: String, required: true, unique: true },

  // AI Analysis
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'error'],
    default: null
  },
  topics: [{
    type: String,
    enum: ['quality', 'price', 'shipping', 'customer_service', 'packaging', 'other']
  }],
  summary: { type: String, default: null },
  needs_reply: { type: Boolean, default: false },

  // Bonus B1: Rating vs Sentiment mismatch
  ratingMismatch: { type: Boolean, default: false },

  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'analysed', 'error', 'duplicate', 'skipped'],
    default: 'pending'
  },
  isDuplicate: { type: Boolean, default: false },

  // Cache metadata
  fromCache: { type: Boolean, default: false },
  analysedAt: { type: Date, default: null },
  uploadSession: { type: String, default: null }
}, { timestamps: true });

reviewSchema.index({ product: 1 });
reviewSchema.index({ sentiment: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ uploadSession: 1 });
reviewSchema.index({ needs_reply: 1 });
reviewSchema.index({ ratingMismatch: 1 });

export default mongoose.model('Review', reviewSchema);
