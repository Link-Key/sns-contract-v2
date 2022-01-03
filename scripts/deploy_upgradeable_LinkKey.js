// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require('hardhat')

async function main() {
  const LinkKey = await ethers.getContractFactory('LinkKey')
  console.log('Deploying LinkKey...')

  const linkKey = await upgrades.deployProxy(
    LinkKey,
    [
      'linkkeyTest',
      'lkt',
      1672329600,
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      150,
    ],
    {
      initializer: 'initialize',
    },
  )
  await linkKey.deployed()
  console.log('LinkKey deployed to:', linkKey.address)

  // const LinkKeyV2 = await ethers.getContractFactory('LinkKeyV2')
  // console.log('Upgrading LinkKey...')
  // await upgrades.upgradeProxy(
  //   '0x388192000D897e486fA06046edb6E76B3C48C8Db',
  //   LinkKeyV2,
  // )
  // console.log('LinkKey upgraded')
}

main()
