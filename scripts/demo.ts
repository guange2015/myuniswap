import { utils } from "ethers";
import {ethers} from "hardhat"



async function main() {
    let Greeter = await ethers.getContractFactory("Greeter");
    let greeter = await Greeter.deploy("guange");

    await greeter.deployed();

    let s = await greeter.test_bytes();

    console.log(s);

    console.log(ethers.utils.parseBytes32String(s));


}


main()