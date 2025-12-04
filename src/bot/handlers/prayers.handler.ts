import TelegramBot from "node-telegram-bot-api";
import { PrayersService } from "../../services/prayers.service.js";

export function setupPrayersHandler(bot: TelegramBot) {
    bot.onText(/\/getsalahtimes/, async (msg) => {
        const chatId = msg.chat.id;

        await bot.sendMessage(chatId, "🕌 جاري جلب مواقيت الصلاة لليوم ...");

        try {
            await PrayersService.sendPrayerTimes(bot, chatId);
        } catch (error) {
            console.error(error);
            await bot.sendMessage(chatId, "حدث خطأ أثناء جلب مواقيت الصلاة.");
        }
    });
}