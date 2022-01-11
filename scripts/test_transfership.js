const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNS = await ethers.getContractFactory('SNS')
  const sns = await SNS.attach('0x19AD2b1F012349645C3173EA63F98948A2b43d27')
  console.log('load SNS success')
  console.log('SNS transferOwnershiping...')
  const transferOwnershipTx = await sns.transferOwnership(
    '0xB879C52F1B7C2E366410b2718924a306d098B9d9',
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
