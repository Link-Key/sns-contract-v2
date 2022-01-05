// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')

async function main() {
  // const LinkKey = await ethers.getContractFactory('LinkKey')
  // const linkKey = await upgrades.deployProxy(
  //   LinkKey,
  //   [
  //     'linkkeyTest',
  //     'lkt',
  //     1672329600,
  //     '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
  //     '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
  //     '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
  //     '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
  //     150,
  //   ],
  //   {
  //     initializer: 'initialize',
  //   },
  // )
  // const linkKey = await LinkKey.deploy()
  // console.log('LinkKey deployed to:', linkKey.address)
  // const initializerTx = await linkKey.initialize(
  //   'linkkeyTest',
  //   'lkt',
  //   1672329600,
  //   '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
  //   '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
  //   '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
  //   '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
  //   150,
  // )
  // await initializerTx.wait()
  // console.log('LinkKey initializer success')

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

  console.log('LinkKey setMinter ing...')
  //linkKey setMinter(sns address)
  const setMinterTx = await linkKey.setMinter(sns.address)
  // wait until the transaction is mined
  await setMinterTx.wait()
  console.log('LinkKey setMinter success')

  console.log('SNS setDefaultResolverAddress ing...')
  //sns setDefaultResolver(snsResolver address)
  const setDefaultResolverTx = await sns.setDefaultResolverAddress(
    snsResolver.address,
  )
  // wait until the transaction is mined
  await setDefaultResolverTx.wait()
  console.log('SNS setDefaultResolverAddress success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
