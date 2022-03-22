const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNS = await ethers.getContractFactory('SNS')
  const sns = await upgrades.deployProxy(
    SNS,
    [
      '0xc50417c523f5fE59cdADB9BC5A5F1059b0309EfC', // key address
      'SNS',
      'SNS',
      '0x8C3A3D73B05710683E6deF2E248A7D2d47096599', // feeTo Address
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

  // console.log('SNS transferOwnershiping...')
  // const transferOwnershipTx = await sns.transferOwnership(
  //   '0x7dcc1C9D46C0B43D2170618CDce195a693aD0C49',
  // )
  // await transferOwnershipTx.wait()
  // console.log('SNS transferOwner success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
