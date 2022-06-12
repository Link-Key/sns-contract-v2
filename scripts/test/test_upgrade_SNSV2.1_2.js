// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNSV2_1 = await ethers.getContractFactory('SNSV2_1')
  console.log('Upgrading SNSV2_1...')
  const snsV2_1 = await SNSV2_1.attach(
    '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176',
  )
  console.log('snsV2_1: load success')

  // getCoinsInfo
  const CoinsInfo = await snsV2_1.getCoinsInfo(1)
  console.log('CoinsInfo', CoinsInfo)

  //setIncreases
  // const setIncreasesTx = await snsV2_1.setIncreases(100, 2)
  // await setIncreasesTx.wait()
  // console.log('snsV2_1: setIncreasesTx success')

  // const addMintedTx = await snsV2_1.addMinted(5000)
  // await addMintedTx.wait()
  // console.log('snsV2_1: addMintedTx success')

  // get price
  // const price = await snsV2_1.getPrice()
  // const maticPrice = price.maticPrice
  // console.log('price', price.maticPrice)
  // const keyPrice = price.keyPrice
  // console.log('keyPrice', keyPrice)

  // //get price
  // const tokenMinted = await snsV2_1.getTokenMinted()
  // console.log('tokenMinted', tokenMinted)

  // console.log('SNS Mint ing...')
  // const mintTx = await snsV2_1.mint('peifeng30', {
  //   value: maticPrice,
  // })
  // await mintTx.wait()
  // console.log('SNS Mint success')

  // const LinkKey = await ethers.getContractFactory('LinkKey')
  // const linkKey = await LinkKey.attach(
  //   '0xFA12F5ff3c2A137a02F1678E50c54276624b50FB',
  // )
  // console.log('LinkKey deployed to:', linkKey.address)

  // console.log('LinkKey approve ing...')
  // const approveTx = await linkKey.approve(
  //   '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176',
  //   keyPrice,
  // )
  // await approveTx.wait()
  // console.log('LinkKey approve success')

  // const allowance = await linkKey.allowance(
  //   '0x343F8c28c45a9b6927439C35F2C4140230be9187',
  //   '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176',
  // )

  // console.log('keyPrice:allowance', keyPrice, allowance)

  // console.log('SNS Mint ing...')
  // const mintTx = await snsV2_1.mintByMoreCoins('peifeng40', 1)
  // await mintTx.wait()
  // console.log('SNS Mint success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
