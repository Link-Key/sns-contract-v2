const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const ether = require('@openzeppelin/test-helpers/src/ether')

describe('SNS', function () {
  //deploy
  before(async function () {
    this.LinkKey = await ethers.getContractFactory('LinkKey')
    this.SNS = await ethers.getContractFactory('SNS')
    this.SNSResolver = await ethers.getContractFactory('SNSResolver')

    // this.linkKey = await upgrades.deployProxy(
    //   this.LinkKey,
    //   [
    //     'linkkeyTest',
    //     'lkt',
    //     1672329600,
    //     '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
    //     '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
    //     '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
    //     '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
    //     150,
    //   ],
    //   {
    //     initializer: 'initialize',
    //   },
    // )
    // await this.linkKey.deployed()

    this.linkKey = await this.LinkKey.deploy()
    console.log('LinkKey deployed to:', this.linkKey.address)
    const initializerTx = await this.linkKey.initialize(
      'linkkeyTest',
      'lkt',
      1672329600,
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      150,
    )
    await initializerTx.wait()
    console.log('LinkKey initializer success')

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

    this.snsResolver = await upgrades.deployProxy(
      this.SNSResolver,
      [this.sns.address],
      {
        initializer: 'initialize',
      },
    )
    await this.snsResolver.deployed()

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

    console.log('linkkey----', this.linkKey.address)

    console.log('sns----', this.sns.address)

    console.log('snsResolver----', this.snsResolver.address)
  })

  //every it
  beforeEach(async function () {})

  //Test----------------------------LinkKey.sol--------------------
  it('[1]linkKey:Test call function[releaseTime] ', async function () {
    expect(await this.linkKey.releaseTime()).to.equal(1672329600)
    console.log('ownerAddress----', await this.linkKey.owner())
  })

  //Test----------------------------SNS.sol--------------------
  it('[2]sns:Test call function[releaseTime] ', async function () {
    expect(await this.sns.getTokenMinted()).to.equal(0)
  })

  it('[2+1]sns:Test call function[getPrice]', async function () {
    expect(await this.sns.getPrice()).to.equal(ethers.utils.parseEther('1'))
  })

  it('[3]sns:Test send function[mint] ', async function () {
    expect(
      await this.sns.getNameOfOwner(
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      ),
    ).to.equal('')

    const price = await this.sns.getPrice()
    await this.sns.mint('peifeng', {
      value: price,
    })

    expect(
      await this.sns.getNameOfOwner(
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      ),
    ).to.equal('peifeng.key')

    expect(
      await this.linkKey.balanceOf(
        '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      ),
    ).to.equal('150000000000000000000')
  })

  it('[4]sns:Test send function[transfer] ', async function () {
    expect(
      await this.sns.getNameOfOwner(
        '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      ),
    ).to.equal('')

    await this.sns.transfer(
      '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      'peifeng.key',
    )

    expect(
      await this.sns.getNameOfOwner(
        '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      ),
    ).to.equal('peifeng.key')

    expect(
      await this.linkKey.balanceOf(
        '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      ),
    ).to.equal('150000000000000000000')

    expect(await this.sns.getTokenMinted()).to.equal(1)
  })

  it('[5]sns:Test send function[setTokenURI] ', async function () {
    const tokenId = await this.sns.getTokenIdOfName('peifeng.key')

    expect(await this.sns.tokenURI(tokenId)).to.equal('')

    await this.sns._setSigleTokenURI(tokenId, 'www.baidu.com')

    expect(await this.sns.tokenURI(tokenId)).to.equal('www.baidu.com')

    expect(await this.sns.getTokenMinted()).to.equal(1)
  })

  it('[6]sns:Test send function[shortNameMint] ', async function () {
    await this.sns.setShortNameAllowed([
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    ])

    expect(
      await this.sns.getNameOfOwner(
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      ),
    ).to.equal('')

    await this.sns.shortNameMint('123')

    expect(
      await this.sns.getNameOfOwner(
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      ),
    ).to.equal('123.key')

    expect(
      await this.linkKey.balanceOf(
        '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      ),
    ).to.equal('300000000000000000000')

    expect(await this.sns.getTokenMinted()).to.equal(2)
  })

  it('[7]sns:Test send function[managerMint] ', async function () {
    expect(
      await this.sns.getNameOfOwner(
        '0x185BA2eD90fA734c34abd6F2283f22C785afba75',
      ),
    ).to.equal('')

    expect(
      await this.sns.getNameOfOwner(
        '0x29D3fb9961f98a97C6fDac8d9162cF958e4C6Af5',
      ),
    ).to.equal('')

    expect(
      await this.sns.getNameOfOwner(
        '0x0b4b6D35bA540704F7Ae85F523050F67be45025e',
      ),
    ).to.equal('')

    expect(
      await this.sns.getNameOfOwner(
        '0x9bB26e0C85689F24552EEB7dcd90Ee5f233715EA',
      ),
    ).to.equal('')

    await this.sns.batchManagerMint(
      ['a ', ' a'],
      [
        '0x185BA2eD90fA734c34abd6F2283f22C785afba75',
        '0x29D3fb9961f98a97C6fDac8d9162cF958e4C6Af5',
      ],
      false,
    )

    expect(await this.sns.getTokenMinted()).to.equal(3)

    expect(
      await this.sns.getNameOfOwner(
        '0x185BA2eD90fA734c34abd6F2283f22C785afba75',
      ),
    ).to.equal('a.key')

    expect(
      await this.sns.getNameOfOwner(
        '0x29D3fb9961f98a97C6fDac8d9162cF958e4C6Af5',
      ),
    ).to.equal('')

    //---------------------iskeyMint

    await this.sns.batchManagerMint(
      ['bsc', 'meta'],
      [
        '0x0b4b6D35bA540704F7Ae85F523050F67be45025e',
        '0x9bB26e0C85689F24552EEB7dcd90Ee5f233715EA',
      ],
      true,
    )

    expect(await this.sns.getTokenMinted()).to.equal(5)

    expect(
      await this.sns.getNameOfOwner(
        '0x0b4b6D35bA540704F7Ae85F523050F67be45025e',
      ),
    ).to.equal('bsc.key')

    expect(
      await this.sns.getNameOfOwner(
        '0x9bB26e0C85689F24552EEB7dcd90Ee5f233715EA',
      ),
    ).to.equal('meta.key')

    expect(
      await this.linkKey.balanceOf(
        '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
      ),
    ).to.equal('600000000000000000000')
  })

  it('[7+]sns:Test send function[price increases] ', async function () {
    expect(await this.sns.getTokenMinted()).to.equal(5)
    const price = await this.sns.getPrice()
    console.log('price--------', price)
  })

  //Test----------------------------SNSResolver.sol--------------------
  it('[8]snsResolver:Test send function[setAllProperties] ', async function () {
    const name = await this.sns.getNameOfOwner(
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    )
    expect(await this.snsResolver.getAllProperties(name)).to.equal('')

    await this.snsResolver.setAllProperties(
      name,
      '0+1+2+3+4+5+6+7+8+9+10+11+12+13+14',
    )

    expect(await this.snsResolver.getAllProperties(name)).to.equal(
      '0+1+2+3+4+5+6+7+8+9+10+11+12+13+14',
    )

    expect(await this.snsResolver.getEthAddress(name)).to.equal('0')

    expect(await this.snsResolver.getBtcAddress(name)).to.equal('1')

    expect(await this.snsResolver.getLtcAddress(name)).to.equal('2')

    expect(await this.snsResolver.getDogeAddress(name)).to.equal('3')

    expect(await this.snsResolver.getIpfsUrl(name)).to.equal('4')

    expect(await this.snsResolver.getUrl(name)).to.equal('5')

    expect(await this.snsResolver.getEmail(name)).to.equal('6')

    expect(await this.snsResolver.getAvatar(name)).to.equal('7')

    expect(await this.snsResolver.getDescription(name)).to.equal('8')

    expect(await this.snsResolver.getNotice(name)).to.equal('9')

    expect(await this.snsResolver.getKeywords(name)).to.equal('10')

    expect(await this.snsResolver.getComGithub(name)).to.equal('11')

    expect(await this.snsResolver.getComReddit(name)).to.equal('12')

    expect(await this.snsResolver.getComTwitter(name)).to.equal('13')

    expect(await this.snsResolver.getOrgTelegram(name)).to.equal('14')
  })

  it('[9]snsResolver:Test send function[upgrade] ', async function () {
    this.SNSResolverV2 = await ethers.getContractFactory('SNSResolverV2')
    console.log('Upgrading snsResolver...')
    this.snsResolverV2 = await upgrades.upgradeProxy(
      this.snsResolver.address,
      this.SNSResolverV2,
    )
    this.snsResolverV2.deployed()
    console.log('snsResolver upgraded')
    const name = await this.sns.getNameOfOwner(
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    )
    expect(await this.snsResolverV2.getAllProperties(name)).to.equal(
      '0+1+2+3+4+5+6+7+8+9+10+11+12+13+14',
    )

    await this.snsResolverV2.setAllProperties(
      name,
      '0+1+2+3+4+5+6+7+8+9+10+11+12+13+14+15+16+17+18+19+20+21',
    )

    expect(await this.snsResolverV2.getAllProperties(name)).to.equal(
      '0+1+2+3+4+5+6+7+8+9+10+11+12+13+14+15+16+17+18+19+20+21',
    )

    expect(await this.snsResolverV2.getEthAddress(name)).to.equal('0')

    expect(await this.snsResolverV2.getBtcAddress(name)).to.equal('1')

    expect(await this.snsResolverV2.getLtcAddress(name)).to.equal('2')

    expect(await this.snsResolverV2.getDogeAddress(name)).to.equal('3')

    expect(await this.snsResolverV2.getIpfsUrl(name)).to.equal('4')

    expect(await this.snsResolverV2.getUrl(name)).to.equal('5')

    expect(await this.snsResolverV2.getEmail(name)).to.equal('6')

    expect(await this.snsResolverV2.getAvatar(name)).to.equal('7')

    expect(await this.snsResolverV2.getDescription(name)).to.equal('8')

    expect(await this.snsResolverV2.getNotice(name)).to.equal('9')

    expect(await this.snsResolverV2.getKeywords(name)).to.equal('10')

    expect(await this.snsResolverV2.getComGithub(name)).to.equal('11')

    expect(await this.snsResolverV2.getComReddit(name)).to.equal('12')

    expect(await this.snsResolverV2.getComTwitter(name)).to.equal('13')

    expect(await this.snsResolverV2.getOrgTelegram(name)).to.equal('14')

    expect(await this.snsResolverV2.getChineseName(name)).to.equal('15')

    expect(await this.snsResolverV2.getEnglishName(name)).to.equal('16')

    expect(await this.snsResolverV2.getJapaneseName(name)).to.equal('17')

    expect(await this.snsResolverV2.getJapaneseName1(name)).to.equal('18')

    expect(await this.snsResolverV2.getJapaneseName2(name)).to.equal('19')

    expect(await this.snsResolverV2.getJapaneseName3(name)).to.equal('20')

    expect(await this.snsResolverV2.getJapaneseName4(name)).to.equal('21')
  })
})
