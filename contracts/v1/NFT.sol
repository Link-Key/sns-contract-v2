// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";



contract NFT is ERC721URIStorageUpgradeable, OwnableUpgradeable {

     function __NFT_init(string memory name_, string memory symbol_) internal onlyInitializing {
        __ERC721_init(name_,symbol_);
        __ERC721URIStorage_init();
        __Ownable_init();
        __NFT_init_unchained();
    }

    function __NFT_init_unchained() internal onlyInitializing {
        _tokenMinted = 0;
    }

    //The number that has been minted
    uint256 public _tokenMinted;

    /**
     * @dev mint and add _tokenMintedExpManager
     */
    function _addrMint() internal returns (uint256){
        uint256 tokenId = _tokenMinted + 1;
        super._safeMint(_msgSender(), tokenId);
        _tokenMinted += 1;
        return tokenId;
    }

    mapping(uint256 => bool) private setTokenURLOnce;


    /**
     * @dev mint and add _tokenMintedExpManager
     * @param tokenURI_ NFT tokenURI
     */
    function _setSigleTokenURI(uint256 tokenId_, string memory tokenURI_) public returns (bool){
        require(!setTokenURLOnce[tokenId_], "013 --- NFT.sol --- setTokenURI --- tokenURI has been set!!!");
        super._setTokenURI(tokenId_, tokenURI_);
        setTokenURLOnce[tokenId_] = true;
        return true;
    }

    /**
     * @dev mint and add _tokenMintedExpManager
     * @param tokenIds_ NFT tokenId
     * @param tokenURIs_ NFT tokenURI
     */
    function setTokenURI(uint256[] memory tokenIds_, string[] memory tokenURIs_) external onlyOwner {
        for (uint256 i = 0; i < tokenIds_.length; i++) {
            require(_setSigleTokenURI(tokenIds_[i], tokenURIs_[i]));
        }
    }

    //添加一个开关控制是否只能设置一次


}