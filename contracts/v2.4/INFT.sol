// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface INFT {
    function getTaxPreparation() external view returns(uint256 taxPreparation);

    function initialize(string memory nftName, string memory nftSymbol,address owner,uint256 floorPrices,uint256 ownerMintAccount,uint256 taxPreparation) external;

    function kill() external; 
}