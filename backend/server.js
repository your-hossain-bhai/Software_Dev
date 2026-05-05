const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config/env');
const { createSimpleRateLimiter } = require('./middleware/rateLimit');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const jobRoutes = require('./routes/job.routes');
const resourceRoutes = require('./routes/resource.routes');
const aiRoutes = require('./routes/ai.routes');
const careerbotRoutes = require('./routes/careerbot.routes');
const adminRoutes = require('./routes/admin.routes');

connectDB();

const app = express();
app.set('trust proxy', 1);

const normalizeOrigin = (origin = '') => origin.trim().replace(/\/+$/, '');

const toOriginMatchers = (origins) => {
  return origins
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean)
    .map((origin) => {
      if (!origin.includes('*')) {
        return { type: 'exact', value: origin };
      }

      const escaped = origin
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');

      return { type: 'pattern', value: new RegExp(`^${escaped}$`) };
    });
};

const isOriginAllowed = (origin, matchers) => {
  const normalized = normalizeOrigin(origin);
  return matchers.some((matcher) => {
    if (matcher.type === 'exact') return matcher.value === normalized;
    return matcher.value.test(normalized);
  });
};

const authLimiter = createSimpleRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts. Please try again later.',
});

const chatLimiter = createSimpleRateLimiter({
  windowMs: 60 * 1000,
  max: 40,
  message: 'Too many chat requests. Please slow down and try again.',
});
const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://nextcareer-w6qe.onrender.com',
];

const envOrigins = (
  process.env.CORS_ORIGINS
  || process.env.FRONTEND_URLS
  || process.env.FRONTEND_URL
  || ''
)
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];
const corsMatchers = toOriginMatchers(allowedOrigins);

console.log('[CORS] Allowed origins:', allowedOrigins.length ? allowedOrigins.join(', ') : '(none)');

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (server-to-server, curl, health checks)
    if (!origin) return callback(null, true);
    if (isOriginAllowed(origin, corsMatchers)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/careerbot', chatLimiter, careerbotRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('NextCareer API is running 🚀');
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  if (err?.message?.startsWith('CORS blocked for origin:')) {
    return res.status(403).json({ message: err.message });
  }
  return next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const isProduction = config.nodeEnv === 'production';
  res.status(500).json({
    message: isProduction ? 'Internal server error.' : (err.message || 'Server error.'),
  });
});

const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`NextCareer backend running on http://localhost:${PORT}`);
});
