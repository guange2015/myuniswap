import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();
  
  for (const account of accounts) {
    console.log(account.address);
  }
});



// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();
const mnemonic = process.env.MNEMONIC;

const config: HardhatUserConfig = {
  defaultNetwork: "kovan",
  networks: {
    hardhat: {
    },
    kovan: {
      url: "https://eth-kovan.alchemyapi.io/v2/_-ujxbv-FqFBsTabUAIF6HKRuD3nqvwu",
      // accounts: ['49c794db293f4a6e8422107495b0610017b6f1b2972fa975d9331d39c507d453']
      accounts: {
        mnemonic: mnemonic
      },
      timeout: 600000,
    },
  },
  solidity: {
    compilers: [
      {version: '0.7.3'},
      {version: '0.6.12'}
    ]
  },

  mocha: {
    timeout: 60000
  }
};

export default config;

