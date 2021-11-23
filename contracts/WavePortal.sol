// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {

    uint totalWaves;

    mapping (address => uint) userWaves;

    constructor() {
        console.log("Servus, I am a contract and I am smart!");
    }

    function wave() public {
        totalWaves += 1;
        userWaves[msg.sender]++;
        console.log("%s has waved!", msg.sender);
    }

    function getTotalWaves() public view returns (uint) {
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }

    function getUserWaves() public view returns (uint) {
        uint waves = userWaves[msg.sender];
        console.log("%s has %d total waves!", msg.sender, waves);
        return waves;
    }

}
