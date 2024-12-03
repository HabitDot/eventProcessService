import { ethers } from "ethers";
import * as dotenv from "dotenv";
// ABI of HabitDotV1 contract
import contractABI from "./HabitDotV3.json";
import { CONTRACT_ADDRESS } from "./constants";
import axios from "axios";

// Load environment variables
dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.api.moonbeam.network"
); // RPC URL
// const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL); // RPC URL
const validatorPrivateKey = process.env.VALIDATOR_PRIVATE_KEY as string; // Validator private key
const contractAddress = CONTRACT_ADDRESS; // Contract address

// Validator wallet
const validatorWallet = new ethers.Wallet(validatorPrivateKey, provider);

// Contract instance
const contract = new ethers.Contract(
  contractAddress,
  contractABI.abi,
  validatorWallet
);

// Listen to `CheckInRequested` event
async function listenForCheckInRequests(): Promise<void> {
  console.log("Listening for CheckInRequested events...");

  contract.on(
    "CheckInRequested",
    async (user: string, habitId: ethers.BigNumberish, proofUrl: string) => {
      console.log(
        `Check-in requested by user: ${user}, habit ID: ${habitId.toString()}, proof URL: ${proofUrl}`
      );

      try {
        console.log(await fetchData(user, habitId.toString(), proofUrl));
        console.log("Request Processed!");
      } catch (error) {
        console.error("Error processing:", error);
      }
    }
  );
}

async function fetchData(user: string, habitId: string, proofUrl: string) {
  const url = process.env.PHALA_URL as string;
  const params = {
    user: user,
    habitId: habitId,
    proofUrl: proofUrl,
    model: "gpt-4o",
  };

  try {
    const response = await axios.get(url, { params });
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Start the listener
listenForCheckInRequests().catch(console.error);
