// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNSV2_3 = await ethers.getContractFactory('SNSV2_3')
  console.log('load SNSV2_3...')
  const snsV2_3 = await SNSV2_3.attach(
    '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176',
  )
  console.log('snsV2_3: load success')

  console.log('SNSV2_3 initializeInvite ing...')
  const initializeInviteTx = await snsV2_3.initializeInvite('')
  await initializeInviteTx.wait()
  console.log('SNSV2_3 initializeInvite success')

  const Invite = await ethers.getContractFactory('Invite')
  console.log('load Invite...')
  const invite = await Invite.attach(
    '',
  )

  //approve
  const LinkKey = await ethers.getContractFactory('LinkKey')
  const linkKey = await LinkKey.attach(
    '0xFA12F5ff3c2A137a02F1678E50c54276624b50FB',
  )
  console.log('LinkKey deployed to:', linkKey.address)

  console.log('LinkKey approve ing...')
  const approveTx = await linkKey.approve(
    '',
    1 * 10 ** 8,
  )
  await approveTx.wait()
  console.log('LinkKey approve success')

  console.log('Invite addInviter ing...')
  const addInviterTx = await invite.addInviter()
  await addInviterTx.wait()
  console.log('Invite addInviter success')

  // get price
  const price = await snsV2_3.getPrice()
  // const maticPrice = price.maticPrice
  // console.log('price', price)
  const keyPrice = price.keyPrice
  console.log('keyPrice', keyPrice)

  // //get price
  const tokenMinted = await snsV2_3.getTokenMinted()
  console.log('tokenMinted', tokenMinted)

  // console.log('SNS Mint ing...')
  // const mintTx = await snsV2_3.mint('peifeng22', {
  //   value: maticPrice,
  // })
  // await mintTx.wait()
  // console.log('SNS Mint success')


  console.log('LinkKey approve ing...')
  const approveMintTx = await linkKey.approve(
    '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176',
    keyPrice,
  )
  await approveMintTx.wait()
  console.log('LinkKey approve success')

  const allowance = await linkKey.allowance(
    '0xa266093e18C25f12ce4789b87becA83aCab34a36',
    '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176',
  )

  console.log('keyPrice:allowance', keyPrice, allowance)

  console.log('SNS Mint ing...')
  const mintTx = await snsV2_3.mintByMoreCoins('peifeng22', 1)
  await mintTx.wait()
  console.log('SNS Mint success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
