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
  alchemyApiKey1,
  alchemyApiKey2,
  main_alchemyApiKey,
  mnemonic_matemask_account1,
  mnemonic_matemask_account9,
  mnemonic_matemask_account10,
  mnemonic_matemask_account11,
  mnemonic_matemask_account12,
  mnemonic_matemask_account22,

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
        runs: 10,
      },
    },
  },
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || '',
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    //升级地址 invite合约管理地址
    polygon_main_account12: {
      url: process.env.POLYGON_URL_MAIN + main_alchemyApiKey || '',
      accounts: { mnemonic: mnemonic_matemask_account12 },
      gas: 2100000,
      gasPrice: 500000000000,
    },
    //管理地址
    polygon_main_account1: {
      url: process.env.POLYGON_URL_MAIN + main_alchemyApiKey || '',
      accounts: { mnemonic: mnemonic_matemask_account1 },
      gas: 2100000,
      gasPrice: 50000000000,
    },
    //资产管理地址：zack 0xB879C52F1B7C2E366410b2718924a306d098B9d9
    //用户代币管理地址：
    polygon_main_account9: {
      url: process.env.POLYGON_URL_MAIN + main_alchemyApiKey || '',
      accounts: { mnemonic: mnemonic_matemask_account9 },
      gas: 2100000,
      gasPrice: 50000000000,
    },
    polygon_test_account1: {
      url: process.env.POLYGON_URL_A + alchemyApiKey2 || '',
      accounts: { mnemonic: mnemonic_matemask_account1 },
      gas: 2100000,
      gasLimit: 30000000,
      gasPrice: 50000000000,
    },
    polygon_test_account9: {
      url: process.env.POLYGON_URL_A + alchemyApiKey || '',
      accounts: { mnemonic: mnemonic_matemask_account9 },
    },
    polygon_test_account10: {
      url: process.env.POLYGON_URL_A + alchemyApiKey || '',
      accounts: { mnemonic: mnemonic_matemask_account10 },
      gas: 2100000,
      gasPrice: 8000000000,
    },
    polygon_test_account11: {
      url: process.env.POLYGON_URL_A + alchemyApiKey || '',
      accounts: { mnemonic: mnemonic_matemask_account11 },
      gas: 2100000,
      gasPrice: 8000000000,
    },
    polygon_test_account12: {
      url: process.env.POLYGON_URL_A + alchemyApiKey || '',
      accounts: { mnemonic: mnemonic_matemask_account12 },
      gas: 2100000,
      gasPrice: 8000000000,
    },
    polygon_test_account22: {
      url: process.env.POLYGON_URL_A + alchemyApiKey || '',
      accounts: { mnemonic: mnemonic_matemask_account22 },
      gas: 2100000,
      // gasPrice: 8000000000,
    },
    local_account1: {
      url: 'http://127.0.0.1:8545',
      accounts: ['0x981fc499705439ea548be509dde0607668d3ab31b4ad1d253de216fc3ab07d99'],
      gas: 2100000,
    },
    local_matamask_account1: {
      url: 'http://127.0.0.1:8545',
      accounts: { mnemonic: mnemonic_matemask_account1 },
      gas: 2100000,
      gasLimit: 30000000,
      gasPrice: 50000000000,
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
