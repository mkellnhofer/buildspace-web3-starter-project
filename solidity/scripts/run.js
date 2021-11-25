async function main() {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.1"),
  });
  await waveContract.deployed();

  let waveContractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(waveContractBalance));

  let waveTxn = await waveContract.wave("A message!");
  await waveTxn.wait();

  waveContractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log("Contract balance:", hre.ethers.utils.formatEther(waveContractBalance));

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
