// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require('hardhat')

async function main() {
  const LinkKey = await ethers.getContractFactory('LinkKey')
  console.log('Deploying LinkKey...')

  const linkKey = await upgrades.deployProxy(
    LinkKey,
    [
      'linkkey',
      'lk',
      1672329600,
      '0x863244EfC9a55113cadcdf38f964F12131B99e53',
      '0x863244EfC9a55113cadcdf38f964F12131B99e53',
      '0x863244EfC9a55113cadcdf38f964F12131B99e53',
      '0x863244EfC9a55113cadcdf38f964F12131B99e53',
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
