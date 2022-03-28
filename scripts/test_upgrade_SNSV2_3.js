// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNSV2 = await ethers.getContractFactory('SNSV2')
  const snsV2 = await SNSV2.attach('0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176')
  console.log('snsV2 load success')

  // SNS deployed to: 0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176

  console.log('SNSV2 setAssetsManager ing...')
  const setAssetsManagerTx = await snsV2.setAssetsManager([
    '0x7A1A9567Dd868D24D49F00201107463b0114fe55',
  ])
  await setAssetsManagerTx.wait()
  console.log('SNSV2 setAssetsManager success')

  console.log('SNSV2 setUserTokenManager ing...')
  const setUserTokenManagerTx = await snsV2.setUserTokenManager([
    '0xf27Ac7cff0C02C11794B9115248097BD040E4C9c',
  ])
  await setUserTokenManagerTx.wait()
  console.log('SNSV2 setUserTokenManager success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
