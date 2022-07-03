// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')

async function main() {
  //upgraded
  const Invite = await ethers.getContractFactory('Invite')
  console.log('deploy Invite...')
  const invite = await upgrades.deployProxy(
    Invite,
    [
      '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176',
      '0xFA12F5ff3c2A137a02F1678E50c54276624b50FB',
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      1 * 10 ** 8
    ],
    {
      initializer: 'initialize',
    },
  )
  await invite.deployed()
  console.log('Invite deploy success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
