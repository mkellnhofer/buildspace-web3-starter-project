import { useEffect, useState } from "react";
import { ethers } from "ethers";

import "./App.css";

import contractMeta from "./contract_meta.json";

const CONTRACT_ADDRESS = "0x7675D4869126575d393DC295166de1d7624f3A46";

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [waves, setWaves] = useState([]);

  const setQueryWavesInterval = () => {
    // Query waves every 3 sec
    setInterval(function() {
      if (currentAccount && currentAccount !== "") {
        queryWaves();
      }
    }, 3000);
  }

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    // Check if we have access to window.ethereum
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    }

    try {
      // Get connected accounts
      const accounts = await ethereum.request({ method: "eth_accounts" });
      
      // Check if there is a connected account
      if (accounts.length === 0) {
        console.log("No authorized account found!");
        return;
      }

      // Get first connected account
      const account = accounts[0];
      console.log("Found an authorized account:", account);

      // Update state
      setCurrentAccount(account);

      // Query waves
      queryWaves();
    } catch (error) {
      console.log(error);
    }
  }

  // This runs our function when the page loads
  useEffect(() => {
    setQueryWavesInterval();
    checkIfWalletIsConnected();
  });

  const connectWallet = async () => {
    const { ethereum } = window;

    // Check if we have access to window.ethereum
    if (!ethereum) {
      alert("Get MetaMask!");
      return;
    }

    try {
      // Request account access
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      // Get first connected account
      const account = accounts[0];

      console.log("Connected account: ", account);

      // Update state
      setCurrentAccount(account);

      // Query waves
      queryWaves();
    } catch (error) {
      console.log(error);
    }
  }

  const queryWaves = async () => {
    try {
      // Get contract
      const wavePortalContract = createContract();

      // Get waves from contract
      setWaves(await wavePortalContract.getWaves());
    } catch (error) {
      console.log(error);
    }
  }

  const wave = async () => {
    try {
      // Get contract
      const wavePortalContract = createContract();

      // Execute the actual wave on contract
      const waveTxn = await wavePortalContract.wave();

      // Wait for mining of transaction
      console.log("Mining...", waveTxn.hash);
      setIsLoading(true);
      await waveTxn.wait();
      setIsLoading(false);
      console.log("Mined -- ", waveTxn.hash);

      // Get wave count from contract
      let count = await wavePortalContract.getTotalWaveCount();
      console.log("Retrieved total wave count...", count.toNumber());
    } catch (error) {
      console.log(error);
    }
  }

  function createContract() {
    // Get Web3 provider/signer
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    // Get contract
    return new ethers.Contract(CONTRACT_ADDRESS, contractMeta.abi, signer);
  }

  function WaveList(props) {
    const waves = props.waves;

    if (waves.length === 0) {
      return (<p>none</p>);
    }

    const listItems = waves.map((wave, i) => <li key={i}>{wave.sender}</li>);

    return (<ul>{listItems}</ul>);
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <h1>👋 Hey there!</h1>

        <p>
          I am Matt. I just started to learn Web3 development, so that's pretty cool right? Connect
          your Ethereum wallet and wave at me!
        </p>

        {!currentAccount && (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}

        {currentAccount && (
          <button className="colorized" onClick={wave}>Wave at Me</button>
        )}
        
        {isLoading && (
          <div className="loader" />
        )}

        {currentAccount && (
          <div className="recentWavers">
            <h2>Recent Wavers</h2>
            <WaveList waves={waves} />
          </div>
        )}
      </div>
    </div>
  );
}
