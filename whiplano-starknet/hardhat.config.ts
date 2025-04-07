import { HardhatUserConfig } from "hardhat/config";
import "@shardlabs/starknet-hardhat-plugin";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  starknet: {
    venv: "active",
    network: process.env.STARKNET_NETWORK || "alpha-goerli",
    wallets: {
      OpenZeppelin: {
        accountName: "OpenZeppelin",
        modulePath: "starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount",
        accountPath: "~/.starknet_accounts"
      }
    }
  },
  networks: {
    devnet: {
      url: "http://localhost:5050"
    },
    "alpha-goerli": {
      url: `https://alpha4.starknet.io`
    },
    "alpha-mainnet": {
      url: `https://alpha-mainnet.starknet.io`
    }
  }
};

export default config; 