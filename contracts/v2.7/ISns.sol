// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface ISns {
    struct Response{
        bool shortNameAllowed;
        bool addressRegistered;
        string nameOfOwner;
        bool recordExists;
        uint256 tokenIdOfName;
        address resolverOwner;
        address resolverAddress;
        string nameOfTokenId;
        PriceOfShort priceOfShort;
    }

    struct PriceOfShort{
        uint256 maticPrice;
        address keyAddress;
        uint256 keyPrice;
    }

    struct Coin{
        address _coinAddress;
        uint256 _coinsPrice;
        bool _coinsDestroy;
        uint256 _coinsDestroyPercentage;
        bool _isClose;
    }

    function setStake(uint256 tokenId_,bool staked) external;

    function getStake(uint256 tokenId_) external view returns(bool tokenStaked);

    function getInfo(address addr_,string memory name_,uint256 tokenId_) external view returns (Response memory addressResp);
}