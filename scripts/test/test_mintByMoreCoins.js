const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNSV2 = await ethers.getContractFactory('SNSV2')
  const snsV2 = await SNSV2.attach('0x19AD2b1F012349645C3173EA63F98948A2b43d27')
  console.log('snsV2 load success')

  const coinsPrice = await snsV2.getCoinsPrice(1)

  const LinkKey = await ethers.getContractFactory('LinkKey')
  const linkkey = await LinkKey.attach(
    '0x5CA9A8405499a1Ee8fbB1849f197b2b7e518985f',
  )
  console.log('linkkey load success')

  console.log('LinkKey approve ing...')
  const approveTx = await linkkey.approve(
    '0x19AD2b1F012349645C3173EA63F98948A2b43d27',
    coinsPrice,
  )
  approveTx.wait()
  console.log('LinkKey approveTx success')

  const allowance = await linkkey.allowance(
    '0x7A1A9567Dd868D24D49F00201107463b0114fe55',
    '0x19AD2b1F012349645C3173EA63F98948A2b43d27',
  )

  console.log('coinsPrice:allowance', coinsPrice, allowance)

  console.log('SNS mintByMoreCoins ing...')
  const mintByMoreCoinsTx = await snsV2.mintByMoreCoins('karma*', 1)
  mintByMoreCoinsTx.wait()
  console.log('SNS mintByMoreCoins success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
