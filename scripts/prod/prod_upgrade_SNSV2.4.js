// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')
const {
  mainAddress
} = require('../../address.json')

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("the account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()));

  const SNSV2_4 = await ethers.getContractFactory('SNSV2_4')
  const Stake = await ethers.getContractFactory('Stake')
  const Trading = await ethers.getContractFactory('Trading')
  const FollowNFT = await ethers.getContractFactory('FollowNFT')
  const GroupNFT = await ethers.getContractFactory('GroupNFT')
  const LinkKey = await ethers.getContractFactory('LinkKey')
  const SNSResolver = await ethers.getContractFactory('SNSResolverV2_4')

  const linkKey = await LinkKey.attach(mainAddress.keyAddress)
  console.log('LinkKey deployed to:', linkKey.address)

  const { sns, stake, trading, followNFT, groupNFT } = await attachOld(SNSV2_4, Stake, Trading, FollowNFT, GroupNFT)

  // const sns = await upgradeSns(SNSV2_4);
  // const { stake, trading } = await deployNew(Stake, Trading);
  // const { followNFT, groupNFT } = await deployNewNFT(FollowNFT, GroupNFT, deployer.address)

  //升级SNSResolver 
  // await upgradeSNSResolver(SNSResolver)

  //设置参数
  await setting(sns, stake, deployer.address);



}

async function upgradeSns(SNSV2_4) {
  console.log('sns upgrade ing....')
  const sns = await upgrades.upgradeProxy(
    mainAddress.snsAddress,
    SNSV2_4,
  )
  await sns
  console.log('sns upgrade success')
  return sns
}

async function deployNew(Stake, Trading) {
  // const stake = null
  console.log('stake&trading deploy ing....')
  const stake = await upgrades.deployProxy(
    Stake,
    [],
    {
      initializer: 'initialize',
    },
  )
  await stake.deployed()
  console.log('stake deploy success', stake.address)

  // const trading = null
  const trading = await upgrades.deployProxy(
    Trading,
    [],
    {
      initializer: 'initialize',
    },
  )
  await trading.deployed()
  console.log('trading deploy success', trading.address)

  return { stake, trading }
}

async function deployNewNFT(FollowNFT, GroupNFT, owner) {
  console.log('FollowNFT deploy ing....')
  const followNFT = await FollowNFT.deploy()
  console.log('FollowNFT deploy success', followNFT.address)

  // const groupNFT = null
  console.log('GroupNFT deploy ing....')
  const groupNFT = await GroupNFT.deploy()
  console.log('GroupNFT deploy success', groupNFT.address)

  return { followNFT, groupNFT }
}

async function attachOld(SNSV2_4, Stake, Trading, FollowNFT, GroupNFT) {
  console.log('sns&stake&trading attach ing....')

  const sns = await SNSV2_4.attach(mainAddress.snsAddress);
  console.log('sns attach success', sns.address)

  const stake = await Stake.attach(mainAddress.stakeAddress);
  console.log('stake attach success', stake.address)

  const trading = await Trading.attach(mainAddress.tradingAddress);
  console.log('trading attach success', trading.address)

  const followNFT = await FollowNFT.attach(mainAddress.followAddress);
  console.log('followNFT attach success', followNFT.address)

  const groupNFT = await GroupNFT.attach(mainAddress.groupAddress);
  console.log('groupNFT attach success', groupNFT.address)

  return { sns, stake, trading, followNFT, groupNFT }
}

async function setting(sns, stake, owner) {
  console.log('sns setStakeAddress ing....')
  const setStakeAddressTx = await sns.setStakeAddress(stake.address);
  setStakeAddressTx.wait();
  console.log('sns setStakeAddress success')

  // console.log('stake setAddress ing....')
  // const setAddressTx = await stake.setAddress(
  //   mainAddress.snsAddress,
  //   mainAddress.feeToAddress,
  //   ethers.BigNumber.from("100000000000000000000"), //100key
  //   ethers.BigNumber.from("500000000000000000000"), //500key
  //   mainAddress.keyAddress,
  //   mainAddress.followAddress,
  //   mainAddress.groupAddress,
  //   ethers.BigNumber.from("10000000000000000000"), //10 key
  //   ethers.BigNumber.from("2000000000000000000"), //2 key
  // )
  // setAddressTx.wait();
  // console.log('stake setAddress success')

}

async function upgradeSNSResolver(SNSResolver) {
  console.log('snsResolver upgrade ing....')
  const snsResolver = await upgrades.upgradeProxy(
    mainAddress.snsResolverAddress,
    SNSResolver,
  )
  await snsResolver
  console.log('snsResolver upgrade success')
  return snsResolver
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
