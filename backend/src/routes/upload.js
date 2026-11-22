import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { parseCSV } from '../services/csvParser.js';
import { analyseReviewsBatch, analyseWithValidation, validateSchema } from '../services/groqService.js';
import { checkCache, saveReviews } from '../services/cacheService.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

const BATCH_SIZE = 5; // reviews per Groq request

/**
 * Detect mismatch between star rating and AI sentiment. (Bonus B1)
 * 4-5 stars with negative sentiment  → mismatch
 * 1-2 stars with positive sentiment  → mismatch
 */
function detectMismatch(rating, sentiment) {
  if (!rating || !sentiment || sentiment === 'error') return false;
  if (rating >= 4 && sentiment === 'negative') return true;
  if (rating <= 2 && sentiment === 'positive') return true;
  return false;
}

router.post('/', upload.single('csv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No CSV file uploaded' });

  const startTime = Date.now();
  const sessionId = uuidv4();

  try {
    // ── Step 1: Parse CSV ───────────────────────────────────────────────
    console.log(`📤 Upload received: ${req.file.originalname} (${req.file.size} bytes)`);
    const parsed = await parseCSV(req.file.buffer);
    console.log(`📊 Parsed ${parsed.length} rows total`);

    const skipped    = parsed.filter(r => r.status === 'skipped');
    const duplicates = parsed.filter(r => r.status === 'duplicate');
    const valid      = parsed.filter(r => r.status === 'pending');

    // ── Step 2: Cache check ─────────────────────────────────────────────
    const { cached, notCached } = await checkCache(valid);

    let aiCallsMade    = 0;
    let servedFromCache = cached.length;
    const analysedResults = [...cached];

    // ── Step 3: Batch-analyse uncached reviews ──────────────────────────
    console.log(`🤖 Starting AI analysis: ${notCached.length} reviews, ${cached.length} from cache`);
    for (let i = 0; i < notCached.length; i += BATCH_SIZE) {
      const batch = notCached.slice(i, i + BATCH_SIZE);
      console.log(`⚡ Processing batch ${Math.floor(i/BATCH_SIZE)+1}: ${batch.length} reviews`);

      try {
        const batchResults = await analyseReviewsBatch(batch);
        aiCallsMade++;

        for (let j = 0; j < batch.length; j++) {
          const review = batch[j];
          let result = batchResults[j];

          // If batch result is invalid, fall back to individual retry
          if (!result || !validateSchema(result)) {
            console.warn(`⚠️  Batch result invalid for ${review.id} – retrying individually…`);
            result = await analyseWithValidation(review);
            aiCallsMade++;
          } else {
            result = { ...result, status: 'analysed' };
          }

          analysedResults.push({
            ...review,
            ...result,
            ratingMismatch: detectMismatch(review.rating, result.sentiment),
            fromCache: false,
            analysedAt: new Date(),
            uploadSession: sessionId
          });
        }

        // Small courtesy delay between batches
        if (i + BATCH_SIZE < notCached.length) {
          await new Promise(r => setTimeout(r, 300));
        }

      } catch (err) {
        console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, err.message);
        for (const review of batch) {
          analysedResults.push({
            ...review,
            sentiment: 'error',
            topics: ['other'],
            summary: 'Analysis failed.',
            needs_reply: false,
            status: 'error',
            ratingMismatch: false,
            fromCache: false,
            uploadSession: sessionId
          });
        }
      }
    }

    // ── Step 4: Persist new results to MongoDB ──────────────────────────
    const toSave = analysedResults.filter(r => r.textHash && !r.fromCache);
    const savedDocs = await saveReviews(toSave);

    // Build a map of textHash → _id so we can enrich the response
    const savedMap = new Map((savedDocs || []).map(d => [d.textHash, d._id?.toString()]));

    // Enrich analysedResults with real _id from DB
    const enrichedResults = analysedResults.map(r => ({
      ...r,
      _id: r._id || savedMap.get(r.textHash) || undefined
    }));

    const processingTime = Date.now() - startTime;

    // ── Step 5: Return unified response ────────────────────────────────
    res.json({
      success: true,
      sessionId,
      stats: {
        total: parsed.length,
        analysed: enrichedResults.filter(r => r.status === 'analysed').length,
        fromCache: servedFromCache,
        aiCallsMade,
        errors: enrichedResults.filter(r => r.status === 'error').length,
        skipped: skipped.length,
        duplicates: duplicates.length,
        processingTime,
        processingTimeFormatted: `${(processingTime / 1000).toFixed(1)}s`
      },
      reviews: [
        ...enrichedResults,
        ...skipped.map(r => ({ ...r })),
        ...duplicates.map(r => ({ ...r }))
      ]
    });

  } catch (err) {
    console.error('Upload processing error:', err);
    res.status(500).json({ error: `Processing failed: ${err.message}` });
  }
});

export default router;
