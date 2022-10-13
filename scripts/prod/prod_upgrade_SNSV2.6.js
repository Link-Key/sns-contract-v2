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

  const SNSV2_6 = await ethers.getContractFactory('SNSV2_6')

  const sns = await upgradeSns(SNSV2_6);

}

async function upgradeSns(SNSV2_6) {
  console.log('sns upgrade ing....')
  const sns = await upgrades.upgradeProxy(
    mainAddress.snsAddress,
    SNSV2_6,
  )
  await sns
  console.log('sns upgrade success')
  return sns
}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
