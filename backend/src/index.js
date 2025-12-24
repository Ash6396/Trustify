const env = require('./config/env');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { connectDB } = require('./config/db');
const { apiRateLimit } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./utils/errors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const donationRoutes = require('./routes/donationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const daoRoutes = require('./routes/daoRoutes');

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('[unhandledRejection]', reason);
});

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('[uncaughtException]', err);
  process.exit(1);
});

async function start() {
  const app = express();
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));
  app.use('/api', apiRateLimit);

  app.get('/api/health', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/dao', daoRoutes);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on http://localhost:${env.PORT}`);
  });

  // Connect in the background so deploys don't fail if Atlas/network rules are still propagating.
  connectDB(env.MONGODB_URI).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[db] initial connection failed (server still running):', err);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[startup] failed', err);
  process.exit(1);
});
