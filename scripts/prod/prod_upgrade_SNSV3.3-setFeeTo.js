// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { link } = require('ethereum-waffle');
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')
const {
  mainAddress
} = require('../../address.json')

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("the account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()));

  const SNS = await ethers.getContractFactory('SNSV3_3')
  const Invite = await ethers.getContractFactory('InviteV2')
  const Stake = await ethers.getContractFactory('Stake')
  const Trading = await ethers.getContractFactory('Trading')


  // const sns = await upgradeSns(SNS);
  const sns = await attachOld(SNS)
  const invite = await attachInvite(Invite)
  const stake = await attachStake(Stake)
  const trading = await attachTrading(Trading)

  await setFeeTo(sns, invite, stake, trading)

}

async function upgradeSns(SNS) {
  console.log('sns upgrade ing....')
  const sns = await upgrades.upgradeProxy(
    mainAddress.snsAddress,
    SNS,
    {
      timeout: 0,
      pollingInterval: 500
    }
  )
  await sns
  console.log('sns upgrade success')
  return sns
}


async function attachOld(SNS) {
  const sns = await SNS.attach(mainAddress.snsAddress);
  console.log('sns attach success', sns.address)

  const owner = await sns.owner();
  console.log('sns owner', owner)
  return sns
}

async function attachInvite(Invite) {
  const invite = await Invite.attach(mainAddress.inviteAddress);
  console.log('invite attach success', invite.address)

  const owner = await invite.owner();
  console.log('invite owner', owner)
  return invite
}

async function attachStake(Stake) {
  const stake = await Stake.attach(mainAddress.stakeAddress);
  console.log('stake attach success', stake.address)

  const owner = await stake.owner();
  console.log('stake owner', owner)
  return stake
}

async function attachTrading(Trading) {
  const trading = await Trading.attach(mainAddress.tradingAddress);
  console.log('trading attach success', trading.address)

  const owner = await trading.owner();
  console.log('trading owner', owner)
  return trading
}

async function setFeeTo(sns, invite, stake, trading) {
  // console.log("sns setFeeTo ing...")
  // const snsSetFeeToTx = await sns.setFeeTo(mainAddress.newFeeToAddress)
  // await snsSetFeeToTx
  // console.log("sns setFeeTo success")

  console.log("invite setFeeTo ing...")
  const inviteSetFeeToTx = await invite.updateAddress(mainAddress.newFeeToAddress, 3)
  await inviteSetFeeToTx
  console.log("invite setFeeTo success")

  console.log("stake setFeeTo ing...")
  const stakeSetFeeToTx = await stake.setAddress(
    mainAddress.snsAddress,
    mainAddress.newFeeToAddress,
    ethers.BigNumber.from("100000000000000000000"), //100key
    ethers.BigNumber.from("500000000000000000000"), //500key
    mainAddress.keyAddress,
    mainAddress.followAddress,
    mainAddress.groupAddress,
    ethers.BigNumber.from("10000000000000000000"), //10 key
    ethers.BigNumber.from("2000000000000000000"), //2 key
  )
  await stakeSetFeeToTx
  console.log("stake setFeeTo success")

  console.log("trading setFeeTo ing...")
  // const fee = await trading.getFee()
  // console.log("fee", fee)
  const tradingSetFeeToTx = await trading.setFee(25, mainAddress.newFeeToAddress)
  await tradingSetFeeToTx
  console.log("trading setFeeTo success")

}


main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
