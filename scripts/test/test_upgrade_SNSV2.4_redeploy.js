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
  const SNSResolver = await ethers.getContractFactory('SNSResolver')
  const Invite = await ethers.getContractFactory('Invite')

  const linkKey = await LinkKey.attach(testAddress.keyAddress)
  console.log('LinkKey deployed to:', linkKey.address)

  // const { sns, snsResolver, stake, trading } = await deploy(SNSV2_4, SNSResolver, Stake, Trading, deployer.address);

  // const { invite } = await loadInvite(Invite)

  // await snsSetting(sns, snsResolver, invite, stake, trading, deployer.address);

  const { sns, stake, trading } = await attachOld(SNSV2_4, Stake, Trading)

  await snsSetCoin(sns, deployer.address);

  // await setting(sns, stake, deployer.address);

  // await upgradeStake(Stake)

  // await upgradeTrading(Trading)

  // await stakeNFT(sns, stake, linkKey, deployer.address);

  // await mint(stake, FollowNFT, linkKey, deployer.address)

  // const { followNFT, groupNFT } = await deployNewNFT(FollowNFT, GroupNFT, deployer.address)

  // await getNewNFTInfo(followNFT, groupNFT, deployer.address);

  // await unstakeNFT(FollowNFT, stake, deployer.address);

  // await setOrder(stake, FollowNFT, trading, deployer.address);

  // await cancelOrder(trading);

  // await buy(trading, linkKey, deployer.address);

  // await testFollowNFT(deployer.address);

  // await testCreate();

  // await transferNFT(followNFT, groupNFT, deployer.address)

  // await upgradeSNSResolver(SNSResolver)

}

async function deploy(SNSV2_4, SNSResolver, Stake, Trading, owner) {

  console.log('sns&snsResolverg deploy ing....')
  const sns = await upgrades.deployProxy(
    SNSV2_4,
    [testAddress.keyAddress,
      "SNSTest",
      "SNST",
      owner
    ],
    {
      initializer: 'initialize',
    },
  )
  await sns.deployed()
  console.log('sns deploy success', sns.address)

  const snsResolver = await upgrades.deployProxy(
    SNSResolver,
    [sns.address],
    {
      initializer: 'initialize',
    },
  )
  await snsResolver.deployed()
  console.log('snsResolver deploy success', snsResolver.address)

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

  return { sns, snsResolver, stake, trading }
}

async function snsSetting(sns, snsResolver, invite, stake, trading, owner) {
  console.log('sns setDefaultResolverAddress ing....')
  const setDefaultResolverAddressTx = await sns.setDefaultResolverAddress(snsResolver.address);
  setDefaultResolverAddressTx.wait();
  console.log('sns setDefaultResolverAddress success')

  console.log('sns initializeInvite ing....')
  const initializeInviteTx = await sns.initializeInvite(invite.address);
  initializeInviteTx.wait();
  console.log('sns initializeInvite success')


  console.log('sns setCoins ing....')
  const setCoinsTx = await sns.setCoins(
    1,
    testAddress.keyAddress,
    ethers.BigNumber.from("1000000000000000000"),
    true,
    10
  )
  setCoinsTx.wait();

  const setCoinsTx1 = await sns.setCoins(
    2,
    testAddress.keyAddress,
    ethers.BigNumber.from("1000000000000000000"),
    true,
    10
  )
  setCoinsTx1.wait();

  const setCoinsTx2 = await sns.setCoins(
    3,
    testAddress.keyAddress,
    ethers.BigNumber.from("1000000000000000000"),
    true,
    10
  )
  setCoinsTx2.wait();
  console.log('sns setCoins success')

  console.log('sns setStakeAddress ing....')
  const setStakeAddressTx = await sns.setStakeAddress(stake.address);
  setStakeAddressTx.wait();
  console.log('sns setStakeAddress success')

  console.log('stake setAddress ing....')
  const setAddressTx = await stake.setAddress(
    sns.address,
    owner,
    ethers.BigNumber.from("1000000000000000000"),
    ethers.BigNumber.from("10000000000000000000"),
    testAddress.keyAddress,
    "0x36144dA36EBbEB1b8Cf24795Ca641E315241fC7E",
    "0xE080b9152A9BF4d57E87dC8F111Da069215013b9",
    ethers.BigNumber.from("1000000000000000000"),
    ethers.BigNumber.from("10000000000000000000")
  );
  setAddressTx.wait();
  console.log('stake setAddress success')

}

async function snsSetCoin(sns, owner) {
  console.log('sns setAssetsManager ing....')
  const setAssetsManagerTx = await sns.setAssetsManager([owner], true);
  setAssetsManagerTx.wait();
  console.log('sns setAssetsManager success')

  console.log('sns setCoins ing....')
  const setCoinsTx = await sns.setCoins(
    1,
    testAddress.keyAddress,
    ethers.BigNumber.from("1000000000000000000"),
    true,
    10
  )
  setCoinsTx.wait();

  const setCoinsTx1 = await sns.setCoins(
    2,
    testAddress.keyAddress,
    ethers.BigNumber.from("1000000000000000000"),
    true,
    10
  )
  setCoinsTx1.wait();

  const setCoinsTx2 = await sns.setCoins(
    3,
    testAddress.keyAddress,
    ethers.BigNumber.from("1000000000000000000"),
    true,
    10
  )
  setCoinsTx2.wait();
  console.log('sns setCoins success')

}

async function loadInvite(Invite) {

  console.log('invite load ing....')
  const invite = await Invite.attach(
    testAddress.inviteAddress
  );
  console.log('invite load success')

  return {
    invite
  }
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

async function attachOld(SNSV2_4, Stake, Trading) {
  console.log('sns&stake&trading attach ing....')

  const sns = await SNSV2_4.attach(testAddress.newSnsAddress);
  console.log('sns attach success', sns.address)

  const stake = await Stake.attach(testAddress.newStakeAddress);
  console.log('stake attach success', stake.address)

  const trading = await Trading.attach(testAddress.newTradingAddress);
  console.log('trading attach success', trading.address)

  return { sns, stake, trading }
}

async function setting(sns, stake, owner) {
  console.log('sns setStakeAddress ing....')
  const setStakeAddressTx = await sns.setStakeAddress(stake.address);
  setStakeAddressTx.wait();
  console.log('sns setStakeAddress success')

  console.log('stake setAddress ing....')
  const setAddressTx = await stake.setAddress(
    testAddress.snsAddress,
    owner,
    ethers.BigNumber.from("1000000000000000000"),
    ethers.BigNumber.from("10000000000000000000"),
    testAddress.keyAddress,
    "0x36144dA36EBbEB1b8Cf24795Ca641E315241fC7E",
    "0xE080b9152A9BF4d57E87dC8F111Da069215013b9");
  setAddressTx.wait();
  console.log('stake setAddress success')

}

async function stakeNFT(sns, stake, linkKey, owner) {
  const balance = await sns.balanceOf(owner);
  const tokenId = await sns.tokenOfOwnerByIndex(owner, balance - 1)
  console.log('owner:tokenId:', tokenId);

  // const fee = await stake.getFee();
  // console.log('fee:', fee);

  console.log('linkKey approve ing...');
  const approveTx = await linkKey.approve(stake.address, ethers.BigNumber.from("1000000000000000000"))
  approveTx.wait()
  console.log('linkKey approve success...');

  // console.log('sns transfer ing...', sns);
  // console.log('sns transfer ing...');
  // const transferTx = await sns.transfer("0x96b5Ae79949b20f45Dd01566c4d896169CFCC521", tokenId)
  // transferTx.wait()
  // console.log('linkKey transfer success...');


  // console.log('stake getStakedInfo ing....')
  // const stakeInfo = await stake.getStakedInfo(owner);
  // console.log('sns getStakedInfo success', stakeInfo)

  console.log('stake stakeNFT ing....')
  const stakeNFTTx = await stake.stakeNFT(tokenId, 1, 10, 10);
  stakeNFTTx.wait();
  console.log('sns stakeNFT success')
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

async function mint(stake, FollowNFT, linkKey, owner) {
  console.log('stake getStakedInfo ing....')
  const stakeInfo = await stake.getStakedInfo('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded');
  console.log('sns getStakedInfo success', stakeInfo)

  const followNFT = await FollowNFT.attach(stakeInfo.friendNFTAddress);
  console.log('followNFT attach success', followNFT.address)

  const floorPrices = await followNFT.getFloorPrices();
  console.log('floorPrices:', floorPrices);

  console.log('linkKey approve ing...');
  const approveTx = await linkKey.approve(followNFT.address, floorPrices)
  approveTx.wait()
  console.log('linkKey approve success...');

  console.log('followNFT safeMint ing....')
  const safeMintTx = await followNFT.safeMint();
  safeMintTx.wait();
  console.log('followNFT safeMint success')

  const totalSupply = await followNFT.totalSupply();
  const balanceOf = await followNFT.balanceOf(owner);
  console.log('totalSupply', totalSupply, ":balanceOf", balanceOf)
}

async function unstakeNFT(FollowNFT, stake, owner) {
  console.log('stake getStakedInfo ing....')
  const stakeInfo = await stake.getStakedInfo(owner);
  console.log('sns getStakedInfo success', stakeInfo)

  const followNFT = await FollowNFT.attach(stakeInfo.friendNFTAddress);
  console.log('followNFT attach success', followNFT.address)
  const totalSupply = await followNFT.totalSupply();
  const balanceOf = await followNFT.balanceOf(owner);
  console.log('totalSupply', totalSupply, ":balanceOf", balanceOf)


  //test transfer
  console.log('stake unstakeNFT ing....')
  const unstakeNFTTx = await stake.unstakeNFT();
  unstakeNFTTx.wait();
  console.log('sns unstakeNFT success')
  //test transfer
}

async function setOrder(stake, FollowNFT, trading, owner) {
  console.log('stake getStakedInfo ing....')
  const stakeInfo = await stake.getStakedInfo('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded');
  console.log('sns getStakedInfo success', stakeInfo)

  const followNFT = await FollowNFT.attach(stakeInfo.friendNFTAddress);
  console.log('followNFT attach success', followNFT.address)

  // console.log('followNFT:setApprovalForAll ing');
  // const setApprovalForAllTx = await followNFT.setApprovalForAll(trading.address, true);
  // setApprovalForAllTx.wait();
  // console.log('followNFT: setApprovalForAll success')

  // console.log('followNFT:setApprovalForAll ing');
  // const setApprovalForAllTx = await followNFT.setApprovalForAll("0x96b5Ae79949b20f45Dd01566c4d896169CFCC521", true);
  // setApprovalForAllTx.wait();
  // console.log('followNFT: setApprovalForAll success')

  // console.log('followNFT:safeTransferFrom ing');
  // const safeTransferFromTx = await followNFT.transferFrom("0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded", "0x7A1A9567Dd868D24D49F00201107463b0114fe55", 9);
  // safeTransferFromTx.wait();
  // console.log('followNFT: safeTransferFromTx success')

  console.log('owner:', owner);
  const balance = await followNFT.balanceOf(owner);
  const tokenId = await followNFT.tokensOfOwner(owner)
  console.log('owner:tokenId:', tokenId);

  // console.log('trading setOrder ing....')
  // const setOrderTx = await trading.setOrder(followNFT.address, testAddress.keyAddress, ethers.BigNumber.from("10000000000"), tokenId[0]);
  // setOrderTx.wait();
  // console.log('trading setOrder success')

  console.log('trading getOrder ing....')
  const order = await trading.getOrder('0xc8bd9dE4336cB94bc08e12578380437cFEdE6d79', '0xa90BB9A665aaBdce24B1990bbF61cB696516d34A');
  console.log('trading getOrder success', order)

}

async function cancelOrder(trading, owner) {
  console.log('trading cancelOrder ing....')
  const cancelOrderTx = await trading.cancelOrder(testAddress.followAddress);
  cancelOrderTx.wait();
  console.log('trading cancelOrder success')

}

async function buy(trading, linkKey, owner) {
  console.log('trading getOrder ing....')
  const order = await trading.getOrder('0xf27Ac7cff0C02C11794B9115248097BD040E4C9c', testAddress.followAddress)
  console.log('trading getOrder success', order)

  console.log('linkKey approve ing....')
  const approveTx = await linkKey.approve(trading.address, testAddress.followAddress)
  approveTx.wait()
  console.log('linkKey approve success')

  console.log('trading buy ing...')
  const buyTx = await trading.buy('0xf27Ac7cff0C02C11794B9115248097BD040E4C9c', testAddress.followAddress, 9);
  buyTx.wait();
  console.log('trading buy success')
}

async function transferNFT(followNFT, groupNFT, owner) {
  // console.log('followNFT transfer ing....')
  // const transferFN = await followNFT.transferFrom('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded', '0x5435e8bb74d7ba8f4a76287dc0e75e203d87647e', 2)
  // transferFN.wait()
  // console.log('followNFT transfer success')

  console.log('groupNFT transfer ing....')
  const transferGN = await groupNFT.transferFrom('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded', '0x5435e8bb74d7ba8f4a76287dc0e75e203d87647e', 2)
  transferGN.wait()
  console.log('groupNFT transfer success')

}

async function testCreate() {
  const Test = await ethers.getContractFactory('Test')
  console.log('Test deploy ing....')
  const test = await Test.attach("0x2Fb2Bd06d165C94CDc5C5A818AF9CBA44086B7F9")
  console.log('Test deploy success', test.address)
  const createFoundationTx = await test.createFoundation()
  createFoundationTx.wait()
  console.log('Test createFoundation success')
}

async function upgradeSNSResolver(SNSResolver) {
  console.log('snsResolver upgrade ing....')
  const snsResolver = await upgrades.upgradeProxy(
    testAddress.snsResolverAddress,
    // "0x279339127a5B4b7580044E5De0DBEA201e0BF723",
    SNSResolver,
  )
  await snsResolver
  console.log('snsResolver upgrade success')
  return snsResolver
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
