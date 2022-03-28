// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "..\util\LibString.sol";

/**
 * @dev Invitation code application is open for all addresses, and SNS contracts are used in conjunction
 */
contract InviteCode {
    using SafeMathUpgradeable for uint256;
    using LibString for string;

    address _manager;
    address _snsAddress;

    bool _closeManager;

    uint256 public _totalInviteAmount;
    uint256 public INVITE_CODE_LENGTH;

    // Mapping from invite code to its owner address
    mapping(string => address) private _inviteCodes;

    // Mapping from invite code owner address to invite`s amount
    mapping(address => uint256) private _inviteAmounts;

    event AddInviteCodeEvent(address sender_, string inviteCode_);

    /**
     * @dev Constructs a new invite code contract
     * @param contractManager_
     * @param snsAddress_ SNS contract address
     */
    function initialize(address contractManager_, address snsAddress_) public initializer {
        _manager = contractManager_;
        _snsAddress = snsAddress_;
        _closeManager = false;
        _totalInviteAmount = 0;
        INVITE_CODE_LENGTH = 8;
    }

    modifier onlyManager(address addr_) {
        if (_closeManager == false) {
            require(addr_ == _manager, "080---addr_ is not inviteCodeManager");
        }
        _;
    }

    modifier onlySNSAddress(address addr_) {
        require(addr_ == _snsAddress, "080---addr_ is not snsAddress");
        _;
    }

    /**
     * @dev update invite code length
     * @param newLength_ new invite code length
     */
    function _updateInviteCodeLength(uint256 newLength_) external virtual onlyOwner {
        require(newLength_ > INVITE_CODE_LENGTH, "080---newLength_ must be longer than the current inviteCode");
        INVITE_CODE_LENGTH = newLength;
    }

    /**
     * @dev close contract manager,if true,any address can apply invite code
     */
    function closeManager() external virtual onlyOwner {
        _closeManager = true;
    }


    /**
     * @dev owner update the administrator
     * @param addr_ new manager address
     */
    function updateManager(address addr_) external virtual onlyOwner {
        require(addr_ != address(0), "080---addr_ can`t be zero-address");
        _manager = addr_;
    }


    /**
     * @dev add invite code
     * @param inviteCode_ invite code
     */
    function addInviteCode(string memory inviteCode_) external virtual onlyManager {
        inviteCode_ = inviteCode_.trim(" ");
        require(inviteCode_.lenOfChars() == INVITE_CODE_LENGTH, "080---invite code length error");
        _inviteCodes[inviteCode_] = msg.sender;
        _inviteAmounts[inviteCode_] = 0;
        AddInviteCodeEvent(msg.sender, inviteCode_);
    }

    // delete inviteCode
    //    function deleteInviteCode(string inviteCode) external virtual onlyManager {
    //        delete _inviteCodes[inviteCode];
    //        delete _inviteAmounts[inviteCode];
    //    }


    /**
     * @dev get invite code owner address
     * - return ture, sns contract will execute preferential charging logic, and after successful deduction, addInviteAmount function will be call
     * - return false, revert
     * @param inviteCode_ invite code
     * @param addr_ invite code owner address
     */
    function getInviteCodeOwner(string inviteCode_) public view returns (address) {
        return _inviteCodes[inviteCode_] != address(0) ? _inviteCodes[inviteCode_] : address(0);
    }

    /**
     * @dev add invite amount,called after the sns contract executes a charging
     * @param addr_ invite code owner address
     */
    function addInviteAmount(address addr_) external virtual onlySNSAddress {
        _inviteAmounts[addr_] += 1;
        _totalInviteAmount += 1;
    }

    /**
     * @dev get invite amount
     * @param addr_ invite code owner address
     */
    function getInviteAmount(address addr_) public view returns (uint256){
        return _inviteAmounts[addr_];
    }

}
