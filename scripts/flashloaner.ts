// make sure to test your own strategies, do not use this version in production
// import * as dotenv from "dotenv";
// dotenv.config();
// const privateKey:any = process.env.PRIVATE_KEY;
// const flashLoanerAddress: any = process.env.FLASH_LOANER;
// const provider = new ethers.providers.InfuraProvider('mainnet', process.env.INFURA_KEY);
// const wallet = new ethers.Wallet(privateKey, provider);

import {ethers} from "hardhat";

// uni/sushiswap ABIs
import * as UniswapV2Pair from '../abi/IUniswapV2Pair.json';
import * as UniswapV2Factory from '../abi/IUniswapV2Factory.json';
import * as _ethers from "ethers";


const ETH_TRADE = 10;
const DAI_TRADE = 3500;

const runBot = async () => {
  const sushiFactory = await ethers.getContractAt (
      UniswapV2Factory.abi,
    '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac');
  const uniswapFactory = await ethers.getContractAt(
    UniswapV2Factory.abi,
    '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  );
  const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
  const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

  let sushiEthDai: _ethers.Contract;
  let uniswapEthDai: _ethers.Contract;

  const loadPairs = async () => {
    sushiEthDai = await ethers.getContractAt(
      UniswapV2Pair.abi,
      await sushiFactory.getPair(wethAddress, daiAddress),
    );
    uniswapEthDai = await ethers.getContractAt(
      UniswapV2Pair.abi,
      await uniswapFactory.getPair(wethAddress, daiAddress),
    );
  };

  await loadPairs();

  ethers.provider.on('block', async (blockNumber) => {
    try {
      console.log(blockNumber);

      const sushiReserves = await sushiEthDai.getReserves();
      const uniswapReserves = await uniswapEthDai.getReserves();

      const reserve0Sushi = Number(ethers.utils.formatUnits(sushiReserves[0], 18));

      const reserve1Sushi = Number(ethers.utils.formatUnits(sushiReserves[1], 18));

      const reserve0Uni = Number(ethers.utils.formatUnits(uniswapReserves[0], 18));
      const reserve1Uni = Number(ethers.utils.formatUnits(uniswapReserves[1], 18));

      const priceUniswap = reserve0Uni / reserve1Uni;
      const priceSushiswap = reserve0Sushi / reserve1Sushi;

      const shouldStartEth = priceUniswap < priceSushiswap;
      const spread = Math.abs((priceSushiswap / priceUniswap - 1) * 100) - 0.6;

      const shouldTrade = spread > (
        (shouldStartEth ? ETH_TRADE : DAI_TRADE)
         / Number(
           ethers.utils.formatEther(uniswapReserves[shouldStartEth ? 1 : 0]),
         ));

      console.log(`UNISWAP PRICE ${priceUniswap}`);
      console.log(`SUSHISWAP PRICE ${priceSushiswap}`);
      console.log(`PROFITABLE? ${shouldTrade}`);
      console.log(`CURRENT SPREAD: ${(priceSushiswap / priceUniswap - 1) * 100}%`);
      console.log(`ABSLUTE SPREAD: ${spread}`);

      if (!shouldTrade) return;

      const gasLimit = await sushiEthDai.estimateGas.swap(
        !shouldStartEth ? DAI_TRADE : 0,
        shouldStartEth ? ETH_TRADE : 0,
        flashLoanerAddress,
        ethers.utils.toUtf8Bytes('1'),
      );

      const gasPrice = await ethers.provider.getGasPrice();

      const gasCost = Number(ethers.utils.formatEther(gasPrice.mul(gasLimit)));

      const shouldSendTx = shouldStartEth
        ? (gasCost / ETH_TRADE) < spread
        : (gasCost / (DAI_TRADE / priceUniswap)) < spread;

      // don't trade if gasCost is higher than the spread
      if (!shouldSendTx) return;

      const options = {
        gasPrice,
        gasLimit,
      };
      const tx = await sushiEthDai.swap(
        !shouldStartEth ? DAI_TRADE : 0,
        shouldStartEth ? ETH_TRADE : 0,
        flashLoanerAddress,
        ethers.utils.toUtf8Bytes('1'), options,
      );

      console.log('ARBITRAGE EXECUTED! PENDING TX TO BE MINED');
      console.log(tx);

      await tx.wait();

      console.log('SUCCESS! TX MINED');
    } catch (err) {
      console.error(err);
    }
  });
};

console.log('Bot started!');

runBot();