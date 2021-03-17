//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.12;


import {ILendingPoolAddressesProvider} from "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import {ILendingPool} from "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import {IERC20} from "@aave/protocol-v2/contracts/dependencies/openzeppelin/contracts/IERC20.sol";


contract FlashMoney {

  ILendingPool _lendingPool;

  constructor() public{
    _lendingPool = ILendingPool(_getAddress());
  }

  //获取LendingPool的地址
  function _getAddress() internal view returns (address) {
    ILendingPoolAddressesProvider LendingPoolAddressesProvider =
      ILendingPoolAddressesProvider(0x88757f2f99175387aB4C6a4b3067c77A695b0349);
    return LendingPoolAddressesProvider.getLendingPool();
  }


  function getAddress() public view returns(ILendingPool) {
    return _lendingPool;
  }


  //0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984 UNI
  function deposit() public {
    uint amount = 100e18;
    address DIA_ADDR = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;

    IERC20 daiToken = IERC20(DIA_ADDR);


    //转账到本合约
    // require(daiToken.transferFrom(msg.sender, address(this), amount), "transferfrom failed.");
    //授权
    require(daiToken.approve(address(_lendingPool), amount), "approve failed");

    _lendingPool.deposit(
      DIA_ADDR,
      amount,
      msg.sender,
      0
    );

  }

  function transfer() public{
    uint amount = 100;
    address DIA_ADDR = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;

    IERC20 daitoken = IERC20(DIA_ADDR);

    //转账到本合约
    require(daitoken.transferFrom(msg.sender, address(this), amount), "transferfrom failed.");
  }


  function getAmount() public view returns(uint) {
    address DIA_ADDR = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;
    IERC20 daiToken = IERC20(DIA_ADDR);
    return daiToken.balanceOf(msg.sender);
  }


}
