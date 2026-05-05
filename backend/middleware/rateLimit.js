const WINDOW_MS = 60 * 1000;

function createSimpleRateLimiter({ windowMs = WINDOW_MS, max = 60, message = 'Too many requests. Please try again later.' } = {}) {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ message });
    }

    entry.count += 1;
    hits.set(key, entry);
    return next();
  };
}

module.exports = { createSimpleRateLimiter };
