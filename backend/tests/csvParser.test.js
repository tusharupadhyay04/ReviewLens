import { parseCSV } from '../src/services/csvParser.js';

describe('CSV Parser', () => {
  test('parses valid reviews correctly', async () => {
    const csv = Buffer.from(
      'id,product,rating,text\nR1,Headphones,5,"Great sound!"\nR2,Shoes,4,"Very comfy"'
    );
    const result = await parseCSV(csv);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('R1');
    expect(result[0].rating).toBe(5);
    expect(result[0].status).toBe('pending');
  });

  test('skips rows with empty text', async () => {
    const csv = Buffer.from('id,product,rating,text\nR1,Headphones,5,""\nR2,Shoes,4,"Good"');
    const result = await parseCSV(csv);
    expect(result[0].status).toBe('skipped');
    expect(result[1].status).toBe('pending');
  });

  test('treats out-of-range rating (7) as null', async () => {
    const csv = Buffer.from('id,product,rating,text\nR1,Headphones,7,"Good product"');
    const result = await parseCSV(csv);
    expect(result[0].rating).toBeNull();
  });

  test('treats missing rating as null', async () => {
    const csv = Buffer.from('id,product,rating,text\nR1,Headphones,,"Good product"');
    const result = await parseCSV(csv);
    expect(result[0].rating).toBeNull();
  });

  test('treats non-numeric rating as null', async () => {
    const csv = Buffer.from('id,product,rating,text\nR1,Headphones,abc,"Good product"');
    const result = await parseCSV(csv);
    expect(result[0].rating).toBeNull();
  });

  test('detects exact-text duplicates', async () => {
    const csv = Buffer.from(
      'id,product,rating,text\n' +
      'R1,Headphones,5,"Great sound!"\n' +
      'R6,Headphones,5,"Great sound!"'
    );
    const result = await parseCSV(csv);
    expect(result[0].status).toBe('pending');
    expect(result[1].status).toBe('duplicate');
    expect(result[1].isDuplicate).toBe(true);
    expect(result[1].duplicateOf).toBe('R1');
  });

  test('deduplication is case-insensitive', async () => {
    const csv = Buffer.from(
      'id,product,rating,text\n' +
      'R1,Headphones,1,"WORST PRODUCT EVER. BROKE AFTER 2 DAYS."\n' +
      'R2,Headphones,1,"worst product ever. broke after 2 days."'
    );
    const result = await parseCSV(csv);
    expect(result[1].status).toBe('duplicate');
  });

  test('handles Hinglish reviews correctly', async () => {
    const csv = Buffer.from(
      'id,product,rating,text\nR1,Shoes,5,"Bahut achhi shoes hain, bilkul comfortable hain."'
    );
    const result = await parseCSV(csv);
    expect(result[0].status).toBe('pending');
    expect(result[0].text).toContain('Bahut achhi');
  });
});
