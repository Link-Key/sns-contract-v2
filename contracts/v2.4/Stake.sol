// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "erc721a/contracts/extensions/IERC721AQueryable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import "../util/LibString.sol";

import "./ISns.sol";
import "./FollowNFT.sol";
import "./GroupNFT.sol";


contract Stake is OwnableUpgradeable{
    using AddressUpgradeable for address;
    using LibString for string;
    
    mapping(address => uint256) private _stakedTokenIds;
    
    address private _snsAddress;
    address private _feeTo;
    mapping(uint256 => uint256) private _feeAmounts;
    address private _keyAddress;

    // address=>uint256=>bool creates 
    mapping(address=>mapping(uint256=>bool)) private _isIssueNFT;

    event StakeNFT(address owner,uint256 tokenId,uint256 createType,uint256 stakeNFTAt);

    event UnstakeNFT(address owner,uint256 tokenId,uint256 unstakeNFTAt);
    
    function initialize() public initializer {
        __Ownable_init();
        _snsAddress = 0x23bf7e618c5C2F2772620aa7D57fE6db27eeA176;//test
        // _snsAddress = 0x19AD2b1F012349645C3173EA63F98948A2b43d27;//main

        _keyAddress = 0xFA12F5ff3c2A137a02F1678E50c54276624b50FB;//test
        // _keyAddress = 0x5CA9A8405499a1Ee8fbB1849f197b2b7e518985f;//main

        _feeTo = 0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded;//test
        _feeAmounts[1] = 1 ether;
        _feeAmounts[2] = 10 ether;
    }

    function setAddress(address snsAddress_,address feeTo_,uint256 feeAmount1_,uint256 feeAmount2_,address keyAddress_) public onlyOwner{
        _snsAddress = snsAddress_;
        _feeTo = feeTo_;
        _feeAmounts[1] = feeAmount1_;
         _feeAmounts[2] = feeAmount2_;
        _keyAddress = keyAddress_;
    }

    //createType_ 1 followNFT 2 groupNFT
    function stakeNFT(uint256 tokenId_,uint256 createType_) public {
        require(!_isIssueNFT[_msgSender()][createType_],"you have Issue");
        if(_feeAmounts[createType_]!=0){
            IERC20(_keyAddress).transferFrom(_msgSender(), _feeTo, _feeAmounts[createType_]);
        }
        require(_msgSender() == IERC721(_snsAddress).ownerOf(tokenId_),"201");
        if(!ISns(_snsAddress).getStake(tokenId_)){
            ISns(_snsAddress).setStake(tokenId_, true);
            _stakedTokenIds[_msgSender()] = tokenId_;
        }
        _isIssueNFT[_msgSender()][createType_] = true;

        emit StakeNFT(_msgSender(),tokenId_,createType_,block.timestamp);
    }

    function unstakeNFT(address followNFT_,address groupNFT_) public {
        uint256 tokenId = _stakedTokenIds[_msgSender()];
        require(tokenId != 0,"202");
        
        require(IERC721(followNFT_).balanceOf(_msgSender()) == 150,"203");
        FollowNFT(payable(followNFT_)).kill();
        require(IERC721(groupNFT_).balanceOf(_msgSender()) == 1500,"204");
        GroupNFT(payable(groupNFT_)).kill();
        delete _stakedTokenIds[_msgSender()];
        ISns(_snsAddress).setStake(tokenId, false);

        emit UnstakeNFT(_msgSender(),tokenId,block.timestamp);
    }

    function getFee(uint256 createType_) public view returns(address keyAddress,uint256 feeAmount){
        keyAddress = _keyAddress;
        feeAmount = _feeAmounts[createType_];
    }

    function getIsIssueNFT(address owner_,uint256 type_) public view returns(bool){
        return _isIssueNFT[owner_][type_];
    }

    function getStakedTokenIds(address owner_) public view returns(uint256){
        return _stakedTokenIds[owner_];
    }

    receive() external payable {
        uint256 amount = msg.value;
        payable(owner()).transfer(amount);
    }

}