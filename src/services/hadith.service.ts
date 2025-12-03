// import axios from "axios";
// import schedule from "node-schedule";
// import TelegramBot from "node-telegram-bot-api";
// import { GroupsService } from "./groups.service.js";
// import { HADITH_API_KEY } from "../config.js";

// export class HadithService {
//   static TELEGRAM_MESSAGE_LIMIT = 4000;

//   static async fetchHadith(): Promise<string> {
//     try {
//       const url = `https://hadithapi.com/api/hadiths/?apiKey=${HADITH_API_KEY}`;
//       const res = await axios.get(url);
//       const data = res.data;

//       const hadiths = data?.hadiths?.data;
//       if (!hadiths || hadiths.length === 0) return "No hadith available";

//       const randomHadith = hadiths[Math.floor(Math.random() * hadiths.length)];
//       const heading = randomHadith.headingArabic || " ";
//       const text = randomHadith.hadithArabic || " ";
//       const book = randomHadith.book?.bookName || " ";

//       return `<b>${heading}</b>\n${text}\n${book}`;
//     } catch (err) {
//       console.error("Error fetching hadith:", err);
//       return "Failed to fetch hadith";
//     }
//   }

//   static async sendHadith(bot: TelegramBot, chatId: number) {
//     const message = await this.fetchHadith();
//     for (let i = 0; i < message.length; i += this.TELEGRAM_MESSAGE_LIMIT) {
//       const chunk = message.substring(i, i + this.TELEGRAM_MESSAGE_LIMIT);
//       await bot.sendMessage(chatId, chunk, { parse_mode: "HTML" });
//     }
//   }

//   static async sendToAll(bot: TelegramBot) {
//     const groups = GroupsService.loadGroups();
//     for (const chatId of groups) {
//       try {
//         await this.sendHadith(bot, chatId);
//       } catch (err) {
//         console.error(`Failed to send hadith to ${chatId}:`, (err as Error).message);
//       }
//     }
//   }

//   static scheduleDaily(bot: TelegramBot) {
//     schedule.scheduleJob("0 19 * * *", () => {
//       this.sendToAll(bot);
//     });
//     console.log("Scheduled daily hadith at 19:00");
//   }
// }
