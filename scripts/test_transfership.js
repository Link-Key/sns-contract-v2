const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNS = await ethers.getContractFactory('SNS')
  const sns = await SNS.attach('0xAFaf95280b7aD3B2b4B526deF2baC04bA2Ba254C')
  console.log('load SNS success')
  console.log('SNS transferOwnershiping...')
  const transferOwnershipTx = await sns.transferOwnership(
    '0x7dcc1C9D46C0B43D2170618CDce195a693aD0C49',
  )
  await transferOwnershipTx.wait()
  console.log('SNS transferOwner success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
