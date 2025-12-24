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

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error('No deployer signer available. Set DEPLOYER_PRIVATE_KEY/PRIVATE_KEY in environment.');
  }

  console.log('Deployer:', deployer.address);

  const balanceWei = await deployer.provider.getBalance(deployer.address);
  console.log('Deployer balance (SepoliaETH):', formatEth(balanceWei));

  const Trustify = await hre.ethers.getContractFactory('Trustify');

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
        'Fund the deployer address from a Sepolia faucet, then rerun this deploy.',
      ].join('\n')
    );
  }

  const contract = await Trustify.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('Trustify deployed to:', address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
