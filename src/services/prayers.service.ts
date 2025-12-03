// src/services/prayers.service.ts
// import axios from "axios";
// import { DateTime } from "luxon";
// import schedule from "node-schedule";
// import TelegramBot from "node-telegram-bot-api";
// import prayersData from "../data/prayers.json" with { type: "json" };
// import { LAT, LON, TIMEZONE, PRAYER_METHOD } from "../config.js";
// import type { PrayerMessage, Prayers } from "../types/prayers.js";

// export class PrayersService {
//   static async getPrayerTimes(): Promise<Record<string, string>> {
//     const res = await axios.get(`https://api.aladhan.com/v1/timings?latitude=${LAT}&longitude=${LON}&method=${PRAYER_METHOD}`);
//     return res.data.data.timings;
//   }

//   static schedulePrayer(bot: TelegramBot, chatId: number, name: keyof Prayers, time: string, withPreReminder = false) {
//     const now = DateTime.now().setZone(TIMEZONE);
//     const prayerTime = DateTime.fromFormat(time, "HH:mm", { zone: TIMEZONE });
//     const delayedTime = prayerTime.plus({ minutes: 0.25 });
//     if (delayedTime <= now) return;

//     const sendMessages = async (messages: PrayerMessage[]) => {
//       for (const msg of messages) {
//         if (msg.type === "sticker") await bot.sendSticker(chatId, msg.content);
//         else await bot.sendMessage(chatId, msg.content);
//       }
//     };

//     schedule.scheduleJob(delayedTime.toJSDate(), async () => {
//       const prayer = prayersData[name] as any;
//       if (!prayer?.messages) return;
//       await sendMessages(prayer.messages);
//     });

//     if (withPreReminder) {
//       const pre = (prayersData[name] as any)?.pre;
//       if (pre?.messages?.length) {
//         const preTime = prayerTime.minus({ minutes: pre.minutesBefore || 30 });
//         if (preTime > now) {
//           schedule.scheduleJob(preTime.toJSDate(), async () => {
//             await sendMessages(pre.messages);
//           });
//         }
//       }
//     }
//   }

//   static async setupDailySchedules(bot: TelegramBot, chatId: number) {
//     const times = await this.getPrayerTimes();
//     for (const [name, time] of Object.entries(times)) {
//       this.schedulePrayer(bot, chatId, name as keyof Prayers, time, true);
//     }
//   }
// }
