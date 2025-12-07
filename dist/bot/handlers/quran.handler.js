import { QuranService } from "../../services/quran.service.js";
export function setupQuranHandler(bot) {
    bot.onText(/\/getaya/, async (msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, "📖 يتم جلب آية عشوائية ...");
        try {
            await QuranService.sendAya(bot, chatId);
        }
        catch (error) {
            console.error(error);
            await bot.sendMessage(chatId, "حدث خطأ أثناء جلب الآية.");
        }
    });
}
