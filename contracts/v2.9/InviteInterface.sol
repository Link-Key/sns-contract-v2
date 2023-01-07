// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Domain name as invitation code to use with SNS contract.
 * Only the address of the inviter and the number of invitations need to be recorded,
 * and the invitation code is stored in the SNS contract.
 * @author meta-bowen
 */
interface InviteInterface {
    
    function addInviter() external;

    /**
     * @dev Add inviter counts
     * @param addr_ inviter address
     */
    function addInviterCount(address addr_) external;

    /**
     * @dev Calculate price after invitation discount, inviteCode can be empty
     * @param price_ original price
     * @param inviter_ inviter
     */
    function getInviteDiscountPrice(uint256 price_, address inviter_) external view returns (uint256) ;

    /**
     * @dev get invite count
     * @param addr_ inviter address
     */
    function getInviteCount(address addr_) external view returns (uint256);

    /**
     * @dev Determine if the address is an invitee
     * @param addr_ inviter address
     */
    function isInviter(address addr_) external view returns (bool);

    /**
     * @dev get apply inviter price
     */
    function getApplyInviterPrice() external view returns (uint256);


    function inviteDiscountRate() external view returns (uint256);

    function getInviterIncome(address inviter_,uint8 coinTypes) external view returns (uint256);
   
    function setInviterIncome(address inviter_,uint8 coinTypes,uint256 _newIncom) external ;

    function canInviter(address inviter_) external view  returns (bool);
}
