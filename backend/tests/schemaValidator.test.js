import { validateSchema } from '../src/services/groqService.js';

describe('Schema Validator', () => {
  const valid = {
    sentiment: 'positive',
    topics: ['quality', 'price'],
    summary: 'Customer loved the quality and found it affordable.',
    needs_reply: false
  };

  test('accepts a fully valid schema', () => {
    expect(validateSchema(valid)).toBe(true);
  });

  test('accepts all three sentiments', () => {
    expect(validateSchema({ ...valid, sentiment: 'neutral' })).toBe(true);
    expect(validateSchema({ ...valid, sentiment: 'negative' })).toBe(true);
  });

  test('rejects invalid sentiment value', () => {
    expect(validateSchema({ ...valid, sentiment: 'amazing' })).toBe(false);
    expect(validateSchema({ ...valid, sentiment: '' })).toBe(false);
    expect(validateSchema({ ...valid, sentiment: null })).toBe(false);
  });

  test('rejects unknown topics', () => {
    expect(validateSchema({ ...valid, topics: ['amazing_quality'] })).toBe(false);
  });

  test('rejects empty topics array', () => {
    expect(validateSchema({ ...valid, topics: [] })).toBe(false);
  });

  test('rejects non-array topics', () => {
    expect(validateSchema({ ...valid, topics: 'quality' })).toBe(false);
  });

  test('rejects missing or empty summary', () => {
    expect(validateSchema({ ...valid, summary: '' })).toBe(false);
    expect(validateSchema({ ...valid, summary: '   ' })).toBe(false);
    const { summary: _, ...noSummary } = valid;
    expect(validateSchema(noSummary)).toBe(false);
  });

  test('rejects non-boolean needs_reply', () => {
    expect(validateSchema({ ...valid, needs_reply: 'yes' })).toBe(false);
    expect(validateSchema({ ...valid, needs_reply: 1 })).toBe(false);
    expect(validateSchema({ ...valid, needs_reply: null })).toBe(false);
  });

  test('rejects null, undefined, and primitive inputs', () => {
    expect(validateSchema(null)).toBe(false);
    expect(validateSchema(undefined)).toBe(false);
    expect(validateSchema('string')).toBe(false);
    expect(validateSchema(42)).toBe(false);
    expect(validateSchema([])).toBe(false);
  });

  test('accepts all valid topic values', () => {
    const topics = ['quality', 'price', 'shipping', 'customer_service', 'packaging', 'other'];
    expect(validateSchema({ ...valid, topics })).toBe(true);
  });
});
