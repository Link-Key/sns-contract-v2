// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')
const {
  testAddress, mainAddress
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

  const linkKey = await LinkKey.attach(testAddress.keyAddress)
  console.log('LinkKey deployed to:', linkKey.address)

  // const sns = await upgradeSns(SNSV2_4);
  // const { stake, trading } = await deployNew(Stake, Trading);

  const { sns, stake, trading, followNFT, groupNFT } = await attachOld(SNSV2_4, Stake, Trading, FollowNFT, GroupNFT)

  // await setting(sns, stake, deployer.address);

  // await upgradeStake(Stake)

  // await stakeNFT(sns, stake, linkKey, deployer.address);

  // const { followNFT, groupNFT } = await deployNewNFT(FollowNFT, GroupNFT, deployer.address)

  // await getNewNFTInfo(followNFT, groupNFT, deployer.address);

  // await unstakeNFT(stake, deployer.address);

  // await setOrder(trading, followNFT, deployer.addres);

  // await cancelOrder(trading);

  // await buy(trading, linkKey, deployer.address);

  // await testFollowNFT(deployer.address);

  // await testCreate();

}

async function upgradeSns(SNSV2_4) {
  console.log('sns upgrade ing....')
  const sns = await upgrades.upgradeProxy(
    testAddress.snsAddress,
    SNSV2_4,
  )
  await sns
  console.log('sns upgrade success')
  return sns
}

async function upgradeStake(Stake) {
  console.log('stake upgrade ing....')
  const stake = await upgrades.upgradeProxy(
    testAddress.stakeAddress,
    Stake,
  )
  await stake
  console.log('stake upgrade success')
  return stake
}

async function deployNew(Stake, Trading) {
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
  const followNFT = await FollowNFT.deploy(
    "test",
    "test",
    owner,
    ethers.BigNumber.from("1000000000000000000"),
    150
  )
  console.log('FollowNFT deploy success', followNFT.address)

  console.log('GroupNFT deploy ing....')
  const groupNFT = await GroupNFT.deploy(
    "test",
    "test",
    owner,
    ethers.BigNumber.from("1000000000000000000"),
    1500
  )
  console.log('GroupNFT deploy success', groupNFT.address)

  return { followNFT, groupNFT }
}

async function attachOld(SNSV2_4, Stake, Trading, FollowNFT, GroupNFT) {
  console.log('sns&stake&trading attach ing....')

  const sns = await SNSV2_4.attach(testAddress.snsAddress);
  console.log('sns attach success', sns.address)

  const stake = await Stake.attach(testAddress.stakeAddress);
  console.log('stake attach success', stake.address)

  const trading = await Trading.attach(testAddress.tradingAddress);
  console.log('trading attach success', trading.address)

  const followNFT = await FollowNFT.attach(testAddress.followAddress);
  console.log('followNFT attach success', followNFT.address)
  console.log(followNFT)

  const groupNFT = await GroupNFT.attach(testAddress.groupAddress);
  console.log('groupNFT attach success', groupNFT.address)

  return { sns, stake, trading, followNFT, groupNFT }
}

async function setting(sns, stake, owner) {
  console.log('sns setStakeAddress ing....')
  const setStakeAddressTx = await sns.setStakeAddress(stake.address);
  setStakeAddressTx.wait();
  console.log('sns setStakeAddress success')

  console.log('stake setAddress ing....')
  const setAddressTx = await stake.setAddress(testAddress.snsAddress, owner, ethers.BigNumber.from("1000000000000000000"), testAddress.keyAddress);
  setAddressTx.wait();
  console.log('stake setAddress success')

}

async function stakeNFT(sns, stake, linkKey, owner) {
  const balance = await sns.balanceOf(owner);
  const tokenId = await sns.tokenOfOwnerByIndex(owner, balance - 1)
  console.log('owner:tokenId:', tokenId);

  // const fee = await stake.getFee();
  // console.log('fee:', fee);

  // console.log('linkKey approve ing...');
  // const approveTx = await linkKey.approve(stake.address, ethers.BigNumber.from("1000000000000000000"))
  // approveTx.wait()
  // console.log('linkKey approve success...');

  console.log('sns transfer ing...', sns);
  console.log('sns transfer ing...');
  const transferTx = await sns.transfer("0x96b5Ae79949b20f45Dd01566c4d896169CFCC521", tokenId)
  transferTx.wait()
  console.log('linkKey transfer success...');

  // console.log('stake stakeNFT ing....')
  // const stakeNFTTx = await stake.stakeNFT(tokenId);
  // stakeNFTTx.wait();
  // console.log('sns stakeNFT success')
}

async function getNewNFTInfo(followNFT, groupNFT, owner) {
  const followBalance = await followNFT.balanceOf(owner);
  console.log('owner:followBalance:', followBalance);
  const groupBalance = await groupNFT.balanceOf(owner);
  console.log('owner:groupBalance:', groupBalance);
  // const followTokenId = await followNFT.tokensOfOwner(owner)
  // console.log('owner:followTokenId:', followTokenId);
  // const groupTokenId = await groupNFT.tokensOfOwnerIn(owner, 0, 150)
  // console.log('owner:groupTokenId:', groupTokenId);
}

async function unstakeNFT(stake, owner) {
  //test transfer
  console.log('stake unstakeNFT ing....')
  const unstakeNFTTx = await stake.unstakeNFT(testAddress.followAddress, testAddress.groupAddress);
  unstakeNFTTx.wait();
  console.log('sns unstakeNFT success')
  //test transfer
}

async function setOrder(trading, followNFT, owner) {
  // console.log('followNFT:setApprovalForAll ing');
  // const setApprovalForAllTx = await followNFT.setApprovalForAll(testAddress.tradingAddress, true);
  // setApprovalForAllTx.wait();
  // console.log('followNFT: setApprovalForAll success')

  // console.log('followNFT:setApprovalForAll ing');
  // const setApprovalForAllTx = await followNFT.setApprovalForAll("0x96b5Ae79949b20f45Dd01566c4d896169CFCC521", true);
  // setApprovalForAllTx.wait();
  // console.log('followNFT: setApprovalForAll success')

  console.log('followNFT:safeTransferFrom ing', followNFT);
  const safeTransferFromTx = await followNFT.transferFrom("0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded", "0x96b5Ae79949b20f45Dd01566c4d896169CFCC521", 1);
  safeTransferFromTx.wait();
  console.log('followNFT: safeTransferFromTx success')

  // console.log('trading setOrder ing....')
  // const setOrderTx = await trading.setOrder(testAddress.followAddress, testAddress.keyAddress, ethers.BigNumber.from("10000000000"), 10);
  // setOrderTx.wait();
  // console.log('trading setOrder success')

}

async function cancelOrder(trading, owner) {
  console.log('trading cancelOrder ing....')
  const cancelOrderTx = await trading.cancelOrder(testAddress.followAddress);
  cancelOrderTx.wait();
  console.log('trading cancelOrder success')

}

async function buy(trading, linkKey, owner) {
  console.log('trading getOrder ing....')
  const order = await trading.getOrder('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded', testAddress.followAddress)
  console.log('trading getOrder success', order)

  // console.log('linkKey approve ing....')
  // const approveTx = await linkKey.approve(trading.address, testAddress.followAddress)
  // approveTx.wait()
  // console.log('linkKey approve success')

  console.log('trading buy ing...')
  const buyTx = await trading.buy('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded', testAddress.followAddress, 1);
  buyTx.wait();
  console.log('trading buy success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
