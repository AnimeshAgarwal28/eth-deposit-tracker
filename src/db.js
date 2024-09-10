const { MongoClient } = require("mongodb");

const mongoUri = "mongodb://localhost:27017";
const dbName = "ethereum_deposits";
const collectionName = "deposits";
let client;

const connectToMongo = async () => {
  client = new MongoClient(mongoUri);
  await client.connect();
  console.log("Connected to mongoDB");
};

// Store deposit data in MongoDB
const storeDepositInMongo = async (depositData) => {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  try {
    await collection.insertOne(depositData);
    console.log("Deposit stored in mongoDB:", depositData);
  } catch (err) {
    console.error("Error storing deposit in MongoDB:", err);
  }
};

module.exports = { connectToMongo, storeDepositInMongo };
