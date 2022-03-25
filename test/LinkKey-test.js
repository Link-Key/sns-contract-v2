// const { expect } = require('chai')
// const { ethers, upgrades } = require('hardhat')

// // Import utilities from Test Helpers
// const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')

// describe('LinkKey', function () {
//   before(async function () {
//     this.LinkKey = await ethers.getContractFactory('LinkKey')
//   })

//   beforeEach(async function () {
//     this.linkKey = await upgrades.deployProxy(
//       this.LinkKey,
//       [
//         'linkkeyTest',
//         'lkt',
//         1672329600,
//         '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
//         '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
//         '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
//         '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
//         150,
//       ],
//       {
//         initializer: 'initialize',
//       },
//     )
//     await this.linkKey.deployed()
//   })

//   it('Test get function[releaseTime] ', async function () {
//     expect(await this.linkKey.releaseTime()).to.equal(1672329600)
//     console.log(await this.linkKey.owner())
//   })

//   it('Test set function[setMinter&Mint]', async function () {
//     const setMinterTx = await this.linkKey.setMinter(
//       '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
//     )

//     // wait until the transaction is mined
//     await setMinterTx.wait()

//     const mintTx = await this.linkKey.mint()

//     // wait until the transaction is mined
//     await mintTx.wait()

//     expect(
//       await this.linkKey.balanceOf(
//         '0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded',
//       ),
//     ).to.equal('150000000000000000000')
//   })
// })
