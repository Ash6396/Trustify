const mongoose = require('mongoose');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function redactMongoUri(uri) {
  try {
    const u = new URL(uri);
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    // Fallback redaction for non-standard URIs
    return String(uri).replace(/(mongodb(?:\+srv)?:\/\/)([^@]+)@/i, '$1***@');
  }
}

async function connectDB(mongoUri, opts = {}) {
  const retries = Number.isFinite(opts.retries) ? opts.retries : 10;
  const baseDelayMs = Number.isFinite(opts.baseDelayMs) ? opts.baseDelayMs : 1500;

  if (!mongoUri || String(mongoUri).trim() === '') {
    throw new Error('MONGODB_URI is empty');
  }

  mongoose.set('strictQuery', true);

  // Render can come up before Atlas/network rules propagate; retry helps.
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // eslint-disable-next-line no-console
      console.log(`[db] Connecting to MongoDB (attempt ${attempt}/${retries}) ${redactMongoUri(mongoUri)}`);
      await mongoose.connect(mongoUri);
      // eslint-disable-next-line no-console
      console.log('[db] Connected');
      return mongoose.connection;
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error('[db] Connection failed:', msg);

      if (attempt === retries) {
        // eslint-disable-next-line no-console
        console.error('[db] Giving up. If using MongoDB Atlas, ensure Network Access allows your Render service IPs (or temporarily 0.0.0.0/0) and the connection string/password are correct.');
        throw err;
      }

      const delay = baseDelayMs * attempt;
      // eslint-disable-next-line no-console
      console.log(`[db] Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

module.exports = { connectDB };
