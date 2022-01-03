// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNS = await ethers.getContractFactory('SNS')
  console.log('Deploying SNS...')

  const sns = await upgrades.deployProxy(
    SNS,
    [
      '0x388192000d897e486fa06046edb6e76b3c48c8db',
      'SNSTest',
      'snst',
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
    ],
    {
      initializer: 'initialize',
    },
  )
  await sns.deployed()
  console.log('SNS deployed to:', sns.address)

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
