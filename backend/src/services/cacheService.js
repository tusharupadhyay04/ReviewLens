import Review from '../models/Review.js';

/**
 * Split parsed reviews into cached (already in DB) vs not cached.
 */
export const checkCache = async (parsedReviews) => {
  const hashes = parsedReviews.filter(r => r.textHash).map(r => r.textHash);
  const existing = await Review.find({ textHash: { $in: hashes }, status: 'analysed' });
  const existingMap = new Map(existing.map(r => [r.textHash, r]));

  const cached = [];
  const notCached = [];

  for (const review of parsedReviews) {
    if (!review.textHash) continue;
    if (existingMap.has(review.textHash)) {
      cached.push({ ...review, ...existingMap.get(review.textHash).toObject(), fromCache: true });
    } else {
      notCached.push(review);
    }
  }

  return { cached, notCached };
};

/**
 * Upsert analysed reviews into MongoDB and return the saved docs with _id.
 */
export const saveReviews = async (reviews) => {
  if (!reviews.length) return [];
  const ops = reviews.map(r => ({
    updateOne: {
      filter: { textHash: r.textHash },
      update: { $set: r },
      upsert: true
    }
  }));
  await Review.bulkWrite(ops);
  // Fetch back the saved docs so we have real MongoDB _id values
  const hashes = reviews.map(r => r.textHash).filter(Boolean);
  const saved = await Review.find({ textHash: { $in: hashes } }).lean();
  return saved;
};
