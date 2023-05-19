// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { link } = require("ethereum-waffle");
const { BigNumber } = require("ethers");
const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");
const { mainAddress } = require("../../address.json");

const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

const emptyAddress = "0x0000000000000000000000000000000000000000";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("the account:", deployer.address);
  console.log(
    "Account balance:",
    hre.ethers.utils.formatEther(await deployer.getBalance())
  );

  const SNS = await ethers.getContractFactory("SNSV3_5");

  const LinkKey = await ethers.getContractFactory("LinkKey");

  const linkKey = await LinkKey.attach(mainAddress.keyAddress);
  console.log("LinkKey deployed to:", linkKey.address);

  // const sns = await upgradeSns(SNS);
  const sns = await attachOld(SNS);

  // await setTokenMinted(sns);

  await setWhiteListInfo(sns);

  // await getPrice(sns, deployer.address, 'am1', deployer.address);

  // await mint(sns, linkKey, deployer.address, 'zgs', deployer.address);

  // await InstitutionalRegist(sns)

  // await ownerTransfer(sns)
}

async function upgradeSns(SNS) {
  console.log("sns upgrade ing....");
  const sns = await upgrades.upgradeProxy(mainAddress.snsAddress, SNS, {
    timeout: 0,
    pollingInterval: 500,
  });
  await sns;
  console.log("sns upgrade success");
  return sns;
}

async function attachOld(SNS) {
  const sns = await SNS.attach(mainAddress.snsAddress);
  console.log("sns attach success", sns.address);

  return sns;
}

async function setTokenMinted(sns) {
  console.log("sns setTokenMinted ing....");
  const setTokenMintedTx = await sns.setTokenMinted(100550);
  setTokenMintedTx.wait();
  console.log("sns setTokenMinted success");
}

async function setWhiteListInfo(sns) {
  const threeMerkleRoot_ =
    "0xd87c43539e5c416bdb3c99781dbb6b2857b2ad48227656a36e6b8b308db8926b";
  const fourSevenMerkleRoot_ =
    "0x5586dd6f399bd6be324131ee968a2e3497c6f7207350b18ea991ab0815f91251";
  const eightPlusMerkleRoot_ =
    "0x6ffd2e0c1421574e56b1af8df4407a86f3790a23a7c2772c79d180e10529bcb9";
  // 3位数：cf555bae7fe14b68bd65b538a6716bdad9a376980d17466e8b40d4f7274aa878
  // 4位数:0bd99b592001efa7a46d403f481f2620da3abb381fab8397b731932fc13a149c
  // 8位数:9a36dda52b3b9936d2a6c7952f7cfeec50d99950c7dff92189d78e46229a3c7d
  console.log("sns setWhiteListInfo ing....");
  const setWhiteListInfoTx = await sns.setWhiteListInfo(
    threeMerkleRoot_,
    fourSevenMerkleRoot_,
    eightPlusMerkleRoot_
  );
  setWhiteListInfoTx.wait();
  console.log("sns setWhiteListInfo success");
}

async function getPrice(sns, minter, name, inviter) {
  // console.log('sns getInfo ing....')
  // const info = await sns.getInfo(minter, name, 0)
  // console.log('info', info)

  // console.log(await sns.getTokenMinted1())

  // console.log(await sns.getPriceSystemInfo())

  const proof = [
    "0x663a0035e40a318a8b2e55f6711cdc44763338a741afbb9cec3e6bfae8f505c9",
    "0xd2776203d61482d4372a922d5b5818dddaad78da22476c1fe362f1cab27ae46d",
    "0xddbd061beb5bf5acd9c7d9d255e9b53a7030980e707d4ca6b76c9b362ea91b95",
    "0x73325802a2cba251a8f90eae45521edfc246f86a1b92ff2a89204c1d87ddd1c5",
    "0xb5dd91dbbd8f9e515eb9e92a55b6f1efc54c5b1b01579cc98e4e41e8024a09c6",
    "0x8c15c1213b8001396067b8b1cb9c1009acc62f09c1ba0e8471bbdb9df44557a8",
    "0x2a5416680049c720d105b2ea46fe021bcaa9da4717211fbdca03906e15ecb991",
    "0x8b1c9466acb12383c886f7d5e5f38063112e43e725fb15d826ba56d2acf71bba",
    "0x2b9b3795389b2d89e68123272d3fdf6b149a20ee7f8eef4f120302e5c8c5402a",
    "0xf2ea6fc236a3f848500a27291f1fd9641dc0bce333f3c643729008f200eed52f",
    "0xf5f26912afb7e0baad10b1288c3057c892f65f428850c517da04a66d6e7c78e0",
  ];

  console.log("sns getPrice ing....");
  const price = await sns.getPrice(minter, name, inviter, proof);
  console.log("sns getPrice success", price);
}

async function mint(sns, linkKey, minter, name, inviter) {
  const proof = [
    "0x01ad3285880b8ca676497ef4718b976534b676509d7b433f8b5919aa77277576",
    "0x89bf65d3ac993b0c9597ba50c0a3fa75d17723b78648ec604d37d4d5b81253a9",
    "0xd62a2d94ca51b03237a710ff0355394070765d73064c170fa4884a4ff0128145",
    "0xbda1b57471a374516925ea7971cc9fb52988c643cfafbb877048bf2af96bb1d7",
    "0xf85bc6f82b2c6268cee254e008a100e2d6f9ffc38b4df1cccb2e41f468640191",
    "0x6d751c077e7367ab2813b3484e1b8c75bc72fe01618f9ed0bdcb7e1ee3d87b1f",
  ];

  const prices = await sns.getPrice(minter, name, inviter, proof);
  console.log("prices", prices);

  // console.log('LinkKey approve ing...')
  // const approveTx = await linkKey.approve(
  //   sns.address,
  //   prices.keyPrice,
  // )
  // await approveTx.wait()
  // console.log('LinkKey approve success')

  console.log("sns mint ing...");
  const mintTx = await sns.mint(name, 0, inviter, proof, {
    value: prices.maticPrice,
  });
  await mintTx.wait();
  console.log("sns mint success");
}

async function InstitutionalRegist(sns) {
  console.log("sns InstitutionalRegist ing....");
  const InstitutionalRegistTx = await sns.InstitutionalRegist(
    "0x343F8c28c45a9b6927439C35F2C4140230be9187",
    "okx"
  );
  InstitutionalRegistTx.wait();
  console.log("sns InstitutionalRegist success");
}

async function ownerTransfer(sns) {
  console.log("sns ownerTransfer ing....");
  const ownerTransferTx = await sns.fixOwnerTransfer(
    "0x29D3fb9961f98a97C6fDac8d9162cF958e4C6Af5",
    54
  );
  ownerTransferTx.wait();
  console.log("sns ownerTransfer success");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
