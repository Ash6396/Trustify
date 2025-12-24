const env = require('../config/env');

function getChainConfig() {
  return {
    rpcUrl: env.CHAIN_RPC_URL,
    chainId: env.CHAIN_ID,
    contractAddress: env.CHAIN_CONTRACT_ADDRESS
  };
}

module.exports = { getChainConfig };
