import { HardhatUserConfig } from "hardhat/config";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "your private key";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // If you want to do some forking, uncomment this
      // forking: {
      //   url: "https://rpc.bitkubchain.io",
      // },
      // blockGasLimit: 60_000_000,
      // gasPrice: 5_000_000_000,
    },
    bitkubChainMainnet: {
      chainId: 96,
      url: "https://rpc.bitkubchain.io",
      // accounts: [`0x${PRIVATE_KEY}`],
      blockGasLimit: 60_000_000,
      gasPrice: 5_000_000_000,
    },
    bitkubChainTestnet: {
      chainId: 25925,
      url: "https://rpc-testnet.bitkubchain.io",
      // accounts: [`0x${PRIVATE_KEY}`],
      blockGasLimit: 60_000_000,
      gasPrice: 5_000_000_000,
    },
  },
  solidity: {
    version: "0.8.15",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  contractSizer: {
    runOnCompile: true,
    strict: true,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "KUB",
    gasPrice: 5_000_000_000,
  },
};

export default config;
