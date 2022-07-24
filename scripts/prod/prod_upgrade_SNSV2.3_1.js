// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')

async function main() {
  //upgraded
  // const SNSV2_3 = await ethers.getContractFactory('SNSV2_3')
  // console.log('Upgrading SNSV2_3...')
  // const snsV2_3 = await upgrades.upgradeProxy(
  //   '0x19AD2b1F012349645C3173EA63F98948A2b43d27',
  //   SNSV2_3,
  // )
  // await snsV2_3
  // console.log('snsV2_3 upgraded success')

  const SNSV2_3 = await ethers.getContractFactory('SNSV2_3')
  console.log('load SNSV2_3...')
  const snsV2_3 = await SNSV2_3.attach(
    '0x19AD2b1F012349645C3173EA63F98948A2b43d27',
  )
  console.log('snsV2_3: load success')

  //depoly invite
  // const Invite = await ethers.getContractFactory('Invite')
  // console.log('deploy Invite...')
  // const invite = await upgrades.deployProxy(
  //   Invite,
  //   [
  //     '0x19AD2b1F012349645C3173EA63F98948A2b43d27',
  //     '0x5CA9A8405499a1Ee8fbB1849f197b2b7e518985f',
  //     '0x5455e2960e243671966d92deea4c7edac49305af',
  //     ethers.BigNumber.from("150000000000000000000")
  //   ],
  //   {
  //     initializer: 'initialize',
  //   },
  // )
  // await invite.deployed()
  // console.log('Invite deploy success to:', invite.address)

  console.log('SNSV2_3 initializeInvite ing...')
  const initializeInviteTx = await snsV2_3.initializeInvite('0x1Be596e965e2566d2f211fea6b09898d0956c04E')
  await initializeInviteTx.wait()
  console.log('SNSV2_3 initializeInvite success')

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
