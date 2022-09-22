// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;
pragma experimental ABIEncoderV2;

/**
 * A generic resolver interface which includes all the functions including the ones deprecated
 */
interface ResolverV2_4 {

    struct Record {
        address owner;
        //address
        string ethAddress;
        string btcAddress;
        string ltcAddress;
        string dogeAddress;
        //ipfs
        string ipfsUrl;
        //records
        string url;
        string email;
        string avatar;
        string description;
        string notice;
        string keywords;
        string comGithub;
        string comReddit;
        string comTwitter;
        string orgTelegram;
    }

    event ContentChanged(string name_, string type_, string newContent,Record record);
    event OwnerChanged(string name_, address newOwner);

    function setRecords(string memory name_, address owner_) external;

    function getEthAddress(string memory name_) external view returns (string memory);

    function getBtcAddress(string memory name_) external view returns (string memory);

    function getLtcAddress(string memory name_) external view returns (string memory);

    function getDogeAddress(string memory name_) external view returns (string memory);

    function getIpfsUrl(string memory name_) external view returns (string memory);

    function getUrl(string memory name_) external view returns (string memory);

    function getEmail(string memory name_) external view returns (string memory);

    function getAvatar(string memory name_) external view returns (string memory);

    function getDescription(string memory name_) external view returns (string memory);

    function getNotice(string memory name_) external view returns (string memory);

    function getKeywords(string memory name_) external view returns (string memory);

    function getComGithub(string memory name_) external view returns (string memory);

    function getComReddit(string memory name_) external view returns (string memory);

    function getComTwitter(string memory name_) external view returns (string memory);

    function getOrgTelegram(string memory name_) external view returns (string memory);

    function getAllProperties(string memory name_) external returns (string memory);

    function setAllProperties(string memory name_, string memory recordsStr_) external;

}
