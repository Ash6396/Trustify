const fs = require('fs');
const { ethers } = require('ethers');

function readEnvFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const map = new Map();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    map.set(key, value);
  }
  return map;
}

async function main() {
  const env = readEnvFile('.env');
  const rpc = env.get('VITE_RPC_URL');
  const addr = env.get('VITE_CONTRACT_ADDRESS');
  const chainId = Number(env.get('VITE_CHAIN_ID') || '11155111');

  if (!rpc) throw new Error('Missing VITE_RPC_URL in frontend/.env');
  if (!addr) throw new Error('Missing VITE_CONTRACT_ADDRESS in frontend/.env');

  const provider = new ethers.JsonRpcProvider(rpc, chainId);
  try {
    const net = await provider.getNetwork();
    const code = await provider.getCode(addr);
    console.log('network:', net.name, String(net.chainId));
    console.log('contractAddress:', addr);
    console.log('bytecodePrefix:', code.slice(0, 10));
    console.log('bytecodeBytes:', code.length);
    console.log('isDeployed:', code !== '0x');
  } finally {
    try {
      provider.destroy();
    } catch {
      // ignore
    }
  }
}

main().catch((e) => {
  console.error('ERROR:', e?.message || e);
  process.exitCode = 1;
});
