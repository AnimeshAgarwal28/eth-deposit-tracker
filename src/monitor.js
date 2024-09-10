const { connectToMongo } = require("./db");
const { monitorNewDeposits } = require("./contract");

// Main entry point
(async () => {
  try {
    await connectToMongo();
    monitorNewDeposits();
  } catch (err) {
    console.error("error starting the application:", err);
  }
})();
