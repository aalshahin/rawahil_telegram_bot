import axios from "axios";
import TelegramBot from "node-telegram-bot-api";
import { HADITH_API_KEY } from "../config.js";

export class HadithService {
  static TELEGRAM_MESSAGE_LIMIT = 4000;

  static async fetchHadith(): Promise<{
    heading: string;
    text: string;
    book: string;
  } | null> {
    try {
      const url = `https://hadithapi.com/api/hadiths/?apiKey=${HADITH_API_KEY}`;
      const res = await axios.get(url);

      const hadiths = res.data?.hadiths?.data;
      if (!hadiths || hadiths.length === 0) return null;

      const randomHadith = this.getRandomHadith(hadiths);

      return {
        heading: randomHadith.headingArabic || "",
        text: randomHadith.hadithArabic || "",
        book: randomHadith.book?.bookName || "",
      };
    } catch (err) {
      console.error("Error fetching hadith:", err);
      return null;
    }
  }

  static getRandomHadith(hadiths: any[]): any {
    return hadiths[Math.floor(Math.random() * hadiths.length)];
  }

  static formatHadith(heading: string, text: string, book: string): string {
    return `<b>${heading}</b>\n${text}\n<i>${book}</i>`;
  }

  static async sendHadith(bot: TelegramBot, chatId: number) {
    const hadith = await this.fetchHadith();

    if (!hadith) {
      await bot.sendMessage(chatId, "تعذّر جلب حديث حالياً.");
      return;
    }

    const message = this.formatHadith(hadith.heading, hadith.text, hadith.book);

    for (let i = 0; i < message.length; i += this.TELEGRAM_MESSAGE_LIMIT) {
      const chunk = message.substring(i, i + this.TELEGRAM_MESSAGE_LIMIT);
      await bot.sendMessage(chatId, chunk, { parse_mode: "HTML" });
    }
  }
}