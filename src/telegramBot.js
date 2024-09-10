require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

const chatId = process.env.CHAT_ID;

const sendNotification = async (message) => {
  try {
    await bot.sendMessage(chatId, message);
    console.log("Notification sent:", message);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = { sendNotification };
