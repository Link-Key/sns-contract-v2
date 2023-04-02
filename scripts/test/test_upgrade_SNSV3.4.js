// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { link } = require('ethereum-waffle');
const { BigNumber } = require('ethers');
const hre = require('hardhat')
const { ethers, upgrades } = require('hardhat')
const {
  testAddress, mainAddress
} = require('../../address.json')

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("the account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()));

  const SNS = await ethers.getContractFactory('SNSV3_4')

  const LinkKey = await ethers.getContractFactory('LinkKey')

  const linkKey = await LinkKey.attach(testAddress.keyAddress)
  console.log('LinkKey deployed to:', linkKey.address)

  // const sns = await upgradeSns(SNS);
  const { sns } = await attachOld(SNS)

  // await setPriceSystemInfo(sns);

  await getPrice(sns, deployer.address, 'am1', deployer.address);

  // await mint(sns, linkKey, deployer.address, 'team', deployer.address);

  // await InstitutionalRegist(sns)

  // await ownerTransfer(sns)

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


async function setPriceSystemInfo(sns) {
  console.log('sns setPriceSystemInfo ing....', ethers.BigNumber.from("10000000000000000000"))
  const setPriceSystemInfoTx = await sns.setPriceSystemInfo(
    ethers.BigNumber.from("10000000000000000000"),
    10000000,
    100,
    8,
    10,
    60,
    100500
  )
  setPriceSystemInfoTx.wait()
  console.log('sns setPriceSystemInfo success')
}

async function getPrice(sns, minter, name, inviter) {

  // console.log('sns getInfo ing....')
  // const info = await sns.getInfo(minter, name, 0)
  // console.log('info', info)

  // console.log(await sns.getTokenMinted1())

  console.log(await sns.getPriceSystemInfo())

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
  const InstitutionalRegistTx = await sns.InstitutionalRegist('0x343F8c28c45a9b6927439C35F2C4140230be9187', 'okx');
  InstitutionalRegistTx.wait()
  console.log('sns InstitutionalRegist success')

}

async function ownerTransfer(sns) {
  console.log('sns ownerTransfer ing....')
  const ownerTransferTx = await sns.fixOwnerTransfer('0x29D3fb9961f98a97C6fDac8d9162cF958e4C6Af5', 54);
  ownerTransferTx.wait()
  console.log('sns ownerTransfer success')

}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
