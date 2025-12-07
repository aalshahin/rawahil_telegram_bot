import { HadithService } from "../../services/hadith.service.js";
export function setupHadithHandler(bot) {
    bot.onText(/\/gethadith/, async (msg) => {
        const chatId = msg.chat.id;
        await bot.sendMessage(chatId, "📜 يتم جلب حديث شريف ...");
        try {
            await HadithService.sendHadith(bot, chatId);
        }
        catch (error) {
            console.error(error);
            await bot.sendMessage(chatId, "حدث خطأ أثناء جلب الحديث.");
        }
    });
}
