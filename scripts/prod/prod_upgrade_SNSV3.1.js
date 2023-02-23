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

  const Inviter = await ethers.getContractFactory('InviteV2')

  await upgradeInviter(Inviter);
  const invite = await attachOldInvite(Inviter)

  await getTotalInviters(invite)

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
  const totalInviters = await invite.canInviter('0x35e831De90d5E691574645D57B5a20ebd0639EAC');
  console.log('invite getTotalInviters success', totalInviters)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
