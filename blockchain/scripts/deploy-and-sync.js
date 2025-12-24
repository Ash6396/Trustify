const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

function formatEth(wei) {
  try {
    return hre.ethers.formatEther(wei);
  } catch {
    return String(wei);
  }
}

async function estimateDeployCostWei(deployer, factory) {
  const txReq = await factory.getDeployTransaction();
  const gasEstimate = await deployer.estimateGas(txReq);
  const feeData = await deployer.provider.getFeeData();
  const perGas = feeData.maxFeePerGas ?? feeData.gasPrice;
  if (!perGas) {
    throw new Error('Could not determine gas price/maxFeePerGas from provider');
  }
  return gasEstimate * perGas;
}

function upsertEnvVar(envText, key, value) {
  const lines = envText.split(/\r?\n/);
  let found = false;
  const out = lines.map((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=.*$/i);
    if (!m) return line;
    const k = m[1];
    if (k !== key) return line;
    found = true;
    return `${key}=${value}`;
  });
  if (!found) out.push(`${key}=${value}`);
  // ensure trailing newline
  return out.join('\n').replace(/\n?$/, '\n');
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error('No deployer signer available. Set DEPLOYER_PRIVATE_KEY/PRIVATE_KEY in blockchain/.env');
  }

  console.log('Deployer:', deployer.address);

  const Trustify = await hre.ethers.getContractFactory('Trustify');

  const balanceWei = await deployer.provider.getBalance(deployer.address);
  console.log('Deployer balance (SepoliaETH):', formatEth(balanceWei));

  let estimatedCostWei = null;
  try {
    estimatedCostWei = await estimateDeployCostWei(deployer, Trustify);
    console.log('Estimated deploy cost (SepoliaETH):', formatEth(estimatedCostWei));
  } catch (e) {
    console.warn('WARN: Could not estimate deploy cost. Reason:', e?.message ?? e);
  }

  if (estimatedCostWei != null && balanceWei < estimatedCostWei) {
    throw new Error(
      [
        'Insufficient funds to deploy.',
        `Balance: ${formatEth(balanceWei)} SepoliaETH`,
        `Estimated cost: ${formatEth(estimatedCostWei)} SepoliaETH`,
        'Fund the deployer address from a Sepolia faucet, then rerun this script.',
      ].join('\n')
    );
  }

  const contract = await Trustify.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('Trustify deployed to:', address);

  // Sync into frontend/.env
  const repoRoot = path.resolve(__dirname, '..', '..');
  const frontendEnvPath = path.join(repoRoot, 'frontend', '.env');

  if (!fs.existsSync(frontendEnvPath)) {
    console.warn('WARN: frontend/.env not found at', frontendEnvPath);
    return;
  }

  const current = fs.readFileSync(frontendEnvPath, 'utf8');
  const next = upsertEnvVar(current, 'VITE_CONTRACT_ADDRESS', address);
  fs.writeFileSync(frontendEnvPath, next, 'utf8');

  console.log('Updated frontend/.env: VITE_CONTRACT_ADDRESS=', address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
