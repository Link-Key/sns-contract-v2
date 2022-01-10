const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNS = await ethers.getContractFactory('SNS')
  const sns = await SNS.attach('0x5fE611901dDc8a874D274626a8E793b3E07bb40D')
  console.log('load SNS success')
  console.log('SNS ManagerMint ing...')
  const managerMintTx = await sns.batchManagerMint(
    ['peifeng', 'karma'],
    [
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      '0x185BA2eD90fA734c34abd6F2283f22C785afba75',
    ],
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
