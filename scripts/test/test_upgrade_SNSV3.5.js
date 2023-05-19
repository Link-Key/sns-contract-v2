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

const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

const emptyAddress = '0x0000000000000000000000000000000000000000'

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("the account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()));

  const SNS = await ethers.getContractFactory('SNSV3_5')

  const LinkKey = await ethers.getContractFactory('LinkKey')

  const linkKey = await LinkKey.attach(testAddress.keyAddress)
  console.log('LinkKey deployed to:', linkKey.address)

  // const sns = await upgradeSns(SNS);
  const sns = await attachOld(SNS)

  // await setTokenMinted(sns);

  await setWhiteListInfo(sns);

  // await getPrice(sns, deployer.address, 'am1', deployer.address);

  await mint(sns, linkKey, deployer.address, 'aaa', deployer.address);

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

  return sns
}


async function setTokenMinted(sns) {
  console.log('sns setTokenMinted ing....')
  const setTokenMintedTx = await sns.setTokenMinted(100550)
  setTokenMintedTx.wait()
  console.log('sns setTokenMinted success')
}

async function setWhiteListInfo(sns) {

  let threeWhitelistAddresses = [
    '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
    '0x7A1A9567Dd868D24D49F00201107463b0114fe55',
    '0xE4336D25e9Ca0703b574a6fd1b342A4d0327bcfa',
    '0xeDcB8a28161f966C5863b8291E80dDFD1eB78491',
    '0x77cbd0fa30F83a249da282e9fE90A86d7936FdE7',
    '0xc39F9406284CcAeB426D0039a3F6ADe14573BaFe',
    '0x16Beb6b55F145E4269279B82c040B7435f1088Ee',
    '0x900b2909127Dff529f8b4DB3d83b957E6aE964c2',
    '0xeA2A799793cE3D2eC6BcD066563f385F25401e95',
    '0x78f196b668A3740fe2703a81CE50A05aF201B6b9',
    '0x179683F5c9Defe5e430f5f3e6d06A5Bc9b5A06d7'
  ];
  let threeLeafNodes = threeWhitelistAddresses.map(address => keccak256(address));
  let threeTree = new MerkleTree(threeLeafNodes, keccak256, { sortPairs: true });
  let threeMerkleRoot_ = '0x' + threeTree.getRoot().toString('hex');
  console.log('threeMerkleRoot_', threeMerkleRoot_);

  let leaf = keccak256('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded');
  let proof = threeTree.getHexProof(leaf);
  console.log('Proof of 0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded: ', proof);

  console.log(await sns.isMerk('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded', threeMerkleRoot_, proof))

  console.log(await sns.getPrice('0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded', 'abc', emptyAddress, proof))
  let fourSevenWhitelistAddresses = [
    '0xf27Ac7cff0C02C11794B9115248097BD040E4C9c',
    '0x68aF7EF8182F4Bf50e32814AeCaaeB747bfc905F',
    '0xE4336D25e9Ca0703b574a6fd1b342A4d0327bcfa',
    '0xeDcB8a28161f966C5863b8291E80dDFD1eB78491',
    '0x77cbd0fa30F83a249da282e9fE90A86d7936FdE7',
    '0xc39F9406284CcAeB426D0039a3F6ADe14573BaFe',
    '0x16Beb6b55F145E4269279B82c040B7435f1088Ee',
    '0x900b2909127Dff529f8b4DB3d83b957E6aE964c2',
    '0xeA2A799793cE3D2eC6BcD066563f385F25401e95',
    '0x088a872e4d6fe1175e29612B228eA8dcE4BDa8AD',
    '0x7f11f713d61335fF093F373807D90f78193c14C2'
  ];
  let fourSevenLeafNodes = fourSevenWhitelistAddresses.map(address => keccak256(address));
  let fourSevenTree = new MerkleTree(fourSevenLeafNodes, keccak256, { sortPairs: true });
  let fourSevenMerkleRoot_ = '0x' + fourSevenTree.getRoot().toString('hex');
  console.log('fourSevenMerkleRoot_', fourSevenMerkleRoot_);

  let eightPlusWhitelistAddresses = [
    '0x343F8c28c45a9b6927439C35F2C4140230be9187',
    '0xE4336D25e9Ca0703b574a6fd1b342A4d0327bcfa',
    '0xeDcB8a28161f966C5863b8291E80dDFD1eB78491',
    '0x77cbd0fa30F83a249da282e9fE90A86d7936FdE7',
    '0xc39F9406284CcAeB426D0039a3F6ADe14573BaFe',
    '0x16Beb6b55F145E4269279B82c040B7435f1088Ee',
    '0x900b2909127Dff529f8b4DB3d83b957E6aE964c2',
    '0xeA2A799793cE3D2eC6BcD066563f385F25401e95',
    '0x4A78bAE481853ca7C9A2aC68532937Df4755618c',
    '0x0B4AD7474806010035456723BFE1DF13b89DfDba'
  ];
  let eightPlusLeafNodes = eightPlusWhitelistAddresses.map(address => keccak256(address));
  let eightPlusTree = new MerkleTree(eightPlusLeafNodes, keccak256, { sortPairs: true });
  let eightPlusMerkleRoot_ = '0x' + eightPlusTree.getRoot().toString('hex');
  console.log('eightPlusMerkleRoot_', eightPlusMerkleRoot_);


  // console.log('sns setWhiteListInfo ing....')
  // const setWhiteListInfoTx = await sns.setWhiteListInfo(threeMerkleRoot_, fourSevenMerkleRoot_, eightPlusMerkleRoot_)
  // setWhiteListInfoTx.wait()
  // console.log('sns setWhiteListInfo success')
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

  let threeWhitelistAddresses = [
    '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
    '0x7A1A9567Dd868D24D49F00201107463b0114fe55',
    '0xE4336D25e9Ca0703b574a6fd1b342A4d0327bcfa',
    '0xeDcB8a28161f966C5863b8291E80dDFD1eB78491',
    '0x77cbd0fa30F83a249da282e9fE90A86d7936FdE7',
    '0xc39F9406284CcAeB426D0039a3F6ADe14573BaFe',
    '0x16Beb6b55F145E4269279B82c040B7435f1088Ee',
    '0x900b2909127Dff529f8b4DB3d83b957E6aE964c2',
    '0xeA2A799793cE3D2eC6BcD066563f385F25401e95',
    '0x78f196b668A3740fe2703a81CE50A05aF201B6b9',
    '0x179683F5c9Defe5e430f5f3e6d06A5Bc9b5A06d7'
  ];
  let threeLeafNodes = threeWhitelistAddresses.map(address => keccak256(address));
  let threeTree = new MerkleTree(threeLeafNodes, keccak256, { sortPairs: true });
  let threeMerkleRoot_ = '0x' + threeTree.getRoot().toString('hex');
  console.log('threeMerkleRoot_', threeMerkleRoot_);

  let leaf = keccak256(minter);
  let proof = threeTree.getHexProof(leaf);
  console.log('Proof of 0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded: ', proof);

  console.log(await sns.isMerk(minter, threeMerkleRoot_, proof))

  const prices = await sns.getPrice(minter, name, inviter, proof);
  console.log('prices', prices)

  // console.log('LinkKey approve ing...')
  // const approveTx = await linkKey.approve(
  //   sns.address,
  //   prices.keyPrice,
  // )
  // await approveTx.wait()
  // console.log('LinkKey approve success')

  console.log('sns mint ing...')
  const mintTx = await sns.mint(name, 0, inviter, proof, {
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
