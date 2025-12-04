import TelegramBot from "node-telegram-bot-api";
import { LecturesService } from "../../services/lectures.service.js";
import { makeKeyboard } from "../../utils/messages.js";

export function setupStartHandler(bot: TelegramBot) {
    bot.setMyCommands([{ command: "/start", description: "ابدأ" }]);

    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const branches = LecturesService.getBranches();

        if (!branches.length) {
            return bot.sendMessage(chatId, "لا يوجد فروع مسجلة حالياً.");
        }

        const buttons = branches.map((b) => [{ text: b, callback_data: `branch|${b}` }]);
        return bot.sendMessage(chatId, "اختر الفرع:", {
            reply_markup: makeKeyboard(buttons),
        });
    });
}