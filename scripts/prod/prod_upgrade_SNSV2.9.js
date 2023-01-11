// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { link } = require('ethereum-waffle');
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')
const {
  testAddress, mainAddress
} = require('../../address.json')

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("the account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()));

  const Inviter = await ethers.getContractFactory('InviteV2')
  const SNS = await ethers.getContractFactory('SNSV2_9')

  const LinkKey = await ethers.getContractFactory('LinkKey')

  const linkKey = await LinkKey.attach(mainAddress.keyAddress)
  console.log('LinkKey deployed to:', linkKey.address)

  // const sns = await upgradeSns(SNS);
  const { sns } = await attachOld(SNS)

  // await _invite(sns);

  // await deployInviter(Inviter);

  // await upgradeInviter(Inviter);
  const invite = await attachOldInvite(Inviter)

  // await setInvite(sns);

  // await setSNSAddress(sns, invite);

  // await _invite(sns);

  // await addInviter(linkKey, invite)

  // await mint(sns, linkKey, deployer.address);

  await getInviterIncome(sns, invite, deployer.address);

  // await InstitutionalRegist(sns);
}

async function upgradeSns(SNS) {
  console.log('sns upgrade ing....')
  const sns = await upgrades.upgradeProxy(
    mainAddress.snsAddress,
    SNS,
  )
  await sns
  console.log('sns upgrade success')
  return sns
}


async function attachOld(SNS) {
  const sns = await SNS.attach(mainAddress.snsAddress);
  console.log('sns attach success', sns.address)

  return { sns }
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

async function addInviter(linkKey, invite) {

  console.log('LinkKey approve ing...')
  const approveTx = await linkKey.approve(
    testAddress.inviteAddress,
    1 * 10 ** 8,
  )
  await approveTx.wait()
  console.log('LinkKey approve success')

  console.log('Invite addInviter ing...')
  const addInviterTx = await invite.addInviter()
  await addInviterTx.wait()
  console.log('Invite addInviter success')
}

async function _invite(sns) {
  console.log('sns _invite ing....')
  const invite = await sns._invite();
  console.log('sns _invite success', invite)

  const coinsInfo = await sns.getCoinsInfo(1);
  console.log('sns getCoinsInfo success', coinsInfo)

}

async function mint(sns, linkKey, inviter) {

  // const prices = await sns.getPrice(inviter);
  // console.log('prices', prices)

  // console.log('LinkKey approve ing...')
  // const approveTx = await linkKey.approve(
  //   sns.address,
  //   prices.keyPrice,
  // )
  // await approveTx.wait()
  // console.log('LinkKey approve success')

  // console.log('Invite mint ing...')
  // const mintTx = await sns.mint('test29-1', 1, inviter)
  // await mintTx.wait()
  // console.log('Invite mint success')

  const info = await sns.getInfo(inviter, "", 0)
  console.log('info', info)

  console.log('sns shortNameMint ing....')
  const shortNameMintTx = await sns.shortNameMint(
    'test29-2',
    1,
    inviter,
    {
      value: info.priceOfShort.maticPrice
    }
  );
  shortNameMintTx.wait();
  console.log('sns shortNameMint success')
}

async function setSNSAddress(sns, invite) {
  console.log('invite updateAddress ing...')
  const updateAddressTx = await invite.updateAddress(
    sns.address,
    1
  )
  await updateAddressTx.wait()
  console.log('LinkKey updateAddress success')
}

async function getInviterIncome(sns, invite, inviter) {

  console.log('invite getInviterIncome ing....')
  const inviterIncome = await invite.getInviterIncome(inviter, 1);
  console.log('invite getInviterIncome success', inviterIncome)

  const info = await sns.getInfo(inviter, "", 0, "0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded")
  console.log('info', info)

  // const coinsInfo = await sns.getCoinsInfo(1);
  // console.log('sns getCoinsInfo success', coinsInfo)
  // 10000000000000000
  // 1000000000000000
}

async function InstitutionalRegist(sns) {
  console.log('sns InstitutionalRegist ing....')
  const InstitutionalRegistTx = await sns.InstitutionalRegist('0x4d7D215Fcd61a0FC4A84d1F4678Db57a8D19E9b9', 'ok');
  InstitutionalRegistTx.wait()
  console.log('sns InstitutionalRegist success')

}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
