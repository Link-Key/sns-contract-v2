const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const ether = require('@openzeppelin/test-helpers/src/ether')

describe('SNS', function () {
  before(async function () {
    this.LinkKey = await ethers.getContractFactory('LinkKey')
    this.SNS = await ethers.getContractFactory('SNS')
    this.SNSResolver = await ethers.getContractFactory('SNSResolver')
  })

  beforeEach(async function () {
    this.linkKey = await upgrades.deployProxy(
      this.LinkKey,
      [
        'linkkeyTest',
        'lkt',
        1672329600,
        '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
        '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
        '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
        '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
        150,
      ],
      {
        initializer: 'initialize',
      },
    )
    await this.linkKey.deployed()
    console.log('linkkey----', this.linkKey.address)

    this.sns = await upgrades.deployProxy(
      this.SNS,
      [
        this.linkKey.address,
        'SNSTest',
        'snst',
        '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      ],
      {
        initializer: 'initialize',
      },
    )
    await this.sns.deployed()
    console.log('sns----', this.sns.address)

    this.snsResolver = await upgrades.deployProxy(
      this.SNSResolver,
      [this.sns.address],
      {
        initializer: 'initialize',
      },
    )
    await this.snsResolver.deployed()
    console.log('snsResolver----', this.snsResolver.address)

    //linkKey setMinter(sns address)
    const setMinterTx = await this.linkKey.setMinter(this.sns.address)
    // wait until the transaction is mined
    await setMinterTx.wait()

    //sns setDefaultResolver(snsResolver address)
    const setDefaultResolverTx = await this.sns.setDefaultResolverAddress(
      this.snsResolver.address,
    )
    // wait until the transaction is mined
    await setDefaultResolverTx.wait()
  })

  it('linkKey:Test get function[releaseTime] ', async function () {
    expect(await this.linkKey.releaseTime()).to.equal(1672329600)
    console.log(await this.linkKey.owner())
  })

  it('linkKey:Test set function[setMinter&Mint]', async function () {
    const setMinterTx = await this.linkKey.setMinter(
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    )

    // wait until the transaction is mined
    await setMinterTx.wait()

    const mintTx = await this.linkKey.mint()

    // wait until the transaction is mined
    await mintTx.wait()

    expect(
      await this.linkKey.balanceOf(
        '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      ),
    ).to.equal('150000000000000000000')
  })

  //Test---SNS.sol---
  it('sns:Test get function[releaseTime] ', async function () {
    expect(await this.sns._tokenMinted()).to.equal(0)
  })

  it('sns:Test get function[mint] ', async function () {
    expect(
      await this.sns.getSNSName('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),
    ).to.equal('')

    await this.sns.mint('peifeng', {
      value: ethers.utils.parseEther('10'),
    })

    expect(
      await this.sns.getSNSName('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),
    ).to.equal('peifeng.key')
  })
})
