// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./InviteInterface.sol";

/**
 * @dev Domain name as invitation code to use with SNS contract.
 * Only the address of the inviter and the number of invitations need to be recorded,
 * and the invitation code is stored in the SNS contract.
 * @author meta-bowen
 */
contract Invite is OwnableUpgradeable,InviteInterface {
    using SafeMathUpgradeable for uint256;

    address _snsAddress;
    address _keyAddress;
    address _feeTo;

    uint256 public _applyInviterPrice;

    uint256 public _totalInviteNumber;
    uint256 public _totalInviters;

    uint256 public MIN_INVITE_CODE_LENGTH;
    uint256 public MAX_INVITER_AMOUNT;

    uint256 public _inviteDiscountRate;

    modifier onlySNSAddress(address addr_) {
        require(addr_ == _snsAddress, "080---addr_ is not snsAddress");
        _;
    }

    // Mapping from invitee address to invitation counts
    mapping(address => uint256) private _inviterCounts;

    mapping(address => bool) private _isInviters;

    /**
     * @dev Constructs a new invite contract
     * @param snsAddress_ SNS contract address
     * @param keyAddress_ key contract address
     * @param feeTo_ Recipients of handling fees
     * @param applyInviterPrice_ Price for applying to be an invitee
     */
    function initialize(address snsAddress_, address keyAddress_, address feeTo_, uint256 applyInviterPrice_) public initializer {
        __Ownable_init();

        _snsAddress = snsAddress_;
        _keyAddress = keyAddress_;
        _feeTo = feeTo_;
        _applyInviterPrice = applyInviterPrice_;

        _totalInviteNumber = 0;
        _totalInviters = 0;
        _inviteDiscountRate = 90;

        MIN_INVITE_CODE_LENGTH = 8;
        MAX_INVITER_AMOUNT = 100;

    }


    /**
     * @dev Update address
     * @param addr_ address
     * @param number_ 1-snsAddress,2-keyAddress,3-feeTo
     */
    function updateAddress(address addr_, uint256 number_) external virtual onlyOwner {
        if (number_ == 1) {
            _snsAddress = addr_;
        } else if (number_ == 2) {
            _keyAddress = addr_;
        } else if (number_ == 3) {
            _feeTo = addr_;
        }
    }

    /**
     * @dev Update amount
     * @param number_ number
     * 1-newApplyInviterPrice_ new price for applying to be an inviter,
     * 2-newLength_ new invite code length
     * 3-newInviteDiscountRate_ new invitation discount rate
     * 4-newAmount_ new max inviter amount
     * @param newAmount_ new amount
     */
    function updateAmount(uint8 number_, uint256 newAmount_) external virtual onlyOwner {
        if (number_ == 1) {
            require(newAmount_ > 0, "080---newApplyInviterPrice_ must be greater than 0");
            _applyInviterPrice = newAmount_;
        } else if (number_ == 2) {
            require(newAmount_ > MIN_INVITE_CODE_LENGTH, "080---newLength_ must be longer than the MIN_INVITE_CODE_LENGTH");
            MIN_INVITE_CODE_LENGTH = newAmount_;
        } else if (number_ == 3) {
            require(newAmount_ > 0, "080---newInviteDiscountRate_ must be greater than 0");
            require(newAmount_ < 100, "080---newInviteDiscountRate_ must be less than 100");
            _inviteDiscountRate = newAmount_;
        } else if (number_ == 4) {
            require(newAmount_ > MAX_INVITER_AMOUNT, "080---newAmount_ must be longer than the MAX_INVITER_AMOUNT");
            MAX_INVITER_AMOUNT = newAmount_;
        }

    }

    /**
     * @dev Add inviters, initialize the number of invitations,and record the total number of invitees
     */
    function addInviter() external {
        require(_totalInviters < MAX_INVITER_AMOUNT, "080---total inviters must be less than MAX_INVITER_AMOUNT");
        require(IERC20(_keyAddress).allowance(_msgSender(), address(this)) >= _applyInviterPrice, "080---allowance error");
        bool success;
        success = IERC20(_keyAddress).transferFrom(_msgSender(), _feeTo, _applyInviterPrice);
        require(success, "080---send coins to feeTo address fail");
        _inviterCounts[_msgSender()] = 0;
        _isInviters[_msgSender()] = true;
        _totalInviters += 1;
    }

    /**
     * @dev Add inviter counts
     * @param addr_ inviter address
     */
    function addInviterCount(address addr_) external virtual onlySNSAddress(_msgSender()) {
        require(_isInviters[addr_], "080---addr_ is not inviter");
        _inviterCounts[addr_] += 1;
        _totalInviteNumber += 1;
    }

    /**
     * @dev Calculate price after invitation discount, inviteCode can be empty
     * @param price_ original price
     * @param inviter_ inviter
     */
    function getInviteDiscountPrice(uint256 price_, address inviter_) public view returns (uint256) {
        require(price_ > 0, "080---price_ must be greater than 0");
        if (_isInviters[inviter_]) {
            price_ = price_.mul(_inviteDiscountRate) / 100;
        }
        return price_;
    }

    /**
     * @dev get invite count
     * @param addr_ inviter address
     */
    function getInviteCount(address addr_) public view returns (uint256){
        return _inviterCounts[addr_];
    }

    /**
     * @dev Determine if the address is an invitee
     * @param addr_ inviter address
     */
    function isInviter(address addr_) public view returns (bool){
        return _isInviters[addr_];
    }

    /**
     * @dev get apply inviter price
     */
    function getApplyInviterPrice() public view returns (uint256){
        return _applyInviterPrice;
    }

}
