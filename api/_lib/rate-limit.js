// In-memory, per-instance rate limiting. Serverless instances come and go, so this is a speed bump
// against hammering rather than a hard guarantee; it needs no database.

const buckets = new Map();

/** Count one hit; returns how many are left in the window (negative once over). */
export function hit(key, max, windowMs, now = Date.now()) {
  let bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) {
    bucket = { reset: now + windowMs, count: 0 };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset <= now) buckets.delete(k);
  return max - bucket.count;
}
