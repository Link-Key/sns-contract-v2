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

  const coinsPrice = await snsV2.getCoinsPrice(1)

  const LinkKey = await ethers.getContractFactory('LinkKey')
  const linkkey = await LinkKey.attach(
    '0xFA12F5ff3c2A137a02F1678E50c54276624b50FB',
  )
  console.log('linkkey load success')

  // console.log('LinkKey approve ing...')
  // const approveTx = await linkkey.approve(
  //   '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176',
  //   coinsPrice,
  // )
  // approveTx.wait()
  // console.log('LinkKey approveTx success')

  const allowance = await linkkey.allowance(
    '0x9bB26e0C85689F24552EEB7dcd90Ee5f233715EA',
    '0xFA12F5ff3c2A137a02F1678E50c54276624b50FB',
  )

  console.log('coinsPrice:allowance', coinsPrice, allowance)

  // console.log('SNS mintByMoreCoins ing...')
  // const mintByMoreCoinsTx = await snsV2.mintByMoreCoins('peifeng3', 1)
  // mintByMoreCoinsTx.wait()
  // console.log('SNS mintByMoreCoins success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
