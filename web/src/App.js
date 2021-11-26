import { useEffect, useState } from "react";
import { ethers } from "ethers";

import "./App.css";

import contractMeta from "./contract_meta.json";

const CONTRACT_ADDRESS = "0x528EE74F2D2d0C029BDAaafc0c3a367f91c6ce25";

const App = () => {
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

  useEffect(() => {
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const createWave = async () => {
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
  };

  useEffect(() => {
    registerOnNewWaveHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function createContract() {
    // Get Web3 provider/signer
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    // Get contract
    return new ethers.Contract(CONTRACT_ADDRESS, contractMeta.abi, signer);
  }

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  }

  function WaveList(props) {
    const waves = props.waves;

    if (waves.length === 0) {
      return (<p>none</p>);
    }

    const items = waves.map((wave, index) =>
      <div key={index} className="recent-wave-container">
        <p className="recent-wave-address">{wave.address}</p>
        <p className="recent-wave-time">({wave.timestamp.toLocaleString("en-US")})</p>
        <p>{wave.message}</p>
      </div>
    );

    return (<div>{items}</div>);
  }
  
  return (
    <div className="main-container">
      <div className="content-container">
        <h1>👋 <span className="colorized-text">Hello!</span></h1>

        <p>
          I am Matt. I just started to learn Web3 development, so that's pretty cool right? Connect
          your Ethereum wallet and wave at me!
        </p>

        <p className="small-text">You can win some Ether! Don't tell anybody! 🤫</p>

        {!currentAccount && (
          <div className="connect-wallet-container">
            <button onClick={connectWallet}>Connect Wallet</button>
          </div>
        )}

        {currentAccount && (
          <div className="send-message-container">
            <textarea
              type="text"
              placeholder="Your message"
              rows="5"
              disabled={isLoading}
              onChange={handleMessageChange}
              value={message}
            />

            <button
              className="colorized-bg"
              disabled={message === "" || isLoading}
              onClick={createWave}>
              Wave at Me
            </button>
            
            {isLoading && (
              <div className="loader" />
            )}
          </div>
        )}

        {currentAccount && (
          <div className="recent-waves-container">
            <h2>Recent Waves</h2>
            <WaveList waves={allWaves} />
          </div>
        )}

        <div className="about-container">
          <p>
            <span>build with 🦄 </span>
            <a href="https://buildspace.so" className="colorized-text">buildspace</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
