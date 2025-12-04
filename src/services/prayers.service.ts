import axios from "axios";
import TelegramBot from "node-telegram-bot-api";

const LAT = 36.2021;
const LON = 37.1343;
const PRAYER_METHOD = 3;

export class PrayersService {
    static async fetchPrayerTimes(): Promise<Record<string, string> | null> {
        try {
            const url = `https://api.aladhan.com/v1/timings?latitude=${LAT}&longitude=${LON}&method=${PRAYER_METHOD}`;
            const res = await axios.get(url);

            return res.data?.data?.timings || null;
        } catch (err) {
            console.error("Error fetching prayer times:", err);
            return null;
        }
    }

    static formatPrayerTimes(times: Record<string, string>): string {
        return `
                <b>🕌 مواقيت الصلاة لليوم:</b>

                • الفجر: <b>${times.Fajr}</b>
                • الشروق: <b>${times.Sunrise}</b>
                • الظهر: <b>${times.Dhuhr}</b>
                • العصر: <b>${times.Asr}</b>
                • المغرب: <b>${times.Maghrib}</b>
                • العشاء: <b>${times.Isha}</b>
                `.trim();
    }

    static async sendPrayerTimes(bot: TelegramBot, chatId: number) {
        const times = await this.fetchPrayerTimes();

        if (!times) {
            await bot.sendMessage(chatId, "تعذّر جلب مواقيت الصلاة حالياً.");
            return;
        }

        const msg = this.formatPrayerTimes(times);

        await bot.sendMessage(chatId, msg, { parse_mode: "HTML" });
    }
}