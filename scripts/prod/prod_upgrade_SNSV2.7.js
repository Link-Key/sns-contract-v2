// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')
const {
  mainAddress
} = require('../../address.json')

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("the account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()));

  const SNSV2_7 = await ethers.getContractFactory('SNSV2_7')

  // const sns = await upgradeSns(SNSV2_7);

  const sns = await attachOld(SNSV2_7)

  await setCoins(sns, 1, true)
  await setCoins(sns, 2, true)

}

async function upgradeSns(SNSV2_7) {
  console.log('sns upgrade ing....')
  const sns = await upgrades.upgradeProxy(
    mainAddress.snsAddress,
    SNSV2_7,
  )
  await sns
  console.log('sns upgrade success')
  return sns
}

async function attachOld(SNSV2_7) {
  console.log('sns attach ing....')

  const sns = await SNSV2_7.attach(mainAddress.snsAddress);
  console.log('sns attach success', sns.address)

  return sns
}


async function setCoins(sns, coinType, isClose) {
  console.log('sns setCoins ing....')

  let coinInfo = await sns.getCoinsInfo(coinType);
  console.log('sns getCoinsInfo ing....', coinInfo)
  // const setCoinsTx = await sns.setCoins(coinType, coinInfo[0], coinInfo[1], coinInfo[2], coinInfo[3], isClose)
  // setCoinsTx.wait()
  console.log('sns setCoins success', coinType, isClose)
}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
