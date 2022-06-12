const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNS = await ethers.getContractFactory('SNS')
  const sns = await SNS.attach('0x4F10405b504ef46c1c934e6917d2ba16361E242e')
  console.log('load SNS success')
  console.log('SNS getResolverOwner...')
  const addr = await sns.getResolverOwner('peifeng.key')
  console.log('addr---', addr)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
