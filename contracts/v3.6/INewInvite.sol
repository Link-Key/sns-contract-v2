// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Domain name as invitation code to use with SNS contract.
 * Only the address of the inviter and the number of invitations need to be recorded,
 * and the invitation code is stored in the SNS contract.
 * @author meta-bowen
 */
interface INewInvite {

    struct InviteSystem{
        address  snsAddress;
        address  keyAddress;
        address  feeTo;
        address  oldInvite;
        uint256  applyInviterPrice;//Fees to become an invitee
        uint256  totalInviteNumber;
        uint256  totalInviters;
        uint256  MAX_INVITER_AMOUNT;//totalInviters <= MAX_INVITER_AMOUNT
        
        
    }


    
    
    function addInviter() external;

    function addInviterCount(string memory newInviternName_) external;

    function getInviteDiscountPrice(uint256 oldPrice_, string memory inviternName_) external view returns (uint256) ;

    function getInviteCount(string memory inviternName_) external view returns (uint256);

    function isInviter(string memory inviternName_) external view returns (bool);

    function inviteDiscountRate() external view returns (uint256);

    function getInviterIncome(string memory inviternName_,uint8 coinTypes) external view returns (uint256);
   
    function setInviterIncome(string memory inviternName_,uint8 coinTypes,uint256 _newIncom) external ;

    function getSystemInfo()external view returns (InviteSystem memory);

}
