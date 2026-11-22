import express from 'express';
import Review from '../models/Review.js';
import { generateReply } from '../services/groqService.js';

const router = express.Router();

// GET /api/reviews — list with optional filters
router.get('/', async (req, res) => {
  try {
    const { product, sentiment, topic, session } = req.query;
    const filter = {};
    if (product)   filter.product = product;
    if (sentiment) filter.sentiment = sentiment;
    if (topic)     filter.topics = { $in: [topic] };
    if (session)   filter.uploadSession = session;

    const reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/insights — dashboard aggregates
router.get('/insights', async (req, res) => {
  try {
    const { session } = req.query;
    const filter = session
      ? { uploadSession: session, status: 'analysed' }
      : { status: 'analysed' };

    const reviews = await Review.find(filter);

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0, error: 0 };
    const negTopics = {}, posTopics = {}, productStats = {};
    let needsReply = 0, mismatches = 0;

    for (const r of reviews) {
      sentimentCounts[r.sentiment] = (sentimentCounts[r.sentiment] || 0) + 1;
      if (r.needs_reply)    needsReply++;
      if (r.ratingMismatch) mismatches++;

      for (const t of r.topics || []) {
        if (r.sentiment === 'negative') negTopics[t] = (negTopics[t] || 0) + 1;
        if (r.sentiment === 'positive') posTopics[t] = (posTopics[t] || 0) + 1;
      }

      if (!productStats[r.product]) {
        productStats[r.product] = { positive: 0, neutral: 0, negative: 0 };
      }
      productStats[r.product][r.sentiment] = (productStats[r.product][r.sentiment] || 0) + 1;
    }

    const top3 = obj =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([topic, count]) => ({ topic, count }));

    const totalWithRating = reviews.filter(r => r.rating && r.sentiment !== 'error').length;
    const agreementRate = totalWithRating > 0
      ? Math.round(((totalWithRating - mismatches) / totalWithRating) * 100)
      : 100;

    res.json({
      total: reviews.length,
      sentimentCounts,
      needsReply,
      mismatches,
      agreementRate,
      topComplaints: top3(negTopics),
      topPraises:    top3(posTopics),
      productStats,
      products: Object.keys(productStats)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/products — distinct product list
router.get('/products', async (req, res) => {
  try {
    const products = await Review.distinct('product');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/:id/reply — generate AI reply on demand
router.post('/:id/reply', async (req, res) => {
  try {
    // Try MongoDB _id first, fall back to custom id field
    let review = null;
    const param = req.params.id;

    // Check if it looks like a MongoDB ObjectId
    if (/^[a-f\d]{24}$/i.test(param)) {
      review = await Review.findById(param);
    }
    // Fallback: search by custom id field (e.g. "R2")
    if (!review) {
      review = await Review.findOne({ id: param });
    }

    if (!review) return res.status(404).json({ error: 'Review not found' });

    const reply = await generateReply(review);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
