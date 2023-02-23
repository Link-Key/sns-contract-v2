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

  const SNSV2_9 = await ethers.getContractFactory('SNSV2_9')
  const Inviter = await ethers.getContractFactory('InviteV2')

  // const sns = await upgradeSns(SNSV2_8);

  const sns = await attachOld(SNSV2_9)

  // await setIsOffer(sns, 1669824000, 604800, 604800, 500, true)

  await getPrice(sns, '0x35e831De90d5E691574645D57B5a20ebd0639EAC')

  await getInfo(sns, deployer.address, "xns.key", 1, '0x35e831De90d5E691574645D57B5a20ebd0639EAC')

  // await upgradeInviter(Inviter);
  // const invite = await attachOldInvite(Inviter)

  // await getTotalInviters(invite)

}

async function upgradeSns(SNSV2_9) {
  console.log('sns upgrade ing....')
  const sns = await upgrades.upgradeProxy(
    mainAddress.snsAddress,
    SNSV2_9,
  )
  await sns
  console.log('sns upgrade success')
  return sns
}

async function attachOld(SNSV2_9) {
  console.log('sns attach ing....')

  const sns = await SNSV2_9.attach(mainAddress.snsAddress);
  console.log('sns attach success', sns.address)

  return sns
}


async function setIsOffer(sns, offerStartTime_, offerPeriod_, offerTime_, offerRate_, offerOpen_) {
  console.log('sns setIsOffer ing....')

  let setIsOfferTx = await sns.setIsOffer(offerStartTime_, offerPeriod_, offerTime_, offerRate_, offerOpen_);
  setIsOfferTx.wait()

  console.log('sns setIsOfferTx success', offerStartTime_, offerPeriod_, offerTime_, offerRate_, offerOpen_)
}

async function getPrice(sns, inviter_) {
  console.log('sns getPrice ing....')

  let price = await sns.getPrice(inviter_);

  console.log('sns getPrice success', price)
}

async function getPrice(sns, inviter_) {
  console.log('sns getPrice ing....')

  let price = await sns.getPrice(inviter_);

  console.log('sns getPrice success', price)
}

async function getInfo(sns, addr_, name_, tokenId_, inviter_) {
  console.log('sns getInfo ing....')

  let info = await sns.getInfo(addr_, name_, tokenId_, inviter_);

  console.log('sns getInfo success', info)
}

async function upgradeInviter(Inviter) {
  console.log('inviter upgrade ing....', mainAddress.inviteAddress)
  const inviter = await upgrades.upgradeProxy(
    mainAddress.inviteAddress,
    Inviter,
  )
  await inviter
  console.log('inviter upgrade success')
  return inviter
}

async function attachOldInvite(Inviter) {
  const invite = await Inviter.attach(mainAddress.inviteAddress);
  console.log('invite attach success', invite.address)

  return invite
}

async function getTotalInviters(invite) {

  console.log('invite getTotalInviters ing....')
  const totalInviters = await invite.getTotalInviters();
  console.log('invite getTotalInviters success', totalInviters)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
