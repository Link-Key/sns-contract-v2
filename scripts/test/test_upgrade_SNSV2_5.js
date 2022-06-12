// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')

const BigNumber = require('bignumber.js')

const { ether } = require('@openzeppelin/test-helpers')

async function main() {
  const SNSV2 = await ethers.getContractFactory('SNSV2')
  const snsV2 = await SNSV2.attach('0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176')
  console.log('snsV2 load success')
  const val = new ether('10')
  // const a = new BigNumber(10 * 10 ** 18)
  // console.log('a----', a, val)

  console.log('SNS setCoins ing...')
  // const setCoinsTx = await snsV2.setCoins(
  //   1,
  //   '0xFA12F5ff3c2A137a02F1678E50c54276624b50FB',
  //   '10000000000000000000',
  //   true,
  //   70,
  // )
  // setCoinsTx.wait()
  // console.log('SNS setCoins success')

  console.log('SNS getCoins ing...')
  const coinsAddress = await snsV2.getCoinsAddress(1)
  const coinsPrice = await snsV2.getCoinsPrice(1)
  const coinsDestroy = await snsV2.getCoinsDestroy(1)
  const coinsDestroyPercentage = await snsV2.getCoinsDestroyPercentage(1)
  console.log(
    'SNS getCoins success',
    coinsAddress,
    coinsPrice,
    coinsDestroy,
    coinsDestroyPercentage,
  )

  console.log('SNS setFeeTo ing...')
  const setFeeToTx = await snsV2.setFeeTo(
    '0xf27Ac7cff0C02C11794B9115248097BD040E4C9c',
  )
  setFeeToTx.wait()
  console.log('SNS setFeeTo success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
