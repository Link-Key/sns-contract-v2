// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')

async function main() {
  //upgraded
  const SNSV2 = await ethers.getContractFactory('SNSV2')
  console.log('Upgrading SNSV2...')
  const snsV2 = await upgrades.upgradeProxy(
    '0x19AD2b1F012349645C3173EA63F98948A2b43d27',
    SNSV2,
  )
  await snsV2
  console.log('SNSV2 upgraded success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
