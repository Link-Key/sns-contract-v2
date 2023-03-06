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

const mintKols = require('../../mintKOL.json')
const inviterAddress = require('../../inviterAddress.json')

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("the account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()));

  const SNS = await ethers.getContractFactory('SNSV3_2')
  const Invite = await ethers.getContractFactory('InviteV2')

  // const sns = await upgradeSns(SNS);
  const { sns } = await attachOld(SNS)

  // await setSystemInfo(sns);

  await getPrice(sns, deployer.address, 'wanbo', deployer.address);

  // await mint(sns, linkKey, deployer.address, 'team', deployer.address);

  // await InstitutionalRegist(sns)

  // await ownerTransfer(sns)

  // const invite = await attachInvite(Invite)

  // await getInfo(sns, invite)

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
  return { sns }
}

async function attachInvite(Invite) {
  const invite = await Invite.attach(mainAddress.inviteAddress);
  console.log('invite attach success', invite.address)

  const owner = await invite.owner();
  console.log('invite owner', owner)
  return invite
}


async function setSystemInfo(sns) {
  console.log('sns setSystemInfo ing....')
  const setSystemInfoTx = await sns.setSystemInfo(8)
  setSystemInfoTx.wait()
  console.log('sns setSystemInfo success')
}

async function getPrice(sns, minter, name, inviter) {

  console.log('sns getInfo ing....')
  const info = await sns.getInfo('0x67B368d90D50d618d66818671d8Dd02263875712', name, 0)
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

  for (let i = 0; i < mintKols.length; i++) {

    console.log('sns getInfo ing....')
    const info = await sns.getInfo(mintKols[i].address, mintKols[i].name + '.key', 0)
    console.log('info', info)
    if (info.nameOfOwner === '' && !info.recordExists) {
      console.log('sns InstitutionalRegist ing....')
      // const InstitutionalRegistTx = await sns.InstitutionalRegist(address[i], names[i]);
      // InstitutionalRegistTx.wait()
      console.log('sns InstitutionalRegist success')
    }
  }

  // console.log('sns InstitutionalRegist ing....')
  // console.log('sns getInfo ing....')
  // const info = await sns.getInfo('0xf34C06cd907AD036b75cee40755b6937176f24c3', 'k24.key', 0)
  // console.log('info', info)
  // const InstitutionalRegistTx = await sns.InstitutionalRegist('0xf34C06cd907AD036b75cee40755b6937176f24c3', 'k24');
  // InstitutionalRegistTx.wait()
  // console.log('sns InstitutionalRegist success')
}

async function ownerTransfer(sns) {

  let tokenIds = [28125, 28126, 28171, 28842, 28843]
  let address = ['0x67B368d90D50d618d66818671d8Dd02263875712', '0xc9B83e39f3FFe644883365d5C82b50A14250Bb9B', '0x694db880a0929131FFC6ea87FeA878b5fAd39444', '0x772144296D43E8D61a2c4271858e1b7b345B0E99', '0xb769d45aBd1b007a67E97c1B0D61e9DD0a44c3ea']
  for (let i = 0; i < tokenIds.length; i++) {
    console.log('sns ownerTransfer ing....')
    const ownerTransferTx = await sns.fixOwnerTransfer(address[i], tokenIds[i]);
    ownerTransferTx.wait()
    console.log('sns ownerTransfer success')
  }

}

async function getInfo(sns, invite) {
  let totalkey = 0;
  let totalMatic = 0;
  let totalUsdc = 0;
  for (let index = 0; index < inviterAddress.length; index++) {
    const inviter = inviterAddress[index];
    // console.log('inviter', inviter)
    // const info = await sns.getInfo(inviter.address, inviter.name, 0)
    // console.log('info:name' + inviter.name, info.resolverOwner)

    // const incomeKey = await invite.getInviterIncome(inviter.address, 0)
    // const incomeMatic = await invite.getInviterIncome(inviter.address, 1)
    // const incomeUsdc = await invite.getInviterIncome(inviter.address, 2)

    const incomeKey = inviter.income.key
    const incomeMatic = inviter.income.matic
    const incomeUsdc = inviter.income.usdc
    if (incomeKey != 0 || incomeMatic != 0 || incomeUsdc != 0) {
      // console.log('income: ' + inviter.name + ' address: ' + inviter.address
      //   + (incomeKey == 0 ? '' : ', key: ' + incomeKey)
      //   + (incomeMatic == 0 ? '' : ', matic: ' + incomeMatic)
      //   + (incomeUsdc == 0 ? '' : ', usdc: ' + incomeUsdc)
      // )

      console.log('dorp: ' + inviter.name + ' address: ' + inviter.address
        + (incomeKey == 0 ? '' : ', key: ' + incomeKey * 0.9)
        + (incomeMatic == 0 ? '' : ', matic: ' + ethers.utils.formatEther(ethers.BigNumber.from(incomeMatic * 0.9 + "")))
        + (incomeUsdc == 0 ? '' : ', usdc: ' + incomeUsdc * 0.9 / (10 ** 6))
      )

      totalkey += incomeKey;
      totalMatic += incomeMatic;
      totalUsdc += incomeUsdc;
    }
  }

  console.log('totalkey: ' + totalkey + ',totalMatic: ' + ethers.utils.formatEther(ethers.BigNumber.from(totalMatic * 0.9 + "")) + ',totalUsdc: ' + totalUsdc * 0.9 / (10 ** 6))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
