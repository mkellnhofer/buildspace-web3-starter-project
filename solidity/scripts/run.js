async function main() {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy();
  await waveContract.deployed();

  console.log("Contract deployed to:", waveContract.address);
  console.log("Contract deployed by:", owner.address);

  let waveCount = await waveContract.getTotalWaveCount();

  let waveTxn = await waveContract.wave();
  await waveTxn.wait();

  waveTxn = await waveContract.connect(randomPerson).wave();
  await waveTxn.wait();

  waveCount = await waveContract.getTotalWaveCount();

  const waves = await waveContract.getWaves();

  console.log("Waves:");
  for (const wave of waves) {
    console.log(wave.sender, " - ", wave.timestamp.toString());
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
