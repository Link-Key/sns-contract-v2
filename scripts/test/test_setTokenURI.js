const { ethers, upgrades } = require('hardhat')

async function main() {
  const SNS = await ethers.getContractFactory('SNS')
  const sns = await SNS.attach('0x5fE611901dDc8a874D274626a8E793b3E07bb40D')
  console.log('load SNS success')
  console.log('SNS setTokenURI ing...')
  const setTokenURITx = await sns.setTokenURI(
    ['1', '2'],
    [
      'https://bafyreidr42ragoszglihegmqt2zuit7q4l7oi6evjko6w26wxckzkycfve.ipfs.dweb.link/metadata.json',
      'https://bafyreidr42ragoszglihegmqt2zuit7q4l7oi6evjko6w26wxckzkycfve.ipfs.dweb.link/metadata.json',
    ],
  )
  await setTokenURITx.wait()
  console.log('SNS setTokenURI success')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
