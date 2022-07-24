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

  // console.log('SNSV2_3 initializeInvite ing...')
  // const initializeInviteTx = await snsV2_3.initializeInvite('0xC4FD81B29BD4EE39E232622867D4864ad503aC4a')
  // await initializeInviteTx.wait()
  // console.log('SNSV2_3 initializeInvite success')

  const Invite = await ethers.getContractFactory('Invite')
  console.log('load Invite...')
  const invite = await Invite.attach(
    '0xC4FD81B29BD4EE39E232622867D4864ad503aC4a',
  )

  //approve
  const LinkKey = await ethers.getContractFactory('LinkKey')
  const linkKey = await LinkKey.attach(
    '0xFA12F5ff3c2A137a02F1678E50c54276624b50FB',
  )
  console.log('LinkKey deployed to:', linkKey.address)

  // console.log('LinkKey approve ing...')
  // const approveTx = await linkKey.approve(
  //   '0xC4FD81B29BD4EE39E232622867D4864ad503aC4a',
  //   1 * 10 ** 8,
  // )
  // await approveTx.wait()
  // console.log('LinkKey approve success')

  // console.log('Invite addInviter ing...')
  // const addInviterTx = await invite.addInviter()
  // await addInviterTx.wait()
  // console.log('Invite addInviter success')

  // get price
  const price = await snsV2_3.getPrice('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded')
  // const maticPrice = price.maticPrice
  console.log('price', price)
  const keyPrice = price.keyPrice
  console.log('keyPrice', keyPrice)

  const maticPrice = price.maticPrice
  console.log('maticPrice', maticPrice)

  // //get price
  const tokenMinted = await snsV2_3.getTokenMinted()
  console.log('tokenMinted', tokenMinted)

  // console.log('SNS setCoinsTx ing...')
  // const setCoinsTx = await snsV2_3.setCoins('peifeng22', '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded')
  // await setCoinsTx.wait()
  // console.log('SNS MisetCoinsTxnt success')


  // console.log('SNS Mint ing...')
  // const mintTx = await snsV2_3.mint('peifeng22', '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded', {
  //   value: maticPrice,
  // })
  // await mintTx.wait()
  // console.log('SNS Mint success')

  // const info = await snsV2_3.getInfo('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded', '', 0)
  // console.log('info', info)


  // console.log('LinkKey approve ing...')
  // const approveMintTx = await linkKey.approve(
  //   '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176',
  //   keyPrice,
  // )
  // await approveMintTx.wait()
  // console.log('LinkKey approve success')

  const allowance = await linkKey.allowance(
    '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
    '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176',
  )

  console.log('keyPrice:allowance', keyPrice, allowance)

  // console.log('SNS Mint ing...')
  // const mintTx = await snsV2_3.mintByMoreCoins('peifeng22', 1, '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded')
  // await mintTx.wait()
  // console.log('SNS Mint success')

  const inviteIncome = await invite.getInviterIncome('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded')
  console.log('inviteIncome', inviteIncome)

  const info = await snsV2_3.getInfo('0x0000000000000000000000000000000000000000', 'test.key', 0);
  console.log('info', info)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
