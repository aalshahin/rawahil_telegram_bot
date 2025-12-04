import dotenv from "dotenv";
dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN || "";
export const HADITH_API_KEY = process.env.HADITH_API_KEY || "";

if (!BOT_TOKEN) {
  throw new Error("❌ BOT_TOKEN is missing in .env file!");
}
