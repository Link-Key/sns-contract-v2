// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../util/LibString.sol";
import "../util/Key.sol";
import "../v2/NFTV2.sol";
import "../v2.4/ResolverV2_4.sol";
import "../v2.9/InviteInterface.sol";
import "./ISns.sol";

contract SNSV3_4 is NFTV2 , ISns{
    using SafeMathUpgradeable for uint256;
    using LibString for string;

    //ERC20 key address
    Key private _key;
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

    event Mint(address sender_, string name_, uint256 indexed tokenId, address inviter, uint256 coinsType, uint256 price);

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
    // function initialize(address key_, string memory name_, string memory symbol_,address payable feeTo_) public initializer {
    //     //key
    //     _key = Key(key_);

    //     //ERC721
    //     __NFT_init(name_,symbol_);

    //     _feeTo = feeTo_;
    //     END_STR = ".key";
    //     STANDARD_LENGTH = 4;
    //     SHORT_LENGTH_MAX = 3;
    //     SHORT_LENGTH_MIN = 3;

    //     _canManagerMint = true;

    //     _increasesNumber = 10000;
    //     _increasesPrice = 5  / 10 * 1 ether;
    // }

    /**
     * @dev setDefaultResolverAddress
     * @param defaultResolverAddress_  address
     */
    // function setDefaultResolverAddress(address defaultResolverAddress_) external virtual onlyOwner {
    //     _defaultResolverAddress = defaultResolverAddress_;
    // }

    /**
     * @dev setShortNameAllowed
     * @param addrs_ address list
     */
    // function setShortNameAllowed(address[] memory addrs_,bool allowed_) external virtual onlyOwner {
    //     for (uint256 i = 0; i < addrs_.length; i ++) {
    //         _shortNameAllowedlist[addrs_[i]] = allowed_;
    //     }
    // }


    /**
     * @dev set ShortLength
     * @param short_Length_MAX_ short name length max
     * @param short_Length_MIN_ short name length min
     */
    // function setShortLength(uint256 short_Length_MAX_,uint256 short_Length_MIN_) external virtual onlyOwner {
    //     SHORT_LENGTH_MAX = short_Length_MAX_;
    //     SHORT_LENGTH_MIN = short_Length_MIN_;
    // }

    /**
     * @dev setCanManagerMint
     * @param canManagerMint_ bool
     */
    // function setCanManagerMint(bool canManagerMint_) external virtual onlyOwner {
    //     _canManagerMint = canManagerMint_;
    // }

    /**
     * @dev setIncreases
     * @param increasesNumber_ uint256
     * @param increasesPrice_ uint256
     * v2.1 increasesNumber_:100 increasesPrice_:2
     */
    // function setIncreases(uint256 increasesNumber_,uint256 increasesPrice_) external virtual onlyOwner {
    //     _increasesNumber =  increasesNumber_;

    //     _increasesPrice =  increasesPrice_;
    // }

    // ------------------------------------------------------send--------------------------------------------------- 

    /**
     * @dev After 1 MATIC/SNS, 10001 starts to charge 10 MATIC/SNS
     * @param name_ SNS name
     * @param coinsType_ 0 matic 1key 2lowb 3ustc // shortMint  0:matic 1:key
     */
    function mint(string memory name_,uint256 coinsType_,address inviter_) external payable {
        require(!_coins[coinsType_]._isClose,"token mint is closed");
        //only trim the " " in the start and the end of name "12 34" can't be trim to "1234"
        name_ = name_.trim(" "); 
        // require(name_.lenOfChars() >= STANDARD_LENGTH, "007---name length is less than 4");

        PriceInfo memory priceInfo = getPrice(_msgSender(),name_,inviter_);

        uint256 price = 0;
        //Management address to collect money
        bool success = false;

        uint256 nameLength = name_.lenOfChars();
        uint256 tokenMinted = super.getTokenMinted();
        if(nameLength < STANDARD_LENGTH){
            if(nameLength == 3){
                if(priceInfo.maticPrice == 0 && priceInfo.keyPrice == 0){
                    success = true;
                }else{
                    if(coinsType_ == 0){
                        price = priceInfo.maticPrice;
                        uint256 inviterIncome = price * (100 - _invite.inviteDiscountRate()) / 100;  
                        require(msg.value >= price,"feeAmount not enough");
                        if(_invite.canInviter(inviter_)){
                            (success, ) = payable(inviter_).call{value: inviterIncome}("");
                            _invite.setInviterIncome(inviter_, 1, inviterIncome);
                            require(success, "015---send matic to inviter address fail");
                            (success, ) = payable(_feeTo).call{value: price - inviterIncome}("");
                        }else{
                            (success, ) = payable(_feeTo).call{value: msg.value}("");
                        }
                    }else if(coinsType_ == 1){
                        require(!_coins[1]._isClose,"token mint is close");
                        price = priceInfo.keyPrice;
                        uint256 inviterIncome = price * (100 - _invite.inviteDiscountRate()) / 100;  
                        if(_invite.canInviter(inviter_)) {
                            IERC20(_priceOfShorts[3].keyAddress).transferFrom(_msgSender(),inviter_,inviterIncome);
                            _invite.setInviterIncome(inviter_,0,inviterIncome);
                            success = IERC20(_priceOfShorts[3].keyAddress).transferFrom(_msgSender(),address(_feeTo),price - inviterIncome);
                        }else{
                            success = IERC20(_priceOfShorts[3].keyAddress).transferFrom(_msgSender(),address(_feeTo),price);
                        }
                    }else{
                        require(false,"error payWay");
                    }
                }

                _shortNameAllowedlist[_msgSender()] = false;
                _freeShortMint[_msgSender()] = false;
            }
        }else if(nameLength >= systemInfo.freeMintLength && tokenMinted <= 100000){
            success = true;
        }else if(nameLength >= systemInfo.freeMintLength && tokenMinted > 100000){
            if(coinsType_ == 0){
                price = priceInfo.maticPrice;
                uint256 inviterIncome = price * (100 - _invite.inviteDiscountRate()) / 100;  
                require(msg.value >= price,"feeAmount not enough");
                if(_invite.canInviter(inviter_)){
                    (success, ) = payable(inviter_).call{value: inviterIncome}("");
                    _invite.setInviterIncome(inviter_, 1, inviterIncome);
                    require(success, "015---send matic to inviter address fail");
                    (success, ) = payable(_feeTo).call{value: price - inviterIncome}("");
                }else{
                    (success, ) = payable(_feeTo).call{value: msg.value}("");
                }
            }
        }else{
            if(coinsType_ == 0){
                price = priceInfo.maticPrice;
                require(msg.value == price, "005---msg.value error");
                if(_invite.canInviter(inviter_)) {
                    uint256 inviterIncome = price * (100 - _invite.inviteDiscountRate()) / 100;
                    (success, ) = payable(inviter_).call{value: inviterIncome}("");
                    _invite.setInviterIncome(inviter_, 1, inviterIncome);
                    require(success, "015---send matic to inviter address fail");
                    (success, ) = payable(_feeTo).call{value: price - inviterIncome}("");
                } else {
                    (success, ) = payable(_feeTo).call{value: price}("");
                }
            } else{
                uint8 inviterCoinsType;
                if(coinsType_ == 1){
                    price = priceInfo.keyPrice;
                    inviterCoinsType = 0;
                }else if(coinsType_ == 2){
                    price = priceInfo.lowbPrice;
                    inviterCoinsType = 99;
                }else if(coinsType_ == 3){
                    price = priceInfo.usdcPrice;
                    inviterCoinsType = 2;
                }else{
                    price = 2**256 - 1;
                    inviterCoinsType = 2**8 -1;
                }

                require(IERC20(_coins[coinsType_]._coinAddress).allowance(_msgSender(), address(this)) >= price,"019---allowance error!!!");

                uint256 inviterIncome = price * (100 - _invite.inviteDiscountRate()) / 100;    

                address feeTo = _feeTo;
                if(coinsType_ == 2){
                    feeTo = address(0x1EC0E4DC543566f26B73800700080B4b2f3fD208);
                }

                if(_coins[coinsType_]._coinsDestroy){ // key destroy
                    uint256 coinsDestroyPercentage = _coins[coinsType_]._coinsDestroyPercentage;

                    if(coinsDestroyPercentage != 0){
                        if(_invite.canInviter(inviter_) && coinsType_ != 2) {
                            IERC20(_coins[coinsType_]._coinAddress).transferFrom(_msgSender(),inviter_, inviterIncome);
                            _invite.setInviterIncome(inviter_,inviterCoinsType,inviterIncome);
                            if((price * coinsDestroyPercentage  / 100) - inviterIncome > 0){
                                IERC20(_coins[coinsType_]._coinAddress).transferFrom(_msgSender(),address(1),(price * coinsDestroyPercentage  / 100) - inviterIncome);
                            }
                        }else{
                            IERC20(_coins[coinsType_]._coinAddress).transferFrom(_msgSender(),address(1),price * coinsDestroyPercentage / 100);
                        }  
                        success = IERC20(_coins[coinsType_]._coinAddress).transferFrom(_msgSender(),address(feeTo),price - price * coinsDestroyPercentage / 100);
                    }
                }else{
                    if(_invite.canInviter(inviter_) && coinsType_ != 2) {
                        IERC20(_coins[coinsType_]._coinAddress).transferFrom(_msgSender(),inviter_,inviterIncome);
                        _invite.setInviterIncome(inviter_,inviterCoinsType,inviterIncome);
                        success = IERC20(_coins[coinsType_]._coinAddress).transferFrom(_msgSender(),address(feeTo),price - inviterIncome);
                    }else{
                        success = IERC20(_coins[coinsType_]._coinAddress).transferFrom(_msgSender(),address(feeTo),price);
                    }

                }
            } 
        }
        
        
        require(success, "015---send matic to feeto address fail");

        _invite.addInviterCount(inviter_);

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
        emit Mint(_msgSender(), name_, tokenId, inviter_, coinsType_, price);
        
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
        ResolverV2_4(_defaultResolverAddress).setRecords(name_, to_);
        _nameRegistered[name_] = true;
        _registered[to_] = true;
        return true;
    }

    /**
     * @dev Set resolver information
     * @param name_ SNS name
     * @param resolverAddress_ SNS resolver address
     */
    // function setResolverInfo(string memory name_, address resolverAddress_) external virtual {
    //     require(_resolverInfo[name_].owner == _msgSender(), "009---onlyOwner can setNewResolverInfo");
    //     _resolverInfo[name_].resolverAddress = resolverAddress_;
    //     emit SetResolverInfo(_msgSender(), name_, resolverAddress_);
    // }

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
        require(!_tokenStaked[_tokenIdOfName[name_]],"your token is in stake");
        _resolverInfo[name_].owner = to_;
        _nameOfOwner[form_] = "";
        _nameOfOwner[to_] = name_;
        _registered[form_] = false;
        _registered[to_] = true;
        ResolverV2_4(_defaultResolverAddress).setRecords(name_, to_);
        emit TransferName(_msgSender(), form_, to_, name_);
        return true;
    }

    // ------------------------------------------------------call---------------------------------------------------

    /**
     * @dev _shortNameAllowedlist
     */
    // function getShortNameAllowedlist(address addr_) public view returns (bool){
    //     return _shortNameAllowedlist[addr_];
    // }

    function getInfo(address addr_,string memory name_,uint256 tokenId_) public view override returns (Response memory addressResp){
        addressResp = Response({
            shortNameAllowed:_shortNameAllowedlist[addr_],
            addressRegistered:_registered[addr_],
            nameOfOwner:_nameOfOwner[addr_],
            recordExists:_nameRegistered[name_],
            tokenIdOfName:_tokenIdOfName[name_],
            resolverOwner:_resolverInfo[name_].owner,
            resolverAddress:_resolverInfo[name_].resolverAddress,
            nameOfTokenId:_nameOfTokenId[tokenId_]
        });
    }

    /**
     * v2.1 add 100 price 2%
     * @dev getPrice
     */
    function getPrice(address minter_,string memory name_,address inviter_) public view override returns (PriceInfo memory priceInfo) {
        string memory name = name_.toLowercase();
        name = name_.concat(END_STR);
        if(_nameRegistered[name]){
            priceInfo.maticPrice = 2**256 - 1;
            priceInfo.keyPrice = 2**256 - 1;
            priceInfo.lowbPrice = 2**256 - 1;
            priceInfo.usdcPrice = 2**256 - 1;
            return priceInfo;
        }
        uint256 nameLength = name_.lenOfChars();

        uint256 tokenMinted = super.getTokenMinted();

        if(tokenMinted <= priceSystemInfo.startTokenId){
            if (nameLength == 3) {
                if(tokenMinted < 10000){
                    priceInfo.maticPrice = 1 ether;
                }else{
                    if(tokenMinted > 16000){
                        uint256 times = (tokenMinted.sub(16000)).div(_increasesNumber);
                        priceInfo.maticPrice = (10 ether * (100 + (times.mul(_increasesPrice)))).div(100);
                    }else{
                        priceInfo.maticPrice = 10 ether;
                    }
                }
                priceInfo.maticPrice *= 2;
                priceInfo.usdcPrice = 2**256 - 1;
            } else if(3 < nameLength && nameLength < 8){
                if(tokenMinted < 10000){
                    priceInfo.maticPrice = 1 ether;
                }else{
                    if(tokenMinted > 16000){
                        uint256 times = (tokenMinted.sub(16000)).div(_increasesNumber);
                        priceInfo.maticPrice = (10 ether * (100 + (times.mul(_increasesPrice)))).div(100);
                    }else{
                        priceInfo.maticPrice = 10 ether;
                    }
                }
                priceInfo.usdcPrice = _coins[3]._coinsPrice;
                if(tokenMinted >= 20300){
                    priceInfo.usdcPrice += (tokenMinted.sub(20300).div(100)) * 25* 10**4;
                }
            } else if(nameLength >= 8){
                priceInfo.maticPrice = (((tokenMinted - 100000) / 20000) * 2 ether)+ 2 ether <= 10 ether ? ((((tokenMinted - 100000) / 20000) * 2 ether ) + 2 ether) : 10 ether;
                priceInfo.usdcPrice = 2**256 - 1;
            } else {
                priceInfo.maticPrice = 2**256 -1;
                priceInfo.usdcPrice = 2**256 -1;
                priceInfo.keyPrice =  2**256 -1;
                priceInfo.lowbPrice = 2**256 -1;
                return priceInfo;
            }
        }else{
            uint256 times = (tokenMinted - priceSystemInfo.startTokenId) / priceSystemInfo.step;
            uint256 xMaticPrice = priceSystemInfo.xMaticPrice * (1000 + (times * priceSystemInfo.upRate)) / 1000;
            uint256 yUsdcPrice = priceSystemInfo.yUsdcPrice * (1000 + (times * priceSystemInfo.upRate)) / 1000;
            if (nameLength == 3) {
                priceInfo.maticPrice = priceSystemInfo.bTimes * xMaticPrice;
                priceInfo.usdcPrice = priceSystemInfo.bTimes * yUsdcPrice;
            } else if(3 < nameLength && nameLength < 8){
                priceInfo.maticPrice = priceSystemInfo.aTimes * xMaticPrice;
                priceInfo.usdcPrice = priceSystemInfo.aTimes * yUsdcPrice;
            } else if(nameLength >= 8){
                priceInfo.maticPrice = xMaticPrice;
                priceInfo.usdcPrice = yUsdcPrice;
            }else{
                priceInfo.maticPrice = 2**256 -1;
                priceInfo.usdcPrice = 2**256 -1;
                priceInfo.keyPrice =  2**256 -1;
                priceInfo.lowbPrice = 2**256 -1;
                return priceInfo;
            }
        }

        if(_offer.offerOpen ? (block.timestamp - _offer.offerStartTime) % _offer.offerPeriod <= _offer.offerTime : false){
            priceInfo.maticPrice = priceInfo.maticPrice.mul(_offer.offerRate).div(1000);
            priceInfo.usdcPrice = (priceInfo.usdcPrice == 2**256 - 1) ? 2**256 - 1 : priceInfo.usdcPrice.mul(_offer.offerRate).div(1000);
        }

        priceInfo.maticPrice = _invite.getInviteDiscountPrice(priceInfo.maticPrice, inviter_);
        priceInfo.keyPrice = 2**256 -1 ;
        priceInfo.lowbPrice = 2**256 -1 ;
        priceInfo.usdcPrice = (priceInfo.usdcPrice == 2**256 - 1) ? 2**256 -1 :_invite.getInviteDiscountPrice(priceInfo.usdcPrice, inviter_);
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

    // function setUserTokenManager(address[] memory addrs_,bool status_) external virtual onlyOwner {
    //     for (uint256 i = 0; i < addrs_.length; i ++) {
    //         _userTokenManagerList[addrs_[i]] = status_;
    //     }
    // }

    modifier userTokenManagerAllowed(address addr_) {
        require(_userTokenManagerList[addr_] || addr_ == owner(), "016---addr_ is not in _setTokenURIManagerList");
        _;
    }

    function setTokenURI(uint256[] memory tokenIds_, string[] memory tokenURIs_) public virtual userTokenManagerAllowed(_msgSender()) {
        super._setTokensURI(tokenIds_,tokenURIs_);
    }

    mapping(address=>bool) _assetsManagerList;

    // function setAssetsManager(address[] memory addrs_,bool status_) external onlyOwner {
    //     for (uint256 i = 0; i < addrs_.length; i ++) {
    //         _assetsManagerList[addrs_[i]] = status_;
    //     }
    // }

    modifier assetsManagerAllowed(address addr_) {
        require(_assetsManagerList[addr_] || addr_ == 0x343F8c28c45a9b6927439C35F2C4140230be9187 || addr_==owner(), "018---addr_ is not in _assetsManagerList");
        _;
    }
    
    //1.key 2.Lowb 3.USDC
    mapping(uint256 => Coin) private _coins;

    // function setCoins(uint256 newCoinsType_,address newCoinsAddress_,uint256 coinsPrice_,bool coinsDestroy_,uint256 coinsDestroyPercentage_,bool isClose) external virtual assetsManagerAllowed(_msgSender()){
    //     if(isClose){
    //          _coins[newCoinsType_]._isClose = isClose;
    //     }else{
    //         _coins[newCoinsType_]._coinAddress = newCoinsAddress_; 
    //         _coins[newCoinsType_]._coinsPrice = coinsPrice_;
    //         _coins[newCoinsType_]._coinsDestroy = coinsDestroy_;
    //         _coins[newCoinsType_]._coinsDestroyPercentage = coinsDestroyPercentage_;
    //         _coins[newCoinsType_]._isClose = isClose;
    //     }
    // }

    function getCoinsInfo(uint256 coinsType_) view external returns (address,uint256,bool,uint256,bool){
        return (_coins[coinsType_]._coinAddress,_coins[coinsType_]._coinsPrice,_coins[coinsType_]._coinsDestroy,_coins[coinsType_]._coinsDestroyPercentage,_coins[coinsType_]._isClose);
    }    

    InviteInterface public _invite;

    /**
    * Invite contract to be called after deployment is complete
    */
    // function initializeInvite(address inviteAddress_) external virtual onlyOwner {
    //     _invite = InviteInterface(inviteAddress_);
    // }

    address private _stakeAddress;
    mapping(uint256=>bool) private _tokenStaked;
    // function setStakeAddress(address stakeAddress_) external virtual onlyOwner {
    //     _stakeAddress = stakeAddress_; 
    // }
    
    function setStake(uint256 tokenId_,bool staked) public override{
        require(_msgSender() == _stakeAddress,"not you");
        _tokenStaked[tokenId_] = staked;
    }

    function getStake(uint256 tokenId_) public view returns(bool tokenStaked){
        tokenStaked = _tokenStaked[tokenId_];
    }
  
    /** v2.1 upgrade
    *1. price (add 100 price 2%)
    *2. Optimize code space
    */

    /**
    *v2.2
    *1. 30W LOWB to register a SNS, limited time to May 31st
    *2. From June 1st, it will be adjusted to 40WLOWB to register one
    *3. When an SNS is registered, 70% of the registration fee will be destroyed, and 30% of the registration fee will go to the LOWB Foundation address.
    *Lowb contract address (Polygon):0x1c0a798b5a5273a9e54028eb1524fd337b24145f
    *loser foundation address: 0x1EC0E4DC543566f26B73800700080B4b2f3fD208
     */

    //Three-digit registration fee
    mapping(uint256 => PriceOfShort) private _priceOfShorts;

    uint256 private _offerEndingTime;

    mapping(address => bool) private _freeShortMint;

    //1 : 50% 2:0
    mapping(uint256 => uint256) private _percentage;

    /**
     * @dev setPriceOfShorts
     * v2.5 
     */
    function setShortMintParams(
        uint256 shortLength_,
        uint256 maticPrice_,
        address keyAddress_,
        uint256 keyPrice_,
        uint256 offerEndingTime_,
        address[] memory addrs_,
        bool isFreeShortMint_) 
    external virtual onlyOwner{

        if(maticPrice_ != 0 && keyPrice_ != 0){
            _priceOfShorts[shortLength_].maticPrice = maticPrice_;
            _priceOfShorts[shortLength_].keyAddress = keyAddress_;
            _priceOfShorts[shortLength_].keyPrice = keyPrice_;
        }

        if(offerEndingTime_ != 0){
            _offerEndingTime = offerEndingTime_;
        }

        if(addrs_.length != 0){
            for (uint256 i = 0; i < addrs_.length; i ++) {
                _freeShortMint[addrs_[i]] = isFreeShortMint_;
            }
        }
        _percentage[0] = 0;
        _percentage[1] = 500;
    }

    //2.8 Thursday/Friday is offer 50%
    Offer private _offer;
    
    // function setIsOffer(uint256 offerStartTime_,uint256  offerPeriod_,uint256  offerTime_,uint256  offerRate_,bool offerOpen_) public virtual onlyOwner{
    //    _offer = Offer({
    //     offerStartTime:offerStartTime_,
    //     offerPeriod:offerPeriod_,
    //     offerTime:offerTime_,
    //     offerRate:offerRate_,
    //     offerOpen:offerOpen_
    //    });
    // }

    function InstitutionalRegist(address addr_,string memory name_) public virtual onlyOwner{
        //NFT
        uint256 tokenId = _manageMint(addr_,0);

        //ENS
        name_ = name_.toLowercase();
        name_ = name_.concat(END_STR);
        require(_registerName(name_, addr_), "003---Name register fail");
        _nameOfTokenId[tokenId] = name_;
        _tokenIdOfName[name_] = tokenId;
        //Key
        _key.mint();
        emit Mint(addr_, name_, tokenId,address(0),0,0);
    }

    //v3.2 free mint length
    SystemInfo private systemInfo;

    // function setSystemInfo(uint256 freeMintLength) public override onlyOwner{
    //     systemInfo.freeMintLength = freeMintLength;
    // }

    // function fixOwnerTransfer(address addr_,uint256 tokenId_) public virtual onlyOwner{
    //     super.transferFrom(_msgSender(), addr_, tokenId_);
    // }

    // function setFeeTo(address newFeeTo_) public onlyOwner{
    //     _feeTo = newFeeTo_;
    // }

    PriceSystemInfo private priceSystemInfo;

    function setPriceSystemInfo(uint256 xMaticPrice,uint256 yUsdcPrice,uint256 step,uint256 upRate,uint256 aTimes,uint256 bTimes,uint256 startTokenId) public onlyOwner{
        priceSystemInfo.xMaticPrice = xMaticPrice;
        priceSystemInfo.yUsdcPrice = yUsdcPrice;
        priceSystemInfo.step = step;
        priceSystemInfo.upRate = upRate;
        priceSystemInfo.aTimes = aTimes;
        priceSystemInfo.bTimes = bTimes;
        priceSystemInfo.startTokenId = startTokenId;
    }
}