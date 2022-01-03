// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNSResolver = await ethers.getContractFactory('SNSResolver')
  console.log('Deploying SNSResolver...')

  const snsResolver = await upgrades.deployProxy(
    SNSResolver,
    ['0xc843beE7Cae723bC736398933b2d707788b86D56'],
    {
      initializer: 'initialize',
    },
  )
  await snsResolver.deployed()
  console.log('SNSResolver deployed to:', snsResolver.address)

  //upgraded
  // const LinkKeyV2 = await ethers.getContractFactory('LinkKeyV2')
  // console.log('Upgrading LinkKey...')
  // await upgrades.upgradeProxy(
  //   '0x388192000D897e486fA06046edb6E76B3C48C8Db',
  //   LinkKeyV2,
  // )
  // console.log('LinkKey upgraded')
}

main()
