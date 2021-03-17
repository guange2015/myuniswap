// SPDX-License-Identifier: UNLICENSED
pragma solidity >0.6.2;

import "hardhat/console.sol";

contract D {
  uint public x;
  constructor(uint a) public {
    x = a;
  }
}


contract C {
/// This complicated expression just tells you how the address
        /// can be pre-computed. It is just there for illustration.
        /// You actually only need ``new D{salt: salt}(arg)``.
  function createDSalted(bytes32 salt, uint arg) public {


    bytes20 a = bytes20(keccak256(abi.encodePacked(
      byte(0xff),
      address(this),
      salt,
      keccak256(abi.encodePacked(
        type(D).creationCode,
        arg
      ))
    ))<<8*12);

    console.log("a:", address(a));

    address predictedAddress = address(uint(keccak256(abi.encodePacked(
      byte(0xff),
      address(this),
      salt,
      keccak256(abi.encodePacked(
        type(D).creationCode,
        arg
      ))
    ))));

    // address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
    //   bytes1(0xff),
    //   address(this),
    //   salt,
    //   keccak256(abi.encodePacked(
    //     type(D).creationCode,
    //     arg
    //   ))
    // )))));
    //
    D d = new D{salt: salt}(arg);
    console.log("new address:", address(d));
    console.log("old address:", predictedAddress);
    require(address(d) == predictedAddress);
    }
}



