import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config'

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    rinkeby: {
      url: process.env.STAGING_ALCHEMY_KEY || '',
      accounts: [process.env.PRIVATE_KEY as string],
    },
    goerli: {
      url: process.env.GOERLI_KEY || '',
      accounts: [process.env.PRIVATE_KEY as string],
    },
    mainnet: {
      chainId: 137,
      url: process.env.PROD_ALCHEMY_KEY || '',
      accounts: [process.env.PRIVATE_KEY as string]
    }
  },
  etherscan: {
    apiKey: {
      rinkeby: process.env.ETHERSCAN_API_KEY || '',
      goerli: process.env.ETHERSCAN_API_KEY || '',
      polygon: process.env.POLYGONSCAN_API_KEY || ''
    }
  }
};


export default config;
