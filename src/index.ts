import { createBot } from "./bot/bot.js";

const token = process.env.BOT_TOKEN;

if (!token) {
    throw new Error("BOT_TOKEN is not defined in .env");
}

createBot(token)
console.log("BOT IS RUNNING... 🚀");
