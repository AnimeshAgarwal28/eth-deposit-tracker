require("dotenv").config();

const { ethers } = require("ethers");
const { processDepositEvents } = require("./eventProcessor");
const { Alchemy, Network } = require("alchemy-sdk");

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const provider = new ethers.providers.WebSocketProvider(
  `wss://eth-mainnet.g.alchemy.com/v2/${config.apiKey}`,
);

const beaconDepositContract = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
const abi = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bytes", name: "pubkey", type: "bytes" },
      {
        indexed: false,
        internalType: "bytes",
        name: "withdrawal_credentials",
        type: "bytes",
      },
      { indexed: false, internalType: "bytes", name: "amount", type: "bytes" },
      {
        indexed: false,
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
      { indexed: false, internalType: "bytes", name: "index", type: "bytes" },
    ],
    name: "DepositEvent",
    type: "event",
  },
];

// Create an ethers contract instance with the ABI and provider
const contract = new ethers.Contract(beaconDepositContract, abi, provider);

// Function to monitor new deposit events
const monitorNewDeposits = () => {
  console.log("Listening for new Ethereum deposits to the Beacon Contract...");

  // Listen for the DepositEvent emitted by the contract
  contract.on(
    "DepositEvent",
    async (pubkey, withdrawal_credentials, amount, signature, index, event) => {
      const events = [
        {
          args: { pubkey, withdrawal_credentials, amount, signature, index },
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        },
      ];
      await processDepositEvents(events);
    },
  );
};

module.exports = { monitorNewDeposits };
