async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account: ", deployer.address);

  const accountBalance = await deployer.getBalance();
  console.log("Account balance: ", accountBalance.toString());

  const contractFactory = await hre.ethers.getContractFactory("WavePortal");
  const contract= await contractFactory.deploy();
  await contract.deployed();

  console.log("WavePortal contract address: ", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
