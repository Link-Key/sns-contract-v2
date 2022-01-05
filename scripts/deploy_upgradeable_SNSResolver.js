// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNSResolver = await ethers.getContractFactory('SNSResolver')
  console.log('Deploying SNSResolver...')

  const snsResolver = await upgrades.deployProxy(
    SNSResolver,
    ['0xD98D85705E45249bE906df74923Bcec5068dFC30'],
    {
      initializer: 'initialize',
    },
  )
  await snsResolver.deployed()
  console.log('SNSResolver deployed to:', snsResolver.address)

  const setRecordsTx = await snsResolver.setRecords(
    'peifeng.key',
    0xd98d85705e45249be906df74923bcec5068dfc30,
  )
  await setRecordsTx.wait()

  const setAllPropertiesTx = await snsResolver.setAllProperties(
    'peifeng.key',
    '0+1+2+3+4+5+6+7+8+9+10+11+12+13+14',
  )
  await setAllPropertiesTx.wait()

  const ethAddress = await snsResolver.getETHAddress()
  console.log('ethAddress-----', ethAddress)
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
