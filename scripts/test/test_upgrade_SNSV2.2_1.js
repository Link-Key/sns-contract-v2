// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')

async function main() {
  //upgraded
  const SNSV2_2 = await ethers.getContractFactory('SNSV2_2')
  console.log('Upgrading SNSV2_2...')
  const snsV2_2 = await upgrades.upgradeProxy(
    '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176',
    SNSV2_2,
  )
  await snsV2_2
  console.log('snsV2_2 upgraded success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
