// import axios from "axios";
// import TelegramBot from "node-telegram-bot-api";

// export class QuranService {
//   static TELEGRAM_MESSAGE_LIMIT = 4000;

//   static async fetchAya(): Promise<string> {
//     try {
//       const randomAyaNumber = Math.floor(Math.random() * 6236) + 1;

//       const url = `http://api.alquran.cloud/v1/ayah/${randomAyaNumber}/ar`;
//       const res = await axios.get(url);
//       const data = res.data?.data;

//       if (!data) return "No aya found";

//       const ayaText = data.text;
//       const surahName = data.surah?.name || "";

//       return `${ayaText}\n*${surahName}*`;
//     } catch (err) {
//       console.error("Error fetching aya:", err);
//       return "Failed to fetch aya";
//     }
//   }

//   static async sendAya(bot: TelegramBot, chatId: number) {
//     const message = await this.fetchAya();

//     for (let i = 0; i < message.length; i += this.TELEGRAM_MESSAGE_LIMIT) {
//       const chunk = message.substring(i, i + this.TELEGRAM_MESSAGE_LIMIT);
//       await bot.sendMessage(chatId, chunk, { parse_mode: "Markdown" });
//     }
//   }
// }
