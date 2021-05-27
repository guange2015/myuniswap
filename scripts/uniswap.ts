import {ethers, network} from "hardhat";

async function deploy():Promise<string> {
    let Factory = await ethers.getContractFactory("UniswapV2Factory");

    let [account] = await ethers.getSigners();
    let factory = await Factory.deploy(account.address);
    await factory.deployed();

    console.log(`factory address is ${factory.address}`);


    let weth = '0xd0A1E359811322d97991E03f863a0C30C2cF029C';
    if(network.name == 'kovan'){
        weth = '0xd0A1E359811322d97991E03f863a0C30C2cF029C';
    } else {
        //自己部署一个
        let WETH = await ethers.getContractFactory('WETH');
        let _weth = await WETH.deploy();

        weth = _weth.address;
    }

    console.log(`weth address is ${weth}`)
    
    let Router = await ethers.getContractFactory("UniswapV2Router02");
    let router = await Router.deploy(factory.address, weth);

    await router.deployed();

    console.log(`router address is ${router.address}`)

    return router.address
}

//部署两个自有token
async function deployTokens():Promise<[string, string]>{
    let TokenA = await ethers.getContractFactory("TokenA");
    let tokenA = await TokenA.deploy("10000000000000000000000");  //发行10000个


    let TokenB = await ethers.getContractFactory("TokenB");
    let tokenB = await TokenB.deploy("10000000000000000000000");  //发行10000个


    console.log(`tokenA address is ${tokenA.address}`)
    console.log(`tokenB address is ${tokenB.address}`)

    return [tokenA.address, tokenB.address]
}

//兑换
async function swap() {
}

//添加流动性
async function addLiquidity(factory: string, 
    tokenA:string, 
    tokenB:string,
    amountA:number,
    amountB:number) {
    // factory address is 0xFaCCD1c77C82C779D336cb647CC2e41b73e28368
    // weth address is 0x4A98677E30a407f5C2c646781968b09B13ae6D18
    // router address is 0xd530696362f679B9C6c677294Afde0152c2991d0

    // tokenA address is 0x04BA98928cDe3e7A34aC3C727299607B0FE863Bb
    // tokenB address is 0x7478564e46bC2fBf497efCC4A08ea2f2E9f70377

    let [account] = await ethers.getSigners();

    
    const router = await ethers.ContractFactory.getContract(factory,
    [
        'function addLiquidity(address tokenA,address tokenB,uint amountADesired,uint amountBDesired,uint amountAMin,uint amountBMin,address to,uint deadline) external returns (uint amountA, uint amountB, uint liquidity)'
    ],account);


    const _tokenA = ethers.ContractFactory.getContract(tokenA,
        ['function approve(address spender, uint value) external returns (bool)',
         'function balanceOf(address account) public view returns (uint256)',
        'function allowance(address owner, address spender) public view returns (uint256)'],
        account);
    const _tokenB = ethers.ContractFactory.getContract(tokenB,
            ['function approve(address spender, uint value) external returns (bool)',
            'function balanceOf(address account) public view returns (uint256)',
            'function allowance(address owner, address spender) public view returns (uint256)'],
            account);

    //授权
    let tx = await _tokenA.approve(router.address, amountA);
    tx = await _tokenB.approve(router.address, amountB);
    
    
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
    tx = await router.addLiquidity(
        tokenA,
        tokenB,
        amountA,
        amountB,
        0,
        0,
        account.address,
        deadline,
        {gasLimit: 20e9}
    )
    console.log(`Transaction hash: ${tx.hash}`);

}


(async ()=>{
    let factory = await deploy();
    let [tokenA, tokenB] =  await deployTokens();

    //添加流动性
    const amountA = 1000;
    const amountB = 10000;
    await addLiquidity(factory, tokenA, tokenB, amountA, amountB);

    
    //兑换


})()


