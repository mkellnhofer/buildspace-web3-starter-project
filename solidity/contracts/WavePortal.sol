// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {

    event NewWave(address sender, uint timestamp);

    struct Wave {
      address sender;
      uint timestamp;
    }

    Wave[] waves;

    constructor() {
        console.log("Servus, I am a contract and I am smart!");
    }

    function wave() public {
        console.log("%s has waved!", msg.sender);
        waves.push(Wave(msg.sender, block.timestamp));
        emit NewWave(msg.sender, block.timestamp);
    }

    function getWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaveCount() public view returns (uint) {
        console.log("We have %d total waves!", waves.length);
        return waves.length;
    }

}
