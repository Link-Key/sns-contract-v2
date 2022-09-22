// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "erc721a/contracts/extensions/IERC721AQueryable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";


import "./ISns.sol";
import "./INFT.sol";


contract Trading is OwnableUpgradeable{
    using AddressUpgradeable for address;
    using SafeMathUpgradeable for uint256;

    struct Order{
        address nftOwner;
        //add
        address nftAddress;
        address erc20Address;
        uint256 erc20Amount;
        uint256 tokenId;
        bool status;
    }

    mapping(address=>mapping(address=>Order)) private _orders;

    uint256 private _feeRate;
    address private _feeTo;
    
    event ChangeOrder(address owner,Order order,uint256 changeAt);

    event Buy(address buyer,address indexed owner,Order order,uint256 changeAt);
    
    function initialize() public initializer {
        __Ownable_init();
        _feeRate = 25;
        _feeTo = 0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded;//test
        // _feeTo = 0x5455E2960e243671966d92deEA4C7eDac49305aF;//main
    }

    function setFee(uint256 feeRate_,address feeTo_) public onlyOwner{
        _feeRate = feeRate_;
        _feeTo = feeTo_;
    }
    // add getFee
    function getFee() public view returns(address feeTo,uint256 feeRate){
        feeTo = _feeTo;
        feeRate = _feeRate;
    }

    function setOrder(address nftAddress_,address erc20Address,uint256 erc20Amount, uint256 tokenId) public{
        address owner = OwnableUpgradeable(nftAddress_).owner();
        require(_msgSender()!= owner && _msgSender() == IERC721(nftAddress_).ownerOf(tokenId),"301");
        require(IERC721(nftAddress_).isApprovedForAll(_msgSender(), address(this)),"302");
        _orders[_msgSender()][nftAddress_].nftOwner = owner;
        _orders[_msgSender()][nftAddress_].nftAddress = nftAddress_;
        _orders[_msgSender()][nftAddress_].erc20Address = erc20Address;
        _orders[_msgSender()][nftAddress_].erc20Amount = erc20Amount;
        _orders[_msgSender()][nftAddress_].tokenId = tokenId;
        _orders[_msgSender()][nftAddress_].status = true;

        emit ChangeOrder(_msgSender(), _orders[_msgSender()][nftAddress_],block.timestamp);
    }

    function cancelOrder(address nftAddress_) public{
        _orders[_msgSender()][nftAddress_].status = false;

        delete _orders[_msgSender()][nftAddress_];

        emit ChangeOrder(_msgSender(), _orders[_msgSender()][nftAddress_],block.timestamp);
    }

    function buy(address seller_,address nftAddress_,uint256 tokenId_) public {
        Order memory order = _orders[seller_][nftAddress_];
        require(order.status,"303");
        uint256 taxPreparation = INFT(nftAddress_).getTaxPreparation();
        uint256 feeAmount;
        uint256 taxPreparationAmount;
        if(_feeRate!= 0){
            feeAmount = order.erc20Amount.mul(_feeRate).div(1000);
            IERC20(order.erc20Address).transferFrom(_msgSender(),_feeTo,feeAmount);
        }
        if(taxPreparation!=0){
            taxPreparationAmount = order.erc20Amount.mul(taxPreparation).div(1000);
            IERC20(order.erc20Address).transferFrom(_msgSender(),order.nftOwner,taxPreparationAmount);
        }
        uint256 saferAmount = order.erc20Amount.sub(feeAmount).sub(taxPreparationAmount);
        IERC20(order.erc20Address).transferFrom(_msgSender(),seller_,saferAmount);

        IERC721(nftAddress_).transferFrom(seller_, _msgSender(), tokenId_);

        order.status = false;
        _orders[seller_][nftAddress_] = order;

        emit Buy(_msgSender(),seller_,order,block.timestamp);
    }

    function getOrder(address owner_,address nftAddress_) public view returns(Order memory order){
        order = _orders[owner_][nftAddress_];
    }

    receive() external payable {
        uint256 amount = msg.value;
        payable(owner()).transfer(amount);
    }

}