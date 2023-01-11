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

  const linkKey = await LinkKey.attach(testAddress.keyAddress)
  console.log('LinkKey deployed to:', linkKey.address)

  const sns = await upgradeSns(SNS);
  // const { sns } = await attachOld(SNS)

  // await _invite(sns);

  // await deployInviter(Inviter);
  const invite = await attachOldInvite(Inviter)

  // await setInvite(sns);

  // await setSNSAddress(sns, invite);

  // await _invite(sns);

  // await addInviter(linkKey, invite)

  // await mint(sns, linkKey, deployer.address);

  // await getInviterIncome(sns, invite, deployer.address);

  // await InstitutionalRegist(sns);
}

async function upgradeSns(SNS) {
  console.log('sns upgrade ing....')
  const sns = await upgrades.upgradeProxy(
    testAddress.newSnsAddress,
    SNS,
  )
  await sns
  console.log('sns upgrade success')
  return sns
}


async function attachOld(SNS) {
  const sns = await SNS.attach(testAddress.newSnsAddress);
  console.log('sns attach success', sns.address)

  return { sns }
}

async function deployInviter(Inviter) {
  console.log('deploy Invite...')
  const invite = await upgrades.deployProxy(
    Inviter,
    [
      '0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176',
      '0xFA12F5ff3c2A137a02F1678E50c54276624b50FB',
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      1 * 10 ** 8
    ],
    {
      initializer: 'initialize',
    },
  )
  await invite.deployed()
  console.log('Invite deploy success to:', invite.address)
}

async function setInvite(sns) {
  console.log('sns setInvite ing....')
  const setInviteTx = await sns.initializeInvite('0x4C3cF7c8dcABc5514d30311BFC3FEE62e832D1B0')
  setInviteTx.wait()
  console.log('sns setInvite success')
}

async function upgradeInviter(Inviter) {
  console.log('inviter upgrade ing....', testAddress.inviteAddress)
  const inviter = await upgrades.upgradeProxy(
    testAddress.inviteAddress,
    Inviter,
  )
  await inviter
  console.log('inviter upgrade success')
  return inviter
}

async function attachOldInvite(Inviter) {
  const invite = await Inviter.attach(testAddress.inviteAddress);
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

  const info = await sns.getInfo(inviter, "", 0)
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
