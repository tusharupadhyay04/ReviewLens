describe('Retry & Batching Logic', () => {
  test('exponential backoff delays double correctly', () => {
    const BASE = 1000;
    const delays = [0, 1, 2, 3].map(n => BASE * Math.pow(2, n));
    expect(delays).toEqual([1000, 2000, 4000, 8000]);
  });

  test('max retries cap is respected', () => {
    const MAX_RETRIES = 3;
    let attempts = 0;
    const shouldRetry = (retryCount) => retryCount < MAX_RETRIES;

    while (shouldRetry(attempts)) attempts++;
    expect(attempts).toBe(MAX_RETRIES);
  });

  test('batching splits reviews into correct chunk sizes', () => {
    const reviews = Array.from({ length: 12 }, (_, i) => ({ id: `R${i + 1}` }));
    const BATCH_SIZE = 5;
    const batches = [];
    for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
      batches.push(reviews.slice(i, i + BATCH_SIZE));
    }
    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(5);
    expect(batches[1]).toHaveLength(5);
    expect(batches[2]).toHaveLength(2);
  });

  test('a single review produces one-element batch', () => {
    const reviews = [{ id: 'R1', text: 'Great!' }];
    const BATCH_SIZE = 5;
    const batches = [];
    for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
      batches.push(reviews.slice(i, i + BATCH_SIZE));
    }
    expect(batches).toHaveLength(1);
    expect(batches[0]).toHaveLength(1);
  });

  test('rate-limit detection covers status 429 and message patterns', () => {
    const isRateLimit = (err) =>
      err?.status === 429 || /rate.?limit/i.test(err?.message || '');

    expect(isRateLimit({ status: 429 })).toBe(true);
    expect(isRateLimit({ message: 'rate limit exceeded' })).toBe(true);
    expect(isRateLimit({ message: 'RateLimit hit' })).toBe(true);
    expect(isRateLimit({ status: 500 })).toBe(false);
    expect(isRateLimit({ message: 'timeout' })).toBe(false);
  });
});
