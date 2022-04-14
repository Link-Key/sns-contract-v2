// scripts/deploy_upgradeable_box.js
const {ethers, upgrades} = require('hardhat')

const deployInvite = async function main(snsAddress, keyAddress, feeTo, price) {
    const Invite = await ethers.getContractFactory('Invite')
    console.log('Deploying Invite...')

    const invite = await upgrades.deployProxy(
        Invite,
        [
            snsAddress,
            keyAddress,
            feeTo,
            price
        ],
        {
            initializer: 'initialize',
        },
    )
    await invite.deployed()
    console.log('Invite deployed to:', invite.address)
    return invite.address
}

// main()

exports.deployInvite = deployInvite