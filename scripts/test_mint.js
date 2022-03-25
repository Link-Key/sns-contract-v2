const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNS = await ethers.getContractFactory('SNS')
  const sns = await SNS.attach('0xA47783B23701ace719E9Cc081c5BCa5A5Be0C2e0')
  console.log('load SNS success')
  const price = await sns.getPrice()
  console.log('SNS Mint ing...')
  const MintTx = await sns.mint('karma', {
    value: price,
  })
  await MintTx.wait()
  console.log('SNS mint success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
