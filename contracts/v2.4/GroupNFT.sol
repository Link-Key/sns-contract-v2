// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./ERC721AQueryable.sol";
import "./INFT.sol";

contract GroupNFT is ERC721AQueryable, Ownable, INFT{

    address private _keyAddress;
    address private _stakeAddress;
    address private _tradingAddress;
    uint256 private _floorPrices;
    uint256 private _taxPreparation;

    constructor() ERC721A("", ""){
    }

    function initialize(string memory nftName, string memory nftSymbol,address owner,uint256 floorPrices,uint256 ownerMintAccount,uint256 taxPreparation) public override {
        // _keyAddress = 0x5CA9A8405499a1Ee8fbB1849f197b2b7e518985f;
        // _stakeAddress = 0x4417C0ABF812a943ca2491E0330970d42fa43E99;
        // _tradingAddress = 0x5E1E453C50AECCd16Fb2DaA8959FBBa8B35e5B63;
        _keyAddress = 0xFA12F5ff3c2A137a02F1678E50c54276624b50FB;
        _stakeAddress = 0xaA4F164fE5992CF7940C502aa2fDf53aFE09cD54;
        _tradingAddress = 0xB6Da7994180a6F074B0E1221ad8b4f89179088CA;
        require(ownerMintAccount<=1500,"401");
        require(_msgSender() == _stakeAddress,"not you");
        super._setNameAndSymbol(nftName,nftSymbol);
        _floorPrices = floorPrices;
        require(taxPreparation>0&&taxPreparation<=100,"taxPreparation error");
        _taxPreparation = taxPreparation;
        _transferOwnership(owner);
        _safeMint(owner,ownerMintAccount);
    }

    function safeMint() public {
        require(balanceOf(_msgSender())==0,"402");
        IERC20(_keyAddress).transferFrom(_msgSender(), owner(), _floorPrices);
        require(totalSupply()<1500,"403");
        _safeMint(_msgSender(),1);
    }

    function setTaxPreparation(uint256 taxPreparation) public onlyOwner{
        require(taxPreparation>0&&taxPreparation<=100,"taxPreparation error");
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
