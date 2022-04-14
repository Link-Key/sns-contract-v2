// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNSV2 = await ethers.getContractFactory('SNSV2')
  const snsV2 = await SNSV2.attach('0x19AD2b1F012349645C3173EA63F98948A2b43d27')
  console.log('snsV2 load success')

  // console.log('SNS setCoins ing...')
  // const setCoinsTx = await snsV2.setCoins(
  //   1,
  //   '0x5CA9A8405499a1Ee8fbB1849f197b2b7e518985f',
  //   '15000000000000000000',
  //   true,
  //   70,
  // )
  // setCoinsTx.wait()
  // console.log('SNS setCoins success')

  // console.log('SNS getCoins ing...')
  // const coinsAddress = await snsV2.getCoinsAddress(1)
  // const coinsPrice = await snsV2.getCoinsPrice(1)
  // const coinsDestroy = await snsV2.getCoinsDestroy(1)
  // const coinsDestroyPercentage = await snsV2.getCoinsDestroyPercentage(1)
  // console.log(
  //   'SNS getCoins success',
  //   coinsAddress,
  //   coinsPrice,
  //   coinsDestroy,
  //   coinsDestroyPercentage,
  // )

  console.log('SNS setFeeTo ing...')
  const setFeeToTx = await snsV2.setFeeTo(
    '0x5455e2960e243671966d92deea4c7edac49305af',
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
