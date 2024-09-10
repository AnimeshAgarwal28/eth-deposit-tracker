```

⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣴⣶⣾⣿⣿⣿⣿⣷⣶⣦⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣠⣴⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣦⣄⠀⠀⠀⠀⠀
⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀
⠀⠀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀
⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠀
⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⣀⠀⠀⠀⠈⢻⣿⣿⣿⣿⣿⣿⣿⣿⡆
⣾⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⣀⡤⠖⠛⠉⠛⠶⣤⣀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣷
⣿⣿⣿⣿⣿⣿⣿⣿⡿⠞⠋⠁⠀⠀⠀⠀⠀⠀⠀⠈⠙⠳⣿⣿⣿⣿⣿⣿⣿⣿
⢿⣿⣿⣿⣿⣿⣿⣿⣿⡳⢦⣄⠀⠀⠀⠀⠀⠀⠀⣠⡴⢚⣿⣿⣿⣿⣿⣿⣿⡿
⠸⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠈⠙⠶⣄⣀⣤⠖⠋⠁⣠⣿⣿⣿⣿⣿⣿⣿⣿⠇
⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠉⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀
⠀⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⠟⠀⠀
⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⣴⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀
⠀⠀⠀⠀⠀⠙⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠻⠿⢿⣿⣿⣿⣿⡿⠿⠟⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀

```

# Ethereum Deposit Tracker

I built this Ethereum deposit monitoring app to track deposits made to the Ethereum Beacon Deposit Contract (address: `0x00000000219ab540356cBB839Cbe05303d7705Fa`). It uses Alchemy's WebSocket API to fetch deposit events, stores them in MongoDB, and logs data in InfluxDB for real-time visualization with Grafana. Plus, it sends deposit notifications to a Telegram bot!

## Features
- Monitor ethereum deposits in real-time.
- Store deposit data in mongoDB.
- Log deposit information into InfluxDB for data visualization using grafana.
- Send telegram notifications for every new deposit.
- **Ethereum RPC Interaction:** The application uses Ethereum RPC methods to interact with the blockchain and fetch additional details like transaction receipts and block data for each deposit.
- **Publisher-Subscriber Model:** Implements a pub-sub pattern using WebSocket and event listeners to handle deposit events efficiently.
- **Multi-Deposit Handling:** The tracking system is designed to handle multiple deposits made in a single transaction, including internal transactions. This ensures that all deposit events are processed even if several deposits are bundled together in a single transaction.

## How it Works
### Pub-Sub Model
The app follows a Publisher-Subscriber (Pub-Sub) model for handling deposit events. Here's how it works:
- **Publisher (Ethereum Smart Contract):** The Ethereum Beacon Deposit Contract emits events whenever a new deposit occurs.
- **Subscriber (Application):** The app subscribes to these events via a WebSocket connection established using `ethers.providers.WebSocketProvider`.
- **Event Listener:** Once the contract emits a `DepositEvent`, the application listens for this event and processes it in the `monitorNewDeposits` function. This decouples the contract's event publishing from the app's event processing.

### Benefits of Pub-Sub:
- **Scalability:** The Pub-Sub model allows the app to handle large volumes of deposit events asynchronously and in real-time without polling.
- **Efficiency:** By using WebSockets, the app avoids continuous HTTP requests (i.e., polling) and reduces network overhead, only reacting to new events when they occur.

## Multi-Deposit Handling
The application can process multiple deposits in a single transaction, including internal transactions. In the `processDepositEvents` function, each event is looped over and processed individually. This ensures that even if several deposit events are part of the same transaction, they are all captured, logged, and stored appropriately in MongoDB and InfluxDB.

## API used
The application uses `ethers.js` to interact with the Ethereum blockchain:
1. **WebSocket Connection for Event Monitoring:**
   - The WebSocket connection (via Alchemy’s WebSocket API) listens for DepositEvent from the Ethereum Beacon Deposit Contract.
   - This event subscription is efficient as it pushes data to the application in real-time, unlike HTTP polling, which constantly checks for new data.

2. **Ethereum RPC Methods:**
   - After receiving a deposit event, the application makes API calls to fetch additional details:
     - `provider.getTransactionReceipt(event.transactionHash)` fetches the transaction receipt to retrieve the gas fee.
     - `provider.getBlock(event.blockNumber)` fetches the block details, such as the block timestamp.

### Efficiency
- **WebSocket Efficiency:** The WebSocket connection is highly efficient for real-time event monitoring as it reduces unnecessary HTTP requests. Only events that are emitted by the contract are processed, making it scalable and responsive.
- **InfluxDB Write Efficiency:** Data is written to InfluxDB in a non-blocking manner using the `writeApi.writePoint()` method, followed by `writeApi.flush()` to ensure data is written without delay, making it suitable for real-time data streaming.

## Prerequisites
Before running the application, ensure the following dependencies are installed:
- Node.js
- MongoDB
- InfluxDB
- Grafana (Optional)

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/AnimeshAgarwal28/eth-deposit-tracker.git
cd eth-deposit-tracker
```

### 2. Install Node.js dependencies
```bash
npm install
```

### 3. Set up MongoDB
#### Install MongoDB:
Follow the instructions for your OS from the [MongoDB installation guide](https://www.mongodb.com/docs/manual/installation/).

#### Start MongoDB:
```bash
mongod --dbpath /your_directory_path
```

### 4. Set up InfluxDB
#### Install InfluxDB:
Refer to the official [InfluxDB installation documentation](https://docs.influxdata.com/influxdb/v2.0/install/) for instructions.

#### Start InfluxDB:
```bash
influxd
```

#### Set up InfluxDB:
1. Open InfluxDB UI by visiting `http://localhost:8086`.
2. Create a new bucket and token (this token will be used in the `.env` file).

### 5. Set Up the Telegram Bot
To send deposit notifications to Telegram, follow these steps to create a Telegram bot and obtain the necessary credentials:

#### i. Create a Telegram Bot
1. **Open Telegram** and search for the bot **@BotFather**.
2. **Start a chat** with @BotFather by typing `/start`.
3. **Create a new bot** by typing `/newbot` and following the instructions:
   - Provide a name for your bot.
   - Choose a username for the bot. The username must end with "bot".

4. After completing the bot creation, @BotFather will provide you with an **API Key**. You will need this key for your `.env` file.

#### ii. Get Your Chat ID
1. **Start a chat** with your newly created bot by searching for its username (e.g., `EthDepositTracker_bot`) in Telegram.
2. Send a message to your bot.
3. Obtain your chat ID:
   - Send a message to the bot from your telegram account.
   - Open a terminal and run the following cURL command with your bot token:
     ```bash
     curl -s https://api.telegram.org/bot<TELEGRAM_BOT_KEY>/getUpdates
     ```
   - Copy the `id` field and save it as your `CHAT_ID`.

#### iii. Add Bot API Key and Chat ID to `.env`
After creating the bot and retrieving your `CHAT_ID`, update your `.env`.

#### iv. Test the Bot
1. Run the Ethereum deposit tracker application:
   ```bash
   node monitor.js
   ```
2. Once a new deposit is detected, the bot should send a message to your Telegram chat with the deposit details.

### 6. Set up Grafana (Optional)
#### Install Grafana:
Instructions for Grafana installation are available on the [official website](https://grafana.com/docs/grafana/latest/installation/).

#### Start Grafana:
```bash
grafana-server
```

### 6. Create your `.env` file
I have included an .env.example that can be used for reference.

1. Rename `.env.example` to `.env`:
2. Edit the `.env` file to include your API keys.

### 7. Start the Application
```bash
npm start
```

## Usage
- The application listens for deposit events.
- New deposits are stored in MongoDB, logged in InfluxDB, and notifications are sent to the Telegram bot.

## Monitoring and Visualization with Grafana
To visualize deposit data in Grafana, set up an InfluxDB data source by connecting Grafana to InfluxDB using InfluxDB's URL: `http://localhost:8086` and the API key from your `.env` file. Create dashboards to display deposit logs.

## Here is a ASCII graph that explains what each file in the /src does:


```
                             +------------------------+
                             |        monitor.js       |
                             |------------------------|
                             | - Connect to MongoDB    |
                             | - Monitor new deposits  |
                             +-----------+------------+
                                         |
                                         |
                                         V
                             +------------------------+
                             |       contract.js      |
                             |------------------------|
                             | - Connect to Ethereum   |
                             | - Set up ABI for Beacon |
                             |   Deposit Contract      |
                             | - Listen for DepositEvent |
                             +-----------+------------+
                                         |
                                         |
                                         V
                     +-------------------+--------------------+
                     |                                        |
                     |                                        |
                     V                                        V
   +-------------------------+              +-------------------------+
   |      eventProcess.js    |              |          db.js           |
   |-------------------------|              |-------------------------|
   | - Connect to InfluxDB   |              | - Connect to MongoDB     |
   | - Process DepositEvent  |              | - Store deposit data     |
   |   logs                  |              +-----------+-------------+
   | - Write data to InfluxDB|                          |
   | - Send Telegram alerts  |                          |
   +-----------+-------------+                          |
               |                                        |
               |                                        |
               V                                        V
    +---------------------+                    +--------------------------+
    |    telegramBot.js   |                    |    Data Storage (MongoDB,|
    |----------------------|                    |    InfluxDB, etc.)        |
    | - Send notifications |                    | - Store deposit records  |
    +----------------------+                    +--------------------------+
```
