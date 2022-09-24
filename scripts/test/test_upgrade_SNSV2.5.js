// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')
const {
  testAddress, mainAddress
} = require('../../address.json')

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("the account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()));

  const SNSV2_5 = await ethers.getContractFactory('SNSV2_5')
  const LinkKey = await ethers.getContractFactory('LinkKey')

  const linkKey = await LinkKey.attach(testAddress.keyAddress)
  console.log('LinkKey deployed to:', linkKey.address)

  // const sns = await upgradeSns(SNSV2_5);
  const { sns } = await attachOld(SNSV2_5)

  // await setting(sns, deployer.address);

  await testFreeMint(sns, deployer.address);
}

async function upgradeSns(SNSV2_5) {
  console.log('sns upgrade ing....')
  const sns = await upgrades.upgradeProxy(
    testAddress.newSnsAddress,
    SNSV2_5,
  )
  await sns
  console.log('sns upgrade success')
  return sns
}


async function attachOld(SNSV2_5) {
  const sns = await SNSV2_5.attach(testAddress.newSnsAddress);
  console.log('sns attach success', sns.address)

  return { sns }
}

async function setting(sns, owner) {
  console.log('sns setShortMintParams ing....')
  const setShortMintParamsTx = await sns.setShortMintParams(
    0,
    0,
    "0x7A1A9567Dd868D24D49F00201107463b0114fe55",
    0,
    1664075469,
    [],
    true
  );
  setShortMintParamsTx.wait();
  console.log('sns setShortMintParams success')

}

async function testFreeMint(sns, owner) {

  const info = await sns.getInfo("0x68aF7EF8182F4Bf50e32814AeCaaeB747bfc905F", "", 0)
  console.log('info', info)

  console.log('sns shortNameMint ing....')
  const shortNameMintTx = await sns.shortNameMint(
    '456',
    1,
    {
      value: info.priceOfShort.maticPrice
    }
  );
  shortNameMintTx.wait();
  console.log('sns shortNameMint success')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
