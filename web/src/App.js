import { useEffect, useState } from "react";
import { ethers } from "ethers";

import "./App.css";

import contractMeta from "./contract_meta.json";

const CONTRACT_ADDRESS = "0x528EE74F2D2d0C029BDAaafc0c3a367f91c6ce25";

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [allWaves, setAllWaves] = useState([]);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    // Check if we have access to window.ethereum
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    }

    // Query waves 
    getAllWaves();

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
    } catch (error) {
      console.log(error);
    }
  }

  // This runs our function when the page loads
  useEffect(() => {
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
      getAllWaves();
    } catch (error) {
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    try {
      // Get contract
      const wavePortalContract = createContract();

      // Get waves from contract
      const waves = await wavePortalContract.getAllWaves();
      
      // Convert objects
      let wavesCleaned = [];
      waves.forEach(wave => {
        wavesCleaned.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        });
      });

      // Update state
      setAllWaves(wavesCleaned);
    } catch (error) {
      console.log(error);
    }
  }

  const onNewWaveHandler = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  const registerOnNewWaveHandler = () => {
    const { ethereum } = window;

    // Check if we have access to window.ethereum
    if (!ethereum) {
      return () => {};
    }

    // Get contract
    const wavePortalContract = createContract();

    // Subscribe event 'NewWave'
    wavePortalContract.on("NewWave", onNewWaveHandler);

    return () => {
      // Unsubscribe event 'NewWave'
      wavePortalContract.off("NewWave", onNewWaveHandler);
    };
  }

  // This runs our function when the page loads
  useEffect(() => {
    registerOnNewWaveHandler();
  });

  const wave = async () => {
    try {
      // Get contract
      const wavePortalContract = createContract();

      // Execute the actual wave on contract
      const waveTxn = await wavePortalContract.wave(message);

      // Wait for mining of transaction
      console.log("Mining...", waveTxn.hash);
      setIsLoading(true);
      await waveTxn.wait();
      setMessage("");
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

    const items = waves.map((wave, index) =>
      <div key={index} className="recentWaveContainer">
        <p>{wave.address}</p>
        <p>({wave.timestamp.toLocaleString("en-US")})</p>
        <p>Message: {wave.message}</p>
      </div>
    );

    return (<div>{items}</div>);
  }

  function handleMessageChange(event) {
    setMessage(event.target.value);
  }
  
  return (
    <div className="mainContainer">
      <div className="contentContainer">
        <h1>👋 <span className="colorizedText">Servus!</span></h1>

        <p>
          I am Matt. I just started to learn Web3 development, so that's pretty cool right? Connect
          your Ethereum wallet and wave at me!
        </p>

        <p className="smallText">You can win some Ether! Don't tell anybody! 🤫</p>

        {!currentAccount && (
          <div className="connectWalletContainer">
            <button onClick={connectWallet}>Connect Wallet</button>
          </div>
        )}

        {currentAccount && (
          <div className="sendMessageContainer">
            <textarea
              type="text"
              placeholder="Your message"
              rows="5"
              disabled={isLoading}
              onChange={handleMessageChange}
              value={message}
            />

            <button
              className="colorizedBg"
              disabled={message === "" || isLoading}
              onClick={wave}>
              Wave at Me
            </button>
            
            {isLoading && (
              <div className="loader" />
            )}
          </div>
        )}

        {currentAccount && (
          <div className="recentWavesContainer">
            <h2>Recent Waves</h2>
            <WaveList waves={allWaves} />
          </div>
        )}
      </div>
    </div>
  );
}
