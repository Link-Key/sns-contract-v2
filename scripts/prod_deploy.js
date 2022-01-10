const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNS = await ethers.getContractFactory('SNS')
  const sns = await upgrades.deployProxy(
    SNS,
    [
      '0x5CA9A8405499a1Ee8fbB1849f197b2b7e518985f',
      'SNS',
      'SNS',
      '0xfa18b733b5d9dfCBf2382d0Cf269A0904F1BAa69',
    ],
    {
      initializer: 'initialize',
    },
  )
  await sns.deployed()
  console.log('SNS deployed to:', sns.address)

  const SNSResolver = await ethers.getContractFactory('SNSResolver')
  const snsResolver = await upgrades.deployProxy(SNSResolver, [sns.address], {
    initializer: 'initialize',
  })
  await snsResolver.deployed()
  console.log('SNSResolver deployed to:', snsResolver.address)

  // console.log('LinkKey setMinter ing...')
  // const setMinterTx = await linkKey.setMinter(sns.address)
  // await setMinterTx.wait()
  // console.log('LinkKey setMinter success')

  console.log('SNS setDefaultResolverAddress ing...')
  const setDefaultResolverTx = await sns.setDefaultResolverAddress(
    snsResolver.address,
  )
  await setDefaultResolverTx.wait()
  console.log('SNS setDefaultResolverAddress success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
