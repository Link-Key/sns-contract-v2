// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require('hardhat')

async function main() {
  //   const Greeter = await ethers.getContractFactory('Greeter')
  //   console.log('Deploying Greeter...')
  //   const greeter = await upgrades.deployProxy(Greeter, ['42'], {
  //     initializer: 'store',
  //   })
  //   await greeter.deployed()
  //   console.log('Greeter deployed to:', greeter.address)
  const GreeterV2 = await ethers.getContractFactory('GreeterV2')
  console.log('Upgrading Greeter...')
  await upgrades.upgradeProxy(
    '0x0F5Edd851865F0d464436719c8504E2084D7e265',
    GreeterV2,
  )
  console.log('Greeter upgraded')
}

main()
