const path = require('path');
const dotenv = require('dotenv');

// Load dotenv FIRST
dotenv.config({ path: path.join(process.cwd(), '.env') });

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`[env] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  CHAIN_RPC_URL: process.env.CHAIN_RPC_URL || '',
  CHAIN_ID: parseInt(process.env.CHAIN_ID || '11155111', 10),
  CHAIN_CONTRACT_ADDRESS: process.env.CHAIN_CONTRACT_ADDRESS || ''
};

module.exports = env;
