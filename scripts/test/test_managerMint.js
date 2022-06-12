const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNS = await ethers.getContractFactory('SNS')
  const sns = await SNS.attach('0x69F5B757e5699e00F2f5e27b9217a27C3bD5eF13')
  console.log('load SNS success')
  console.log('SNS ManagerMint ing...')
  const managerMintTx = await sns.batchManagerMint(
    ['peifeng1', 'karma1'],
    [
      '0x29D3fb9961f98a97C6fDac8d9162cF958e4C6Af5',
      '0x0b4b6D35bA540704F7Ae85F523050F67be45025e',
    ],
    ['0', '3'],
    true,
  )
  await managerMintTx.wait()
  console.log('SNS ManagerMint success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
