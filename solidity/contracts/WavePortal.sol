// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {

    uint private prizeAmount = 0.0001 ether;

    event NewWave(address indexed from, uint timestamp, string message);

    struct Wave {
        address waver;
        string message;
        uint timestamp;
    }

    Wave[] waves;

    constructor() payable {
        console.log("Servus, I am a contract and I am smart!");
    }

    function wave(string memory _message) public {
        console.log("%s has waved!", msg.sender);

        waves.push(Wave(msg.sender, _message, block.timestamp));

        emit NewWave(msg.sender, block.timestamp, _message);

        require(address(this).balance >= prizeAmount, "Contract has no more money.");

        (bool success,) = (msg.sender).call{value: prizeAmount}("");
        require(success, "Could not withdraw money from contract.");
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaveCount() public view returns (uint) {
        console.log("We have %d total waves!", waves.length);
        return waves.length;
    }

}
