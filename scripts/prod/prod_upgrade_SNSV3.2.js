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

  const SNS = await ethers.getContractFactory('SNSV3_2')

  const sns = await upgradeSns(SNS);
  // const { sns } = await attachOld(SNS)

  await setSystemInfo(sns);

  await getPrice(sns, deployer.address, 'team', deployer.address);

  // await mint(sns, linkKey, deployer.address, 'team', deployer.address);

}

async function upgradeSns(SNS) {
  console.log('sns upgrade ing....')
  const sns = await upgrades.upgradeProxy(
    testAddress.snsAddress,
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


async function setSystemInfo(sns) {
  console.log('sns setSystemInfo ing....')
  const setSystemInfoTx = await sns.setSystemInfo(8)
  setSystemInfoTx.wait()
  console.log('sns setSystemInfo success')
}

async function getPrice(sns, minter, name, inviter) {

  console.log('sns getInfo ing....')
  const info = await sns.getInfo(minter, name, 0)
  console.log('info', info)

  console.log('sns getPrice ing....')
  const price = await sns.getPrice(minter, name, inviter)
  console.log('sns getPrice success', price)
}

async function mint(sns, linkKey, minter, name, inviter) {

  const prices = await sns.getPrice(minter, name, inviter);
  console.log('prices', prices)

  // console.log('LinkKey approve ing...')
  // const approveTx = await linkKey.approve(
  //   sns.address,
  //   prices.keyPrice,
  // )
  // await approveTx.wait()
  // console.log('LinkKey approve success')

  console.log('sns mint ing...')
  const mintTx = await sns.mint(name, 0, inviter, {
    value: prices.maticPrice
  })
  await mintTx.wait()
  console.log('sns mint success')

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
