const { ethers } = require("ethers");
require("dotenv").config();

// Contract ka ABI (JSON file) jo aapne abhi copy kiya tha
const contractArtifact = require("./AcademicCertificate.json");

// 1. Provider: Local Blockchain se connection banata hai
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// 2. Admin Wallet: HEC ka wallet jo transactions ko sign karega
const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

// 3. Contract Instance: Is object ke zariye hum smart contract se baat karenge
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractArtifact.abi, adminWallet);

module.exports = { provider, adminWallet, contract };