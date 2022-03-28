// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')

async function main() {
  const LinkKey = await ethers.getContractFactory('LinkKey')
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
  const linkKey = await LinkKey.attach(
    '0xFA12F5ff3c2A137a02F1678E50c54276624b50FB',
  )
  console.log('LinkKey deployed to:', linkKey.address)

  const SNS = await ethers.getContractFactory('SNS')
  // const sns = await upgrades.deployProxy(
  //   SNS,
  //   [
  //     linkKey.address,
  //     'SNS',
  //     'SNS',
  //     '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
  //   ],
  //   {
  //     initializer: 'initialize',
  //   },
  // )
  // await sns.deployed()
  const sns = await SNS.attach('0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176')
  console.log('SNS deployed to:', sns.address)

  const SNSResolver = await ethers.getContractFactory('SNSResolver')
  // const snsResolver = await upgrades.deployProxy(SNSResolver, [sns.address], {
  //   initializer: 'initialize',
  // })
  // await snsResolver.deployed()
  const snsResolver = await SNSResolver.attach(
    '0x71Bc31C3eE2896408B93E41b0b43ea1bf9a20FE3',
  )
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

  console.log('SNS Mint ing...')
  const price = await sns.getPrice()
  console.log('getPrice success', price)
  const MintTx = await sns.mint('karma', {
    value: price,
  })
  await MintTx.wait()
  console.log('SNS mint success')

  console.log('SNS ManagerMint ing...')
  const managerMintTx = await sns.batchManagerMint(
    ['peifeng1', 'karma1'],
    [
      '0x29D3fb9961f98a97C6fDac8d9162cF958e4C6Af5',
      '0x0b4b6D35bA540704F7Ae85F523050F67be45025e',
    ],
    ['2', '3'],
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
