import {ethers} from "hardhat";

async function main() {
    

    let Factory = await ethers.getContractFactory("UniswapV2Factory");

    let [account] = await ethers.getSigners();
    let factory = await Factory.deploy(account.address);
    await factory.deployed();

    console.log(factory.address);


    let Router = await ethers.getContractFactory("UniswapV2Router02");
    let router = await Router.deploy(factory.address, account.address);

    await router.deployed();

    console.log(`router address is ${router.address}`)
}

main();


