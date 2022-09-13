// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

// import "./FollowNFT.sol";
import "./CloneFactory.sol";


contract Test is CloneFactory{

    // function test() public{
    //     new FollowNFT("test", "test",0xB3eF1C9718F3EAFaeb6fd7Ac63E8f43493101Ded,0xFA12F5ff3c2A137a02F1678E50c54276624b50FB,1,10,10);
    // }    

    function createFoundation() public returns(address clone) {
        clone = createClone(0x6495885a76038875812C6cF534ED0627763FdA33);
    }

}
