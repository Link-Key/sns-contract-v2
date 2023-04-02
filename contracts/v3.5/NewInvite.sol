// // SPDX-License-Identifier: MIT

// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// import "../v2.9/InviteInterface.sol";
// import "./INewInvite.sol";

// /**
//  * @dev Domain name as invitation code to use with SNS contract.
//  * Only the address of the inviter and the number of invitations need to be recorded,
//  * and the invitation code is stored in the SNS contract.
//  * @author meta-bowen
//  */
// contract NewInvite is OwnableUpgradeable,INewInvite {
//     using SafeMathUpgradeable for uint256;


//     InviteSystem private inviteSystem;
    

//     modifier onlySNSAddress(address addr_) {
//         require(addr_ == inviteSystem.snsAddress, "106---addr_ is not snsAddress");
//         _;
//     }

//     // Mapping from invitee address to invitation counts
//     mapping(string => uint256) private _inviterCounts;


//     mapping(string => bool) private _isInviters;

//     //recode 0=>key 1=>matic ,2=>ustc inviterIncome
//     mapping(string => mapping (uint8=>uint256)) private _inviterOtherIncomes;

//     /**
//      * @dev Constructs a new invite contract
//      * @param snsAddress_ SNS contract address
//      * @param keyAddress_ key contract address
//      * @param feeTo_ Recipients of handling fees
//      * @param applyInviterPrice_ Price for applying to be an invitee
//      */
//     function initialize(address snsAddress_, address keyAddress_, address feeTo_, uint256 applyInviterPrice_) public initializer {
//         __Ownable_init();
        
//         //main
//         // inviteSystem.snsAddress = 0x19AD2b1F012349645C3173EA63F98948A2b43d27;
//         // inviteSystem.keyAddress = 0x5CA9A8405499a1Ee8fbB1849f197b2b7e518985f;
//         // inviteSystem.feeTo = 0xff42710340eb65d76c4beab669556f2237699fba;

//         //test
//         inviteSystem.snsAddress = 0x362945C3ffa822854240788EcdB509f104E56588;
//         inviteSystem.keyAddress = 0xFA12F5ff3c2A137a02F1678E50c54276624b50FB;
//         inviteSystem.feeTo = 0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded;

//         inviteSystem.applyInviterPrice = 100 ether;

//         //get oldInviter datas
//         inviteSystem.totalInviteNumber = 100;
//         inviteSystem.totalInviters = 32;
        
//         inviteSystem.MAX_INVITER_AMOUNT = 100;

//     }


//     /**
//      * @dev Update address
//      * @param addr_ address
//      * @param number_ 1-snsAddress,2-keyAddress,3-feeTo
//      */
//     function updateSystem(address addr_, uint256 number_, uint256 newAmount_) external virtual onlyOwner {
//         if (number_ == 1) {
//             inviteSystem.snsAddress = addr_;
//         } else if (number_ == 2) {
//             inviteSystem.keyAddress = addr_;
//         } else if (number_ == 3) {
//             inviteSystem.feeTo = addr_;
//         }
//     }

//     /**
//      * @dev Update amount
//      * @param number_ number
//      * 1-newApplyInviterPrice_ new price for applying to be an inviter,
//      * 2-newLength_ new invite code length
//      * 3-newInviteDiscountRate_ new invitation discount rate
//      * 4-newAmount_ new max inviter amount
//      * @param newAmount_ new amount
//      */
//     function updateAmount(uint8 number_, uint256 newAmount_) external virtual onlyOwner {
//         if (number_ == 1) {
//             require(newAmount_ > 0, "newApplyInviterPrice_ must be greater than 0");
//             _applyInviterPrice = newAmount_;
//         } else if (number_ == 2) {
//             require(newAmount_ > MIN_INVITE_CODE_LENGTH, "newLength_ must be longer than the MIN_INVITE_CODE_LENGTH");
//             MIN_INVITE_CODE_LENGTH = newAmount_;
//         } else if (number_ == 3) {
//             require(newAmount_ > 0, "newInviteDiscountRate_ must be greater than 0");
//             require(newAmount_ < 100, "newInviteDiscountRate_ must be less than 100");
//             _inviteDiscountRate = newAmount_;
//         } else if (number_ == 4) {
//             require(newAmount_ > MAX_INVITER_AMOUNT, "newAmount_ must be longer than the MAX_INVITER_AMOUNT");
//             MAX_INVITER_AMOUNT = newAmount_;
//         }

//     }

//     /**
//      * @dev Add inviters, initialize the number of invitations,and record the total number of invitees
//      */
//     function addInviter() override external {
//         require(!_isInviters[_msgSender()],"100---msg.sender is inviter");
//         require(_totalInviters < MAX_INVITER_AMOUNT, "101---total inviters must be less than MAX_INVITER_AMOUNT");
//         require(IERC20(_keyAddress).allowance(_msgSender(), address(this)) >= _applyInviterPrice, "102---allowance error");
//         require(IERC20(_keyAddress).transferFrom(_msgSender(), _feeTo, _applyInviterPrice), "103---send coins to feeTo address fail");
//         _inviterCounts[_msgSender()] = 0;
//         _isInviters[_msgSender()] = true;
//         _totalInviters += 1;
//     }

//     /**
//      * @dev Add inviter counts
//      * @param addr_ inviter address
//      */
//     function addInviterCount(address addr_) external virtual override onlySNSAddress(_msgSender()) {
//        if(_isInviters[addr_]){
//             _inviterCounts[addr_] += 1;
//             _totalInviteNumber += 1;
//        }
//     }

//     /**
//      * @dev Calculate price after invitation discount, inviteCode can be empty
//      * @param price_ original price
//      * @param inviter_ inviter
//      */
//     function getInviteDiscountPrice(uint256 price_, address inviter_) public view override returns (uint256)  {
//         require(price_ > 0, "105---price_ must be greater than 0");
//         if (_isInviters[inviter_] ) {
//             price_ = price_.mul(_inviteDiscountRate) / 100;
//         }
//         return price_;
//     }

//     /**
//      * @dev get invite count
//      * @param addr_ inviter address
//      */
//     function getInviteCount(address addr_) public view override returns (uint256){
//         return _inviterCounts[addr_];
//     }

//     /**
//      * @dev Determine if the address is an invitee
//      * @param addr_ inviter address
//      */
//     function isInviter(address addr_) public view override returns (bool){
//         return _isInviters[addr_];
//     }

//     /**
//      * @dev get apply inviter price
//      */
//     function getApplyInviterPrice() public view override returns (uint256){
//         return _applyInviterPrice;
//     }

//     function inviteDiscountRate(address addr_) external view override returns (uint256){
//         uint256 counts = _inviterCounts[addr_];
//         if(counts < 50 ){
//             return 90;
//         }else if(counts >= 50 && counts < 150){
//             return 80;
//         }else if(counts >= 150 && counts < 300){
//             return 75;
//         }else if(counts >= 300){
//             return 70;
//         }
//         // return _inviteDiscountRate;
//     }

//     //0 key 1 matic 2 usdc
//     function getInviterIncome(address inviter_,uint8 coinTypes) external view override returns (uint256){
//         if(coinTypes == 0){
//             return _inviterIncome[inviter_];
//         }else{
//             return _inviterOtherIncomes[inviter_][coinTypes];
//         }
        
//     }

//     function setInviterIncome(address inviter_,uint8 coinTypes,uint256 _newIncom) external virtual override onlySNSAddress(_msgSender()) {
//        if(_isInviters[inviter_]){
            
//             if(coinTypes == 0){
//                 uint256 oldIncome = _inviterIncome[inviter_];
//                 oldIncome = oldIncome.add( _newIncom);
//                 _inviterIncome[inviter_] = oldIncome;
//             }else{
//                 uint256 oldIncome = _inviterOtherIncomes[inviter_][coinTypes];
//                 oldIncome = oldIncome.add( _newIncom);
//                 _inviterOtherIncomes[inviter_][coinTypes] = oldIncome;
//             }
            
//        }
//     }

//     function canInviter(address inviter_) external view override returns (bool){
//         return _isInviters[inviter_] ;
//     }
    

// }
