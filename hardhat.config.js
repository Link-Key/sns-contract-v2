/* eslint-disable prettier/prettier */
require('dotenv').config()

require('@nomiclabs/hardhat-etherscan')
require('@nomiclabs/hardhat-waffle')
require('hardhat-gas-reporter')
require('solidity-coverage')
require('@nomiclabs/hardhat-ethers')
require('@openzeppelin/hardhat-upgrades')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const {
  alchemyApiKey,
  infuraKey,
  mnemonic,
  main_alchemyApiKey,
  mnemonic1,
  mnemonic2,
  mnemonic_matemask,
  mnemonic_zack,
} = require('./secrets.json')
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: '0.8.10',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    // ropsten: {
    //   url: process.env.ROPSTEN_URL || '',
    //   accounts:
    //     process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    // },
    // polygon_main_a: {
    //   url: process.env.POLYGON_URL_MAIN + main_alchemyApiKey || '',
    //   accounts: { mnemonic: mnemonic_matemask },
    // },
    // polygon_test_a: {
    //   url: process.env.POLYGON_URL_A + alchemyApiKey || '',
    //   accounts: { mnemonic: mnemonic_matemask },
    // },
    // polygon_test_i: {
    //   url: process.env.POLYGON_URL_I + infuraKey || '',
    //   accounts: { mnemonic: mnemonic },
    // },
    // kava_test: {
    //   url: 'https://evm.evm-alpha.kava.io' || '',
    //   accounts: { mnemonic: mnemonic },
    // },
    kava_mainnet: {
      url: 'https://evm.kava.io' || '',
      accounts: { mnemonic: mnemonic },
    },

  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
}
