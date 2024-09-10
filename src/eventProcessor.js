require("dotenv").config();

const { InfluxDB, Point } = require("@influxdata/influxdb-client");
const { storeDepositInMongo } = require("./db");
const { sendNotification } = require("./telegramBot");
const { ethers } = require("ethers");
const provider = new ethers.providers.WebSocketProvider(
  `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
);

const influxDB = new InfluxDB({
  url: "http://localhost:8086",
  token: process.env.INFLUXDB_TOKEN,
});
const writeApi = influxDB.getWriteApi(
  process.env.INFLUXDB_ORG,
  process.env.INFLUXDB_BUCKET,
  "ns",
);

const processDepositLog = async (
  pubkey,
  withdrawal_credentials,
  amount,
  signature,
  index,
  event,
) => {
  try {
    const amountInWei = ethers.BigNumber.from(amount);
    const amountInEth = ethers.utils.formatEther(amountInWei);

    // Fetch the transaction receipt to get the gas fee and block details
    const receipt = await provider.getTransactionReceipt(event.transactionHash);
    const block = await provider.getBlock(event.blockNumber);

    const depositData = {
      blockNumber: event.blockNumber,
      blockTimestamp: block.timestamp,
      fee: ethers.utils.formatEther(
        receipt.gasUsed.mul(receipt.effectiveGasPrice),
      ),
      hash: event.transactionHash,
      pubkey: pubkey,
    };

    console.log("New deposit detected:", depositData);

    await storeDepositInMongo(depositData);

    // Prepare message for Telegram
    const message = `
        New Deposit Detected:
        - Block Number: ${depositData.blockNumber}
        - Block Timestamp: ${depositData.blockTimestamp}
        - Fee: ${depositData.fee} ETH
        - Transaction Hash: ${depositData.hash}
        - Public Key: ${pubkey}
        `;

    await sendNotification(message);

    // Write data to InfluxDB
    const point = new Point("deposits")
      .tag("transactionHash", depositData.hash)
      .floatField("blockNumber", depositData.blockNumber)
      .floatField("blockTimestamp", depositData.blockTimestamp)
      .floatField("fee", depositData.fee)
      .stringField("pubkey", depositData.pubkey);

    writeApi.writePoint(point);
    await writeApi.flush();
  } catch (error) {
    console.error("Error processing deposit log:", error);
  }
};

// This function handles multipile deposits within a single transaction
const processDepositEvents = async (events) => {
  for (const event of events) {
    const { pubkey, withdrawal_credentials, amount, signature, index } =
      event.args;
    await processDepositLog(
      pubkey,
      withdrawal_credentials,
      amount,
      signature,
      index,
      event,
    );
  }
};

module.exports = { processDepositLog, processDepositEvents };
