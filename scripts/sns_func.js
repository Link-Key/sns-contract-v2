const { ethers, upgrades } = require('hardhat')

async function main() {
  const LinkKey = await ethers.getContractFactory('LinkKey')
  const linkKey = await LinkKey.attach(
    '0x86F30aa6eE5D014C647838C84aD070d3fdC581D5',
  )

  const SNS = await ethers.getContractFactory('SNS')
  const sns = await SNS.attach('0xC0c0E9A45E9BEB870A8FB4500A68527B4fbA55f6')

  const SNSResolver = await ethers.getContractFactory('SNSResolver')
  const snsResolver = await SNSResolver.attach(
    '0x3E21F3Bfd781d76e2Cf2e6664b0909E6c596520d',
  )

  console.log('SNS mint ing...')
  const mintTx = await sns.mint('peifeng', {
    value: ethers.utils.parseEther('10'),
  })
  await mintTx.wait()
  const name = await sns.getNameOfOwner(
    '0x343F8c28c45a9b6927439C35F2C4140230be9187',
  )
  console.log('SNS mint success,name:', name)

  console.log('SNS setResolverInfo ing...')
  const setAllPropertiesTx = await snsResolver.setAllProperties(
    name,
    '0+1+2+3+4+5+6+7+8+9+10+11+12+13+14',
  )
  await setAllPropertiesTx.wait()
  const properties = await snsResolver.getAllProperties(name)
  console.log('properties is:', properties)

  const btcAddress = await snsResolver.getBtcAddress(name)
  console.log('btcAddress is:', btcAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
