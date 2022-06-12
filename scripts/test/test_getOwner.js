const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNS = await ethers.getContractFactory('SNS')
  const sns = await SNS.attach('0x19AD2b1F012349645C3173EA63F98948A2b43d27')
  console.log('load SNS success')
  console.log('SNS transferOwnershiping...')
  const Owner = await sns.owner()

  console.log('Owner---', Owner)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
