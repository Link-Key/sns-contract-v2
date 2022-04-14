// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {ethers, upgrades} = require("hardhat");

async function mainTest() {
    /**
     * 测试流程
     * 【部署测试】
     * 1. 部署SNSV2,SNSResolverV2,Linkkey，获得地址后部署invite合约，测试各个方法是否正常，添加邀请人 howard、bowen、karma
     * 2. 对SNS合约初始化Invite方法
     * 【功能测试】
     * 3. 调取sns 的 getPrice、getCoinsPrice 方法
     * 4. 调取sns 的 mint 方法，有邀请码 / 无邀请码 / 错误的邀请码 3种情况，验证清分是否正常
     * 5. 调取sns 的 mintByMoreCoins 方法，有邀请码 / 无邀请码 / 错误的邀请码 3种情况，验证清分是否正常
     * 6. 查询Invite合约内，邀请次数、总次数数据是否正常
     */

    const feeTo = '0x863244EfC9a55113cadcdf38f964F12131B99e53';
    const applyInviterPrice = 10**16;

    const LinkKey = await ethers.getContractFactory("LinkKey");
    const linkKey = await upgrades.deployProxy(
        LinkKey,
        [
            "linkkeyTest",
            "lkt",
            1672329600,
            feeTo,
            feeTo,
            feeTo,
            feeTo,
            150,
        ],
        {
            initializer: "initialize",
        }
    );
    console.log("LinkKey deployed to:", linkKey.address);
    console.log("LinkKey initializer success");

    const SNSV2 = await ethers.getContractFactory("SNSV2");
    const snsV2 = await upgrades.deployProxy(
        SNSV2,
        [
            linkKey.address,
            "SNSV2",
            "SNSV2",
            feeTo,
        ],
        {
            initializer: "initialize",
        }
    );
    await snsV2.deployed();
    console.log("SNS deployed to:", snsV2.address);

    const SNSResolverV2 = await ethers.getContractFactory("SNSResolverV2");
    const snsResolverV2 = await upgrades.deployProxy(
        SNSResolverV2,
        [snsV2.address],
        {
            initializer: "initialize",
        }
    );
    await snsResolverV2.deployed();
    console.log("SNSResolver deployed to:", snsResolverV2.address);

    console.log("LinkKey setMinter ing...");
    // linkKey setMinter(sns address)
    const setMinterTx = await linkKey.setMinter(snsV2.address);
    // wait until the transaction is mined
    await setMinterTx.wait();
    console.log("LinkKey setMinter success");

    console.log("SNS setDefaultResolverAddress ing...");
    const setDefaultResolverTx = await snsV2.setDefaultResolverAddress(
        snsResolverV2.address
    );
    // wait until the transaction is mined
    await setDefaultResolverTx.wait();
    console.log("SNS setDefaultResolverAddress success");

    // deploy invite
    const Invite = await ethers.getContractFactory('Invite')
    console.log('Deploying Invite...')

    const invite = await upgrades.deployProxy(
        Invite,
        [
            snsV2.address,
            linkKey.address,
            feeTo,
            applyInviterPrice
        ],
        {
            initializer: 'initialize',
        },
    )
    await invite.deployed()
    console.log('Invite deployed to:', invite.address)

    // call initializeInvite of SNSV2 contract
    snsV2.initializeInvite(inviteAddress)
    console.log("initializeInvite success")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
mainTest().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
