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

  console.log('SNS getTokenURI ing...')
  const oldTokenURI = await snsV2.tokenURI(1)
  console.log('SNS getOldTokenURI success:', oldTokenURI)

  console.log('SNS setTokenURI ing...')
  const setTokenURITx = await snsV2.setTokenURI([1, 2], ['1q2w', '23qwe'])
  setTokenURITx.wait()
  console.log('SNS setTokenURI success')

  const newTokenURI = await snsV2.tokenURI(1)
  console.log('SNS getNewTokenURI success:', newTokenURI)

  console.log('SNS ManagerMint ing...')
  const managerMintTx = await snsV2.batchManagerMint(
    ['peifeng2', 'karma2'],
    [
      '0x185BA2eD90fA734c34abd6F2283f22C785afba75',
      '0x9bB26e0C85689F24552EEB7dcd90Ee5f233715EA',
    ],
    ['4', '5'],
    true,
  )
  await managerMintTx.wait()
  console.log('SNS ManagerMint success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
