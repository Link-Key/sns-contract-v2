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
  const SNSResolver = await ethers.getContractFactory('SNSResolverV2_4')
  const Invite = await ethers.getContractFactory('Invite')

  const linkKey = await LinkKey.attach(testAddress.keyAddress)
  console.log('LinkKey deployed to:', linkKey.address)

  // const { sns, snsResolver, stake, trading } = await deploy(SNSV2_4, SNSResolver, Stake, Trading, deployer.address);

  const { sns, stake, trading, snsResolver } = await attachOld(SNSV2_4, Stake, Trading, SNSResolver)

  const { invite } = await loadInvite(Invite)

  await snsSetting(sns, snsResolver, invite, stake, trading, deployer.address);



  // await snsSetCoin(sns, deployer.address);

  // await inviteSet(invite)

  // await testMint(sns)

}

async function deploy(SNSV2_4, SNSResolver, Stake, Trading, owner) {

  console.log('sns&snsResolverg deploy ing....')
  const sns = null;
  // const sns = await upgrades.deployProxy(
  //   SNSV2_4,
  //   [testAddress.keyAddress,
  //     "SNSTest",
  //     "SNST",
  //     owner
  //   ],
  //   {
  //     initializer: 'initialize',
  //   },
  // )
  // await sns.deployed()
  // console.log('sns deploy success', sns.address)

  const snsResolver = await upgrades.deployProxy(
    SNSResolver,
    [testAddress.newSnsAddress],
    {
      initializer: 'initialize',
    },
  )
  await snsResolver.deployed()
  console.log('snsResolver deploy success', snsResolver.address)

  const stake = null;
  // console.log('stake&trading deploy ing....')
  // const stake = await upgrades.deployProxy(
  //   Stake,
  //   [],
  //   {
  //     initializer: 'initialize',
  //   },
  // )
  // await stake.deployed()
  // console.log('stake deploy success', stake.address)

  const trading = null;
  // const trading = await upgrades.deployProxy(
  //   Trading,
  //   [],
  //   {
  //     initializer: 'initialize',
  //   },
  // )
  // await trading.deployed()
  // console.log('trading deploy success', trading.address)

  return { sns, snsResolver, stake, trading }
}

async function snsSetting(sns, snsResolver, invite, stake, trading, owner) {
  console.log('sns setDefaultResolverAddress ing....')
  const setDefaultResolverAddressTx = await sns.setDefaultResolverAddress(snsResolver.address);
  setDefaultResolverAddressTx.wait();
  console.log('sns setDefaultResolverAddress success')

  // console.log('sns initializeInvite ing....')
  // const initializeInviteTx = await sns.initializeInvite(invite.address);
  // initializeInviteTx.wait();
  // console.log('sns initializeInvite success')


  // console.log('sns setCoins ing....')
  // const setCoinsTx = await sns.setCoins(
  //   1,
  //   testAddress.keyAddress,
  //   ethers.BigNumber.from("1000000000000000000"),
  //   true,
  //   10
  // )
  // setCoinsTx.wait();

  // const setCoinsTx1 = await sns.setCoins(
  //   2,
  //   testAddress.keyAddress,
  //   ethers.BigNumber.from("1000000000000000000"),
  //   true,
  //   10
  // )
  // setCoinsTx1.wait();

  // const setCoinsTx2 = await sns.setCoins(
  //   3,
  //   testAddress.keyAddress,
  //   ethers.BigNumber.from("1000000000000000000"),
  //   true,
  //   10
  // )
  // setCoinsTx2.wait();
  // console.log('sns setCoins success')

  // console.log('sns setStakeAddress ing....')
  // const setStakeAddressTx = await sns.setStakeAddress(stake.address);
  // setStakeAddressTx.wait();
  // console.log('sns setStakeAddress success')

  // console.log('stake setAddress ing....')
  // const setAddressTx = await stake.setAddress(
  //   sns.address,
  //   owner,
  //   ethers.BigNumber.from("1000000000000000000"),
  //   ethers.BigNumber.from("10000000000000000000"),
  //   testAddress.keyAddress,
  //   "0x36144dA36EBbEB1b8Cf24795Ca641E315241fC7E",
  //   "0xE080b9152A9BF4d57E87dC8F111Da069215013b9",
  //   ethers.BigNumber.from("1000000000000000000"),
  //   ethers.BigNumber.from("10000000000000000000")
  // );
  // setAddressTx.wait();
  // console.log('stake setAddress success')

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

async function inviteSet(invite) {

  console.log('invite updateAddress ing....')
  const updateAddressTx = await invite.updateAddress(
    testAddress.newSnsAddress,
    1
  );
  updateAddressTx.wait()
  console.log('invite updateAddress success')
}


async function attachOld(SNSV2_4, Stake, Trading, SNSResolver) {
  console.log('sns&stake&trading attach ing....')

  const sns = await SNSV2_4.attach(testAddress.newSnsAddress);
  console.log('sns attach success', sns.address)

  const stake = await Stake.attach(testAddress.newStakeAddress);
  console.log('stake attach success', stake.address)

  const trading = await Trading.attach(testAddress.newTradingAddress);
  console.log('trading attach success', trading.address)

  const snsResolver = await SNSResolver.attach(testAddress.newSnsResolverAddress);
  console.log('trading attach success', snsResolver.address)

  return { sns, stake, trading, snsResolver }
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

async function testMint(sns) {
  const price = await sns.getPrice('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded')
  // const maticPrice = price.maticPrice
  console.log('price', price)
  const keyPrice = price.keyPrice
  console.log('keyPrice', keyPrice)

  const maticPrice = price.maticPrice
  console.log('maticPrice', maticPrice)

  console.log('SNS Mint ing...')
  const mintTx = await sns.mint('peifeng', {
    value: maticPrice,
  })
  await mintTx.wait()
  console.log('SNS Mint success')

}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
