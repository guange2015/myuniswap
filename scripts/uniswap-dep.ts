import {ethers, network} from "hardhat";

async function main() {
    

    let Factory = await ethers.getContractFactory("UniswapV2Factory");

    let [account] = await ethers.getSigners();
    let factory = await Factory.deploy(account.address);
    await factory.deployed();

    console.log(factory.address);



    let weth = '0xd0A1E359811322d97991E03f863a0C30C2cF029C';
    if(network.name == 'kovan'){
        weth = '0xd0A1E359811322d97991E03f863a0C30C2cF029C';
    } else {
        //自己部署一个
        let WETH = await ethers.getContractFactory('WETH');
        let _weth = await WETH.deploy();

        weth = _weth.address;
    }
    
    


    let Router = await ethers.getContractFactory("UniswapV2Router02");
    let router = await Router.deploy(factory.address, weth);

    await router.deployed();

    console.log(`router address is ${router.address}`)
}

main();


