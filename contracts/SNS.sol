// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./util/LibString.sol";
import "./NFT.sol";
import "./LinkKey.sol";
import "./SNSResolver.sol";

contract SNS is NFT {
    using SafeMathUpgradeable for uint256;
    using LibString for string;

    //ERC20 key address
    LinkKey private _key;
    string private END_STR;
    uint256 private STANDARD_LENGTH;
    uint256 private SHORT_LENGTH_MAX;
    uint256 private SHORT_LENGTH_MIN;

    //need to turn off this function after synchronization is complete
    bool private _canManagerMint;

    //Number of people between price increases
    uint256 private _increasesNumber;

    //Price increase 1/ 1ether
    uint256 private _increasesPrice;

    struct ResolverInfo {
        address resolverAddress;
        address owner;
    }

    //shortNameAllowedlist
    mapping(address => bool) private _shortNameAllowedlist;

    //shortNameAllowed permissions
    modifier shortNameAllowed(address addr_) {
        require(_shortNameAllowedlist[addr_], "014---addr_ is not in _shortNameAllowedlist");
        _;
    }

    //User resolver address
    mapping(string => ResolverInfo) private _resolverInfo;

    //default resolver address
    address private _defaultResolverAddress;

    //SNS of the owner address
    mapping(address => string) private _nameOfOwner;

    //SNS of the tokenId
    mapping(uint256 => string) private _nameOfTokenId;

    //tokenId of the SNS
    mapping(string => uint256) private _tokenIdOfName;

    //Whether the address has been registered
    mapping(address => bool) private _registered;

    //Whether the name has been registered
    mapping(string => bool) private _nameRegistered;

    //Mint value send to this address
    address private _feeTo;

    event Mint(address sender_, string name_, uint256 indexed tokenId);

    event ManagerMint(address sender_, string name_, address to_, uint256 indexed tokenId);

    event SetResolverInfo(address sender_, string name_, address resolverAddress_);

    event TransferName(address sender_, address form_, address to_, string name_);

    /**
     * @dev Constructs a new SNS.
     * @param key_ ERC20 address
     * @param name_ NFT name
     * @param symbol_ NFT symbol
     * @param feeTo_ feeAddress
     */
    function initialize(address key_, string memory name_, string memory symbol_,address payable feeTo_) public initializer {
        //key
        _key = LinkKey(key_);

        //ERC721
        __NFT_init(name_,symbol_);

        _feeTo = feeTo_;
        END_STR = ".key";
        STANDARD_LENGTH = 4;
        SHORT_LENGTH_MAX = 3;
        SHORT_LENGTH_MIN = 3;

        _canManagerMint = true;

        _increasesNumber = 10000;
        _increasesPrice = 5  / 10 * 1 ether;
    }

    /**
     * @dev setDefaultResolverAddress
     * @param defaultResolverAddress_  address
     */
    function setDefaultResolverAddress(address defaultResolverAddress_) external virtual onlyOwner {
        _defaultResolverAddress = defaultResolverAddress_;
    }

    /**
     * @dev setShortNameAllowed
     * @param addrs_ address list
     */
    function setShortNameAllowed(address[] memory addrs_) external virtual onlyOwner {
        for (uint256 i = 0; i < addrs_.length; i ++) {
            _shortNameAllowedlist[addrs_[i]] = true;
        }
    }

    /**
     * @dev removeWhitelist
     * @param addrs_ address list
     */
    function removeShortNameAllowed(address[] memory addrs_) external virtual onlyOwner {
        for (uint256 i = 0; i < addrs_.length; i ++) {
            _shortNameAllowedlist[addrs_[i]] = false;
        }
    }

    /**
     * @dev set ShortLength
     * @param short_Length_MAX_ short name length max
     * @param short_Length_MIN_ short name length min
     */
    function setShortLength(uint256 short_Length_MAX_,uint256 short_Length_MIN_) external virtual onlyOwner {
        SHORT_LENGTH_MAX = short_Length_MAX_;
        SHORT_LENGTH_MIN = short_Length_MIN_;
    }

    /**
     * @dev setCanManagerMint
     * @param canManagerMint_ bool
     */
    function setCanManagerMint(bool canManagerMint_) external virtual onlyOwner {
        _canManagerMint = canManagerMint_;
    }

    /**
     * @dev setIncreases
     * @param increasesNumber_ uint256
     * @param increasesPrice_ uint256
     * v2.1 increasesNumber_:100 increasesPrice_:2
     */
    function setIncreases(uint256 increasesNumber_,uint256 increasesPrice_) external virtual onlyOwner {
        _increasesNumber =  increasesNumber_;

        _increasesPrice =  increasesPrice_;
    }

    // ------------------------------------------------------send--------------------------------------------------- 

    /**
     * @dev After 1 MATIC/SNS, 10001 starts to charge 10 MATIC/SNS
     * @param name_ SNS name
     */
    function mint(string memory name_) external payable {
        //only trim the " " in the start and the end of name "12 34" can't be trim to "1234"
        name_ = name_.trim(" "); 
        require(name_.lenOfChars() >= STANDARD_LENGTH, "007---name length is less than 4");
        (uint256 maticPrice,) = getPrice();
        require(msg.value == maticPrice, "005---msg.value error");
        
        //Management address to collect money
        (bool success, ) = payable(_feeTo).call{value: msg.value}("");
        require(success, "015---send matic to feeto address fail");
        //NFT
        uint256 tokenId = _addrMint();
        //ENS
        name_ = name_.toLowercase();
        name_ = name_.concat(END_STR);
        require(_registerName(name_, _msgSender()), "003---Name register fail");
        _nameOfTokenId[tokenId] = name_;
        _tokenIdOfName[name_] = tokenId;
        //Key
        _key.mint();
        emit Mint(_msgSender(), name_, tokenId);
    }
    

    /**
     * @dev shortNameMint
     * @param name_ SNS name
     */
    function shortNameMint(string memory name_) external virtual shortNameAllowed(_msgSender()){
        name_ = name_.trim(" ");
        require(name_.lenOfChars() >= SHORT_LENGTH_MIN && name_.lenOfChars() >= SHORT_LENGTH_MAX, "015---name length error");
        //NFT
        uint256 tokenId = _addrMint();

        //ENS
        name_ = name_.toLowercase();
        name_ = name_.concat(END_STR);
        require(_registerName(name_, _msgSender()), "003---Name register fail");
        _nameOfTokenId[tokenId] = name_;
        _tokenIdOfName[name_] = tokenId;
        //Key
        _key.mint();
        emit Mint(_msgSender(), name_, tokenId);
    }

    /**
     * @dev Management address batchManagerMint
     * @param names_ SNS name
     * @param tos_ SNS owner
     */
    function batchManagerMint(string[] memory names_, address[] memory tos_,uint256[] memory tokenIds_, bool isKeyMint_) external virtual userTokenManagerAllowed(_msgSender()) {
        for (uint256 i = 0; i < names_.length; i++) {
            _managerMint(names_[i], tos_[i], tokenIds_[i], isKeyMint_);
        }
    }

    /**
     * @dev Management address registration
     * @param name_ SNS name
     * @param to_ SNS owner
     * @param isKeyMint_  when mint
     */
    function _managerMint(string memory name_, address to_,uint256 tokenId_, bool isKeyMint_) internal virtual returns (bool success){
        require(_canManagerMint,"016---manager can't mint");
        name_ = name_.trim(" ");
        if(!name_.equalNocase(" ") && name_.lenOfChars()>0){
            success = true;
        }
        name_ = name_.toLowercase();
        name_ = name_.concat(END_STR);

        if(!_nameRegistered[name_] && !_registered[to_] && success){
            //NFT
            uint256 tokenId = _manageMint(to_,tokenId_);
            if(tokenId == 0){
                return false;
            }

            //ENS
            require(_registerName(name_, to_), "003---Name register fail");
            _nameOfTokenId[tokenId] = name_;
            _tokenIdOfName[name_] = tokenId;

            //Key
            if(isKeyMint_){
                _key.mint();
            }
            emit ManagerMint(_msgSender(), name_, to_, tokenId);
        }
            
        return success;
    }

    /**
     * @dev registerSNS
     * @param name_ SNS name
     * @param to_ SNS owner
     */
    function _registerName(string memory name_, address to_) internal virtual returns (bool){
        require(_defaultResolverAddress != address(0), "006---please set defaultResolverAddress");
        require(!_nameRegistered[name_], "003---name has been registered");
        require(!_registered[to_],"008---the address has _registered");
        _nameOfOwner[to_] = name_;
        _resolverInfo[name_].resolverAddress = _defaultResolverAddress;
        _resolverInfo[name_].owner = to_;
        SNSResolver(_defaultResolverAddress).setRecords(name_, to_);
        _nameRegistered[name_] = true;
        _registered[to_] = true;
        return true;
    }

    /**
     * @dev Set resolver information
     * @param name_ SNS name
     * @param resolverAddress_ SNS resolver address
     */
    function setResolverInfo(string memory name_, address resolverAddress_) external virtual {
        require(_resolverInfo[name_].owner == _msgSender(), "009---onlyOwner can setNewResolverInfo");
        _resolverInfo[name_].resolverAddress = resolverAddress_;
        emit SetResolverInfo(_msgSender(), name_, resolverAddress_);
    }

    /**
    * @dev NFT transfer
     * @param to NFT new owner address
     * @param name_ NFT name_
     */
    function transfer(address to, string memory name_) public virtual {
        //NFT
        super.transferFrom(_msgSender(), to, _tokenIdOfName[name_]);
        //ENS
        require(_transferName(_msgSender(), to, name_), "010---transferName fail");
    }

    /**
     * @dev NFT transferFrom
     * @param from NFT owner address
     * @param to NFT new owner address
     * @param tokenId NFT tokenId
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        //NFT
        super.transferFrom(from, to, tokenId);
        //ENS
        require(_transferName(from, to, _nameOfTokenId[tokenId]), "010---transferName fail");
    }

    /**
     * @dev NFT safeTransferFrom
     * @param from NFT owner address
     * @param to NFT new owner address
     * @param tokenId NFT tokenId
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        //NFT
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev NFT safeTransferFrom
     * @param from NFT owner address
     * @param to NFT new owner address
     * @param tokenId NFT tokenId
     * @param _data NFT extra data
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public virtual override {
        //NFT
        super.safeTransferFrom(from, to, tokenId, _data);
        //ENS
        require(_transferName(from, to, _nameOfTokenId[tokenId]), "010---transferName fail");
    }

    /**
     * @dev Transfer SNS
     * @param form_ SNS owner address
     * @param to_ SNS new owner address
     * @param name_ SNS name
     */
    function _transferName(address form_, address to_, string memory name_) internal virtual returns (bool){
        require(!_registered[to_], "011---to_ has a name");
        require(_nameOfOwner[form_].equal(name_), "012---form_ is not the owner of name");
        _resolverInfo[name_].owner = to_;
        _nameOfOwner[form_] = "";
        _nameOfOwner[to_] = name_;
        _registered[form_] = false;
        _registered[to_] = true;
        SNSResolver(_defaultResolverAddress).setRecords(name_, to_);
        emit TransferName(_msgSender(), form_, to_, name_);
        return true;
    }

    // ------------------------------------------------------call---------------------------------------------------

    /**
     * @dev _shortNameAllowedlist
     */
    function getShortNameAllowedlist(address addr_) public view returns (bool){
        return _shortNameAllowedlist[addr_];
    }

    /**
     * @dev recordExists
     */
    function recordExists(string memory name_) public view returns (bool){
        return _nameRegistered[name_];
    }

    /**
     * @dev _addressRegistered
     */
    function getAddressRegistered(address addr_) public view returns (bool){
        return _registered[addr_];
    }

    /**
     * @dev getNameOfOwner
     */
    function getNameOfOwner(address addr_) public view returns (string memory){
        return _nameOfOwner[addr_];
    }

    /**
    * @dev getNameOfTokenId
     */
    function getNameOfTokenId(uint256 tokenId_) public view returns (string memory){
        return _nameOfTokenId[tokenId_];
    }

    /**
    * @dev getTokenIdOfName
     */
    function getTokenIdOfName(string memory name_) public view returns (uint256){
        return _tokenIdOfName[name_];
    }

    /**
     * @dev getResolverOwner
     * @param name_  SNS name
     */
    function getResolverOwner(string memory name_) view external returns (address){
        return _resolverInfo[name_].owner;
    }

    /**
     * @dev getResolverAddress
     * @param name_  SNS name
     */
    function getResolverAddress(string memory name_) view external returns (address){
        return _resolverInfo[name_].resolverAddress;
    }

    /**
     * v2.1 add 100 price 2%
     * @dev getPrice
     */
    function getPrice() public view  returns(uint256 maticPrice,uint256 keyPrice) {
        uint256 tokenMinted = super.getTokenMinted();

        if(tokenMinted < 10000){
            return (1 ether,_coins[1]._coinsPrice);
        }else{
            if(tokenMinted > 16000){
                uint256 times = (tokenMinted.sub(16000)).div(_increasesNumber);
                maticPrice = (10 ether * (100 + (times.mul(_increasesPrice)))).div(100);
                // keyPrice = (_coins[1]._coinsPrice * (100 + (times.mul(_increasesPrice)))).div(100);
                keyPrice = _coins[1]._coinsPrice;
                return (maticPrice,keyPrice);
            }else{
                return (10 ether,_coins[1]._coinsPrice);
            }
        }
        
    }

    /**
    *V2 update content:
    *1. Add more privilege administrators
    *2. Add multi-currency payment
    *3. Modify the fee payment address to dao
    */


    /**
    * V2 upgrade
    * more permissions
    */
    mapping(address=>bool) _userTokenManagerList;

    function setUserTokenManager(address[] memory addrs_,bool status_) external virtual onlyOwner {
        for (uint256 i = 0; i < addrs_.length; i ++) {
            _userTokenManagerList[addrs_[i]] = status_;
        }
    }

    modifier userTokenManagerAllowed(address addr_) {
        require(_userTokenManagerList[addr_], "016---addr_ is not in _setTokenURIManagerList");
        _;
    }

    function setTokenURI(uint256[] memory tokenIds_, string[] memory tokenURIs_) public virtual userTokenManagerAllowed(_msgSender()) {
        super._setTokensURI(tokenIds_,tokenURIs_);
    }

    mapping(address=>bool) _assetsManagerList;

    function setAssetsManager(address[] memory addrs_,bool status_) external onlyOwner {
        for (uint256 i = 0; i < addrs_.length; i ++) {
            _assetsManagerList[addrs_[i]] = status_;
        }
    }

    modifier assetsManagerAllowed(address addr_) {
        require(_assetsManagerList[addr_], "018---addr_ is not in _assetsManagerList");
        _;
    }

    struct Coin{
        address _coinAddress;
        uint256 _coinsPrice;
        bool _coinsDestroy;
        uint256 _coinsDestroyPercentage;
    }
    
    mapping(uint256 => Coin) private _coins;

    function setCoins(uint256 newCoinsType_,address newCoinsAddress_,uint256 coinsPrice_,bool coinsDestroy_,uint256 coinsDestroyPercentage_) external virtual assetsManagerAllowed(_msgSender()){
        _coins[newCoinsType_]._coinAddress = newCoinsAddress_; 
        _coins[newCoinsType_]._coinsPrice = coinsPrice_;
        _coins[newCoinsType_]._coinsDestroy = coinsDestroy_;
        _coins[newCoinsType_]._coinsDestroyPercentage = coinsDestroyPercentage_;
    }

    // function getCoinsAddress(uint256 coinsType_) view external returns (address){
    //     return _coins[coinsType_]._coinAddress;
    // }

    // function getCoinsPrice(uint256 coinsType_) view external returns (uint256){
    //     return _coins[coinsType_]._coinsPrice;
    // }

    // function getCoinsDestroy(uint256 coinsType_) view external returns (bool){
    //     return _coins[coinsType_]._coinsDestroy;
    // }

    // function getCoinsDestroyPercentage(uint256 coinsType_) view external returns (uint256){
    //     return _coins[coinsType_]._coinsDestroyPercentage;
    // }

    function getCoinsInfo(uint256 coinsType_) view external returns (address,uint256,bool,uint256){
        return (_coins[coinsType_]._coinAddress,_coins[coinsType_]._coinsPrice,_coins[coinsType_]._coinsDestroy,_coins[coinsType_]._coinsDestroyPercentage);
    }

    

    /**
    *v2.1 add 100 price 2%
    */
    function mintByMoreCoins(string memory name_,uint256 coinsType_) external {
        //only trim the " " in the start and the end of name "12 34" can't be trim to "1234"
        name_ = name_.trim(" "); 
        require(name_.lenOfChars() >= STANDARD_LENGTH, "007---name length is less than 4");
       
        // require(msg.value == getPrice(), "005---msg.value error");
        (,uint256 coinsPrices) = getPrice();
        //Management address to collect money
        require(IERC20(_coins[coinsType_]._coinAddress).allowance(_msgSender(), address(this)) >= coinsPrices,"019---allowance error!!!");
        bool success;
        if(_coins[coinsType_]._coinsDestroy){
            uint256 coinsDestroyPercentage = _coins[coinsType_]._coinsDestroyPercentage;
            if(coinsDestroyPercentage != 0){
                IERC20(_coins[coinsType_]._coinAddress).transferFrom(_msgSender(),address(1),coinsPrices * coinsDestroyPercentage / 100);
                success = IERC20(_coins[coinsType_]._coinAddress).transferFrom(_msgSender(),_feeTo,coinsPrices - coinsPrices * coinsDestroyPercentage / 100);
            }
        }else{
            success = IERC20(_coins[coinsType_]._coinAddress).transferFrom(_msgSender(),_feeTo,coinsPrices);
        }
        require(success, "017---send coins to feeto address fail");
        //NFT
        uint256 tokenId = _addrMint();
        //ENS
        name_ = name_.toLowercase();
        name_ = name_.concat(END_STR);
        require(_registerName(name_, _msgSender()), "003---Name register fail");
        _nameOfTokenId[tokenId] = name_;
        _tokenIdOfName[name_] = tokenId;
        //Key
        _key.mint();
        emit Mint(_msgSender(), name_, tokenId);
    }

    function setFeeTo(address newFeeTo_) external virtual assetsManagerAllowed(_msgSender()){
        _feeTo = newFeeTo_; 
    }

  
    /** v2.1 upgrade
    *1. price (add 100 price 2%)
    *2.Optimize code space
    */

}