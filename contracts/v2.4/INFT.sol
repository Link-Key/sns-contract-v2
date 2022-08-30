// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface INFT {
    function getTaxPreparation() external view returns(uint256 taxPreparation);
}