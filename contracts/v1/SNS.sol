// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "./LibString.sol";
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

    struct ResolverInfo {
        address resolverAddress;
        address owner;
    }

    //shortNameAllowedlist
    mapping(address => bool) private _shortNameAllowedlist;

    //shortNameAllowed permissions
    modifier shortNameAllowed(address addr_) {
        require(_shortNameAllowedlist[addr_], "014 --- SNS.sol ---shortNameAllowed--- addr_ is not in _shortNameAllowedlist!!!");
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

    // /**
    //  * @dev Constructs a new SNS.
    //  * @param key_ ERC20 address
    //  * @param name_ NFT name
    //  * @param symbol_ NFT symbol
    //  * @param feeTo_ feeAddress
    //  */
    // constructor(address key_, string memory name_, string memory symbol_,address payable feeTo_) public {
    //     //key
    //     _key = LinkKey(key_);
    //     //ERC721
    //     _name = name_;
    //     _symbol = symbol_;

    //     _feeTo = feeTo_;
    // }

    function initialize(address key_, string memory name_, string memory symbol_,address payable feeTo_) public initializer {
            //key
            _key = LinkKey(key_);

            //ERC721
            __NFT_init(name_,symbol_);

            _feeTo = feeTo_;
            END_STR = ".key";
            STANDARD_LENGTH = 4;
            // SHORT_LENGTH = 3;

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
     * @param shortLength_ short name length
     */
    function setShortLength(uint256 shortLength_) external virtual onlyOwner {
        // SHORT_LENGTH = shortLength_;
    }

    //TODO 测试带空格的名称

    /**
     * @dev After 1 MATIC/SNS, 10001 starts to charge 10 MATIC/SNS
     * @param name_ SNS name
     */
    function mint(string memory name_) external payable  virtual {
    
        require(name_.lenOfChars() >= STANDARD_LENGTH, "007 --- SNS.sol --- registerName --- name length is less than 4");
       
        require(msg.value == 10 ether, "005 --- SNS.sol --- mint --- msg.value should be 10 ether!!!");
        
        //Management address to collect money
        (bool success, ) = payable(_feeTo).call{value: msg.value}("");
        require(success, "015 --- SNS.sol --- mint --- send matic to feeto address fail!!!");
        //NFT
        uint256 tokenId = _addrMint();
        //ENS
        name_ = name_.toLowercase();
        name_ = name_.concat(END_STR);
        require(_registerName(name_, _msgSender()), "003 --- SNS.sol --- mint --- Name register fail!!!");
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
        // require(name_.lenOfChars() == SHORT_LENGTH, "015 --- SNS.sol --- shortNameMint --- name length error!!!");
        //NFT
        uint256 tokenId = _addrMint();

        //ENS
        name_ = name_.toLowercase();
        name_ = name_.concat(END_STR);
        require(_registerName(name_, _msgSender()), "003 --- SNS.sol --- freeMint --- Name register fail!!!");
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
    function batchManagerMint(string[] memory names_, address[] memory tos_, bool isKeyMint_) external virtual onlyOwner {
        for (uint256 i = 0; i < names_.length; i++) {
            _managerMint(names_[i], tos_[i], isKeyMint_);
        }
    }

    /**
     * @dev Management address registration
     * @param name_ SNS name
     * @param to_ SNS owner
     * @param isKeyMint_  when mint
     */
    function _managerMint(string memory name_, address to_, bool isKeyMint_) internal virtual returns (bool){
        name_ = name_.toLowercase();
        name_ = name_.concat(END_STR);

        if(_nameRegistered[name_] || _registered[to_]){
            return false;
        }else{
            //NFT
            uint256 tokenId = _addrMint();

            //ENS
            require(_registerName(name_, to_), "003 --- SNS.sol --- mint --- Name register fail!!!");
            _nameOfTokenId[tokenId] = name_;
            _tokenIdOfName[name_] = tokenId;

            //Key
            if(isKeyMint_){
                _key.mint();
            }
            emit ManagerMint(_msgSender(), name_, to_, tokenId);
            return true;
        }  

    }


    /**
     * @dev registerSNS
     * @param name_ SNS name
     * @param to_ SNS owner
     */
    function _registerName(string memory name_, address to_) internal virtual returns (bool){
        require(_defaultResolverAddress != address(0), "006 --- SNS.sol --- registerName --- please set defaultResolverAddress!!!");
        require(!_nameRegistered[name_], "003 --- SNS.sol --- registerName --- name has been registered!!!");
        require(!_registered[to_],"008 --- SNS.sol --- registerName --- the address has _registered!!!");
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
        require(_resolverInfo[name_].owner == _msgSender(), "009 --- SNS.sol --- setResolverInfo --- onlyOwner can setNewResolverInfo");
        _resolverInfo[name_].resolverAddress = resolverAddress_;
        emit SetResolverInfo(_msgSender(), name_, resolverAddress_);
    }

    /**
     * @dev getResolverAddress
     * @param name_  SNS name
     */
    function getResolverAddress(string memory name_) view external returns (address){
        return _resolverInfo[name_].resolverAddress;
    }

    /**
     * @dev getResolverOwner
     * @param name_  SNS name
     */
    function getResolverOwner(string memory name_) view external returns (address){
        return _resolverInfo[name_].owner;
    }

    /**
     * @dev getSNSName
     * @param addr_  owner address
     */
    function getSNSName(address addr_) view external returns (string memory){
        return _nameOfOwner[addr_];
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
        require(_transferName(_msgSender(), to, name_), "010 --- SNS.sol --- transferFrom --- transferName fail!!!");
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
        require(_transferName(from, to, _nameOfTokenId[tokenId]), "010 --- SNS.sol ---transferFrom--- transferName fail!!!");
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
        require(_transferName(from, to, _nameOfTokenId[tokenId]), "010 --- SNS.sol ---safeTransferFrom--- transferName fail!!!");
    }

    /**
     * @dev Transfer SNS
     * @param form_ SNS owner address
     * @param to_ SNS new owner address
     * @param name_ SNS name
     */
    function _transferName(address form_, address to_, string memory name_) internal virtual returns (bool){
        require(!_registered[to_], "011 to_ has a name!!!");
        require(_nameOfOwner[form_].equal(name_), "012 --- SNS.sol ---_transferName--- form_ is not the owner of name!!!");
        _resolverInfo[name_].owner = to_;
        _nameOfOwner[form_] = "";
        _nameOfOwner[to_] = name_;
        _registered[form_] = false;
        _registered[to_] = true;
        SNSResolver(_defaultResolverAddress).setRecords(name_, to_);
        emit TransferName(_msgSender(), form_, to_, name_);
        return true;
    }


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
     * @dev getNameOfOwner
     */
    function getNameOfOwner(address addr_) public view returns (string memory){
        return _nameOfOwner[addr_];
    }

    /**
         * @dev getNameOfOwner
     */
    function getNameOfTokenId(uint256 tokenId_) public view returns (string memory){
        return _nameOfTokenId[tokenId_];
    }


}