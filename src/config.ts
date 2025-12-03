import dotenv from "dotenv";
dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN || "";
// export const LAT = parseFloat(process.env.LAT || "36.2021");
// export const LON = parseFloat(process.env.LON || "37.1343");
// export const TIMEZONE = process.env.TIMEZONE || "Asia/Damascus";
// export const PRAYER_METHOD = parseInt(process.env.PRAYER_METHOD || "3");
// export const HADITH_API_KEY = process.env.HADITH_API_KEY || "";

if (!BOT_TOKEN) {
  throw new Error("❌ BOT_TOKEN is missing in .env file!");
}
