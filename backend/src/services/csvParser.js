import { parse } from 'csv-parse';
import crypto from 'crypto';

/**
 * Auto-detects column name from a list of aliases (case-insensitive).
 */
function detectCol(headers, aliases) {
  for (const alias of aliases) {
    const found = headers.find(h => h.trim().toLowerCase() === alias.toLowerCase());
    if (found) return found;
  }
  return null;
}

/**
 * Parses CSV buffer into structured review objects.
 * Handles: flexible column names, empty reviews, missing/invalid ratings, duplicate detection.
 */
export const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }, (err, data) => {
      if (err) return reject(new Error(`CSV parse error: ${err.message}`));
      if (!data || data.length === 0) return resolve([]);

      // ── Auto-detect column names from whatever headers the CSV has ──────
      const headers = Object.keys(data[0]);
      console.log('📋 CSV headers detected:', headers);

      const idCol      = detectCol(headers, ['id', 'review_id', 'reviewid', 'no', '#', 'num', 'number']);
      const productCol = detectCol(headers, ['product', 'product_name', 'item', 'name', 'title', 'product_title']);
      const ratingCol  = detectCol(headers, ['rating', 'stars', 'score', 'rate', 'star_rating', 'review_rating']);
      const textCol    = detectCol(headers, ['text', 'review', 'review_text', 'comment', 'body', 'message', 'description', 'feedback', 'content', 'review_body']);

      console.log(`🔍 Column mapping → id:"${idCol}" product:"${productCol}" rating:"${ratingCol}" text:"${textCol}"`);

      if (!textCol) {
        return reject(new Error(
          `CSV must have a text/review column. Found columns: ${headers.join(', ')}. ` +
          `Expected one of: text, review, review_text, comment, body, description, feedback`
        ));
      }

      const seen = new Map(); // textHash -> id  (for duplicate detection)
      const results = [];

      for (const row of data) {
        const id      = idCol      ? (row[idCol]      || '').trim() : `ROW_${results.length + 1}`;
        const product = productCol ? (row[productCol] || '').trim() : 'Unknown Product';
        const rawRating = ratingCol ? (row[ratingCol] || '').toString().trim() : '';
        const text    = textCol    ? (row[textCol]    || '').trim() : '';

        // Skip empty reviews
        if (!text) {
          results.push({ id, product, text, status: 'skipped', reason: 'empty_text' });
          continue;
        }

        // Parse rating – treat missing or out-of-range (e.g. 7) as null
        let rating = null;
        if (rawRating !== '') {
          const parsed = parseFloat(rawRating);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
            rating = parsed;
          }
        }

        // Hash text for deduplication (case-insensitive)
        const textHash = crypto
          .createHash('sha256')
          .update(text.toLowerCase().trim())
          .digest('hex');

        if (seen.has(textHash)) {
          results.push({
            id, product, rating, text, textHash,
            status: 'duplicate',
            isDuplicate: true,
            duplicateOf: seen.get(textHash)
          });
          continue;
        }

        seen.set(textHash, id);
        results.push({ id, product, rating, text, textHash, status: 'pending', isDuplicate: false });
      }

      console.log(`✅ CSV parsed: ${results.filter(r=>r.status==='pending').length} valid, ${results.filter(r=>r.status==='skipped').length} skipped, ${results.filter(r=>r.status==='duplicate').length} duplicates`);
      resolve(results);
    });
  });
};
