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

  const Inviter = await ethers.getContractFactory('InviteV2')
  const SNS = await ethers.getContractFactory('SNSV2_9')

  const LinkKey = await ethers.getContractFactory('LinkKey')

  const linkKey = await LinkKey.attach(testAddress.keyAddress)
  console.log('LinkKey deployed to:', linkKey.address)

  // const sns = await upgradeSns(SNS);
  const { sns } = await attachOld(SNS)

  await _invite(sns);

  const inviter = await upgradeInviter(Inviter);
  // const { sns } = await attachOld(SNS)


  // await setting(sns, deployer.address);

  // await testFreeMint(sns, deployer.address);
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

async function _invite(sns) {
  console.log('sns _invite ing....')
  const invite = await sns._invite();
  console.log('sns _invite success', invite)

}

async function testFreeMint(sns, owner) {

  const info = await sns.getInfo("0x68aF7EF8182F4Bf50e32814AeCaaeB747bfc905F", "", 0)
  console.log('info', info)

  console.log('sns shortNameMint ing....')
  const shortNameMintTx = await sns.shortNameMint(
    '456',
    1,
    {
      value: info.priceOfShort.maticPrice
    }
  );
  shortNameMintTx.wait();
  console.log('sns shortNameMint success')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
