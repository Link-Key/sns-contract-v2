// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./ERC721AQueryable.sol";
import "./INFT.sol";

contract FollowNFT is ERC721AQueryable, Ownable, INFT{

    address private _keyAddress;// test
    // address private _keyAddress = 0x5CA9A8405499a1Ee8fbB1849f197b2b7e518985f;// main
    address private _stakeAddress;//test
    // address private _stakeAddress = 0x472CeBBa2D856485d5752506806241Eaf284e1ea;//main
    address private _tradingAddress;//test
    // address private _tradingAddress = 0x472CeBBa2D856485d5752506806241Eaf284e1ea;//main
    uint256 private _floorPrices;
    uint256 private _taxPreparation;

    // constructor(string memory nftName, string memory nftSymbol,address owner,address keyAddress,uint256 floorPrices,uint256 ownerMintAccount,uint256 taxPreparation) ERC721A(nftName, nftSymbol){
    //     require(ownerMintAccount<=150,"401");
    //     _stakeAddress = _msgSender();
    //     _keyAddress = keyAddress;
    //     _floorPrices = floorPrices;
    //     _taxPreparation = taxPreparation;
    //     _transferOwnership(owner);
    //     _safeMint(owner,ownerMintAccount);
    // }

    constructor() ERC721A("", ""){
    }

    function initialize(string memory nftName, string memory nftSymbol,address owner,uint256 floorPrices,uint256 ownerMintAccount,uint256 taxPreparation) public override {
        _keyAddress = 0xFA12F5ff3c2A137a02F1678E50c54276624b50FB;
        _stakeAddress = 0x279339127a5B4b7580044E5De0DBEA201e0BF723;
        _tradingAddress = 0xB1d8DCf3d31FF8A50F5023883332d03827009056;
        require(ownerMintAccount<=150,"401");
        require(_msgSender() == _stakeAddress,"not you");
        super._setNameAndSymbol(nftName,nftSymbol);
        _floorPrices = floorPrices;
        _taxPreparation = taxPreparation;
        _transferOwnership(owner);
        _safeMint(owner,ownerMintAccount);
    }

    function safeMint() public {
        require(balanceOf(_msgSender())==0,"402");
        IERC20(_keyAddress).transferFrom(_msgSender(), owner(), _floorPrices);
        require(totalSupply()<150,"403");
        _safeMint(_msgSender(),1);
    }

    function setTaxPreparation(uint256 taxPreparation) public onlyOwner{
        _taxPreparation = taxPreparation;
    }

    function getTaxPreparation() public view returns(uint256 taxPreparation){
        taxPreparation = _taxPreparation;
    }

    function getFloorPrices() public view returns(uint256 floorPrices){
        floorPrices = _floorPrices;
    }

    function kill() public override{
       if (_stakeAddress == _msgSender()) { // 权限检查
          selfdestruct(payable(0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded)); // 销毁合约
       }
    }

    receive() external payable {
        uint256 amount = msg.value;
        payable(0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded).transfer(amount);
    }

    //----override transfer------
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override(ERC721A) {
        if(to != owner()){
             require(balanceOf(to) == 0,"404");
        }
        
        super.transferFrom(from,to,tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override(ERC721A) {
        safeTransferFrom(from,to,tokenId,"");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override(ERC721A) {
        require(balanceOf(to) == 0,"404");
        super.safeTransferFrom(from,to,tokenId,_data);
    }

    //transferOwnerShip
    function renounceOwnership() public override virtual onlyOwner {
       require(false,"you can't transferOwnership");
    }

    function transferOwnership(address newOwner) public override virtual onlyOwner {
       require(false,"you can't transferOwnership");
    }

}
