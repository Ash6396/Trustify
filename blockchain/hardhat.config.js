require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

const SEPOLIA_RPC_URL = process.env.CHAIN_RPC_URL || process.env.SEPOLIA_RPC_URL || '';
const RAW_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY || '';

function normalizePrivateKey(input) {
  if (!input) return '';
  return String(input)
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/^0x/i, '')
    .trim();
}

function isHex(str) {
  return /^[0-9a-fA-F]+$/.test(str);
}

const NORMALIZED_PRIVATE_KEY = normalizePrivateKey(RAW_PRIVATE_KEY);

let accounts = [];
if (NORMALIZED_PRIVATE_KEY) {
  if (!isHex(NORMALIZED_PRIVATE_KEY)) {
    // eslint-disable-next-line no-console
    console.warn('[hardhat] Private key is not valid hex. Check blockchain/.env');
  } else if (NORMALIZED_PRIVATE_KEY.length === 40) {
    // eslint-disable-next-line no-console
    console.warn('[hardhat] You appear to have set a wallet ADDRESS (40 hex chars) instead of a private key (64 hex chars).');
    // eslint-disable-next-line no-console
    console.warn('[hardhat] In MetaMask: Account details → Export Private Key. Paste it into DEPLOYER_PRIVATE_KEY.');
  } else if (NORMALIZED_PRIVATE_KEY.length !== 64) {
    // eslint-disable-next-line no-console
    console.warn(`[hardhat] Private key length is ${NORMALIZED_PRIVATE_KEY.length} hex chars; expected 64.`);
  } else {
    accounts = ['0x' + NORMALIZED_PRIVATE_KEY];
  }
}

if (!SEPOLIA_RPC_URL) {
  // eslint-disable-next-line no-console
  console.warn('[hardhat] Missing SEPOLIA RPC URL. Set CHAIN_RPC_URL or SEPOLIA_RPC_URL in blockchain/.env');
}
if (!RAW_PRIVATE_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[hardhat] Missing deployer private key. Set DEPLOYER_PRIVATE_KEY or PRIVATE_KEY in blockchain/.env');
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts
    }
  }
};
