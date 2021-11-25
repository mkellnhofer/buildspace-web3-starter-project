// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {

    uint private seed;

    uint private prizeAmount = 0.0001 ether;

    event NewWave(address indexed from, uint timestamp, string message);

    struct Wave {
        address waver;
        string message;
        uint timestamp;
    }

    Wave[] waves;

    mapping(address => uint) public lastWavedAt;

    constructor() payable {
        console.log("We have been constructed!");
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function wave(string memory _message) public {
        require(
            lastWavedAt[msg.sender] + 15 minutes < block.timestamp,
            "Wait 15m."
        );

        lastWavedAt[msg.sender] = block.timestamp;

        console.log("%s has waved!", msg.sender);

        waves.push(Wave(msg.sender, _message, block.timestamp));

        seed = (block.difficulty + block.timestamp + seed) % 100;

        if (seed <= 50) {
            console.log("%s won!", msg.sender);

            require(
                prizeAmount <= address(this).balance,
                "Contract has no more money."
            );

            (bool success, ) = (msg.sender).call{value: prizeAmount}("");

            require(
                success,
                "Could not withdraw money from contract."
            );
        }

        emit NewWave(msg.sender, block.timestamp, _message);
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaveCount() public view returns (uint) {
        console.log("We have %d total waves!", waves.length);
        return waves.length;
    }

}
