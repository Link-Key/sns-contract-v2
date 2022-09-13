// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "erc721a/contracts/extensions/IERC721AQueryable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "erc721a/contracts/IERC721A.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import "../util/LibString.sol";

import "./ISns.sol";
import "./INFT.sol";
import "./CloneFactory.sol";


contract Stake is OwnableUpgradeable,CloneFactory{
    using AddressUpgradeable for address;
    using LibString for string;

    address private _demoFollowNFTAddress;//test
    address private _demoGroupNFTAddress;//test
    address private _snsAddress;
    address private _feeTo;
    mapping(uint256 => uint256) private _feeAmounts;
    address private _keyAddress;

    uint256 private _defaultFloorPrices;

    struct StakeInfo{
        uint256 stakedTokenId;
        address friendNFTAddress;
        address groupNFTAddress;
    }

    mapping(address => StakeInfo) private _stakedInfos;

    event StakeNFT(
        address owner,
        uint256 tokenId,
        uint256 createType,
        address newNFTAddress,
        string nftName,
        string nftSymbol,
        address keyAddress,
        uint256 floorPrices,
        uint256 ownerMintAccount,
        uint256 taxPreparation,
        uint256 stakeNFTAt
        );

    event UnstakeNFT(address owner,uint256 tokenId,address friendNFTAddress,address groupAddress,uint256 unstakeNFTAt);
    
    function initialize() public initializer {
        __Ownable_init();
        _demoFollowNFTAddress = 0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176;
        _demoGroupNFTAddress = 0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176;
        _snsAddress = 0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176;//test
        // _snsAddress = 0x19AD2b1F012349645C3173EA63F98948A2b43d27;//main

        _keyAddress = 0xFA12F5ff3c2A137a02F1678E50c54276624b50FB;//test
        // _keyAddress = 0x5CA9A8405499a1Ee8fbB1849f197b2b7e518985f;//main

        _feeTo = 0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded;//test
        _feeAmounts[1] = 1 ether;
        _feeAmounts[2] = 10 ether;

        _defaultFloorPrices = 1 ether;
    }

    function setAddress(address snsAddress_,address feeTo_,uint256 feeAmount1_,uint256 feeAmount2_,address keyAddress_,address demoFollowNFTAddress_,address demoGroupNFTAddress_) public onlyOwner{
        _snsAddress = snsAddress_;
        _feeTo = feeTo_;
        _feeAmounts[1] = feeAmount1_;
        _feeAmounts[2] = feeAmount2_;
        _keyAddress = keyAddress_;
        _demoFollowNFTAddress = demoFollowNFTAddress_;
        _demoGroupNFTAddress = demoGroupNFTAddress_;
    }

    //createType_ 1 followNFT 2 groupNFT
    function stakeNFT(uint256 tokenId_,uint256 createType_,uint256 ownerMintAccount_,uint256 taxPreparation_) public {
        
        if(_feeAmounts[createType_]!=0){
            IERC20(_keyAddress).transferFrom(_msgSender(), _feeTo, _feeAmounts[createType_]);
        }
        require(_msgSender() == IERC721A(_snsAddress).ownerOf(tokenId_),"201");
        if(!ISns(_snsAddress).getStake(tokenId_)){
            ISns(_snsAddress).setStake(tokenId_, true);
        }
        address newNFTAddress;
        string memory snsName = ISns(_snsAddress).getInfo(address(0), "", tokenId_).nameOfTokenId;
        string memory newNFTName;
        if(createType_ == 1){
            require(_stakedInfos[_msgSender()].friendNFTAddress == address(0),"you have Issued");
            newNFTAddress = createClone(_demoFollowNFTAddress);
            _stakedInfos[_msgSender()].friendNFTAddress = newNFTAddress;
            newNFTName = snsName;
        }else if(createType_ == 2){
            require(_stakedInfos[_msgSender()].groupNFTAddress == address(0),"you have Issued");
            newNFTAddress = createClone(_demoGroupNFTAddress);
            _stakedInfos[_msgSender()].groupNFTAddress = newNFTAddress;
            newNFTName = snsName.concat(".group");
        }else{
            require(false,"createType_ is error");
        }
        _stakedInfos[_msgSender()].stakedTokenId = tokenId_;
        
        INFT(newNFTAddress).initialize(newNFTName, newNFTName, _msgSender(), _defaultFloorPrices, ownerMintAccount_, taxPreparation_);
        
        emit StakeNFT(_msgSender(),tokenId_,createType_,newNFTAddress,newNFTName,newNFTName,_keyAddress,_defaultFloorPrices, ownerMintAccount_, taxPreparation_,block.timestamp);
    }

    function unstakeNFT() public {
        StakeInfo memory stakeInfo = _stakedInfos[_msgSender()];
        uint256 tokenId = stakeInfo.stakedTokenId;
        require(tokenId != 0,"202");
        uint totalSupply;
        if(stakeInfo.friendNFTAddress != address(0)){
            totalSupply = IERC721A(stakeInfo.friendNFTAddress).totalSupply();
            require(IERC721A(stakeInfo.friendNFTAddress).balanceOf(_msgSender()) == totalSupply,"203");
            INFT(payable(stakeInfo.friendNFTAddress)).kill();
        }
        if(stakeInfo.groupNFTAddress != address(0)){
            totalSupply = IERC721A(stakeInfo.groupNFTAddress).totalSupply();
            require(IERC721A(stakeInfo.groupNFTAddress).balanceOf(_msgSender()) == totalSupply,"204");
            INFT(payable(stakeInfo.groupNFTAddress)).kill();
        }
        
        delete _stakedInfos[_msgSender()];
        ISns(_snsAddress).setStake(tokenId, false);

        emit UnstakeNFT(_msgSender(),tokenId,stakeInfo.friendNFTAddress,stakeInfo.groupNFTAddress,block.timestamp);
    }

    function getFee(uint256 createType_) public view returns(address keyAddress,uint256 feeAmount){
        keyAddress = _keyAddress;
        feeAmount = _feeAmounts[createType_];
    }

    function getStakedInfo(address owner_) public view returns(StakeInfo memory stakeInfo){
        stakeInfo = _stakedInfos[owner_];
    }


    receive() external payable {
        uint256 amount = msg.value;
        payable(owner()).transfer(amount);
    }

}