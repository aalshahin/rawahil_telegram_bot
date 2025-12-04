import axios from "axios";
import TelegramBot from "node-telegram-bot-api";

export class QuranService {
    static TELEGRAM_MESSAGE_LIMIT = 4000;

    static getRandomAyaNumber(): number {
        return Math.floor(Math.random() * 6236) + 1;
    }

    static async fetchAya(): Promise<{ text: string; surah: string } | null> {
        try {
            const ayaNumber = this.getRandomAyaNumber();
            const url = `http://api.alquran.cloud/v1/ayah/${ayaNumber}/ar`;

            const res = await axios.get(url);
            const data = res.data?.data;

            if (!data) return null;

            return {
                text: data.text,
                surah: data.surah?.name || "",
            };
        } catch (err) {
            console.error("Error fetching aya:", err);
            return null;
        }
    }

    static formatAya(text: string, surah: string): string {
        return `${text}\n<b>${surah}</b>`;
    }

    static async sendAya(bot: TelegramBot, chatId: number) {
        const aya = await this.fetchAya();

        if (!aya) {
            await bot.sendMessage(chatId, "تعذّر جلب آية.");
            return;
        }

        const message = this.formatAya(aya.text, aya.surah);

        for (let i = 0; i < message.length; i += this.TELEGRAM_MESSAGE_LIMIT) {
            const chunk = message.substring(i, i + this.TELEGRAM_MESSAGE_LIMIT);
            await bot.sendMessage(chatId, chunk, { parse_mode: "HTML" });
        }
    }
}