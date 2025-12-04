import TelegramBot from "node-telegram-bot-api";
import { AdminsService } from "../../services/admin.service.js";

export function setupAdminHandler(bot: TelegramBot) {
    bot.onText(/\/admins/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from?.id;

        if (!userId || !AdminsService.isAdmin(userId)) {
            return bot.sendMessage(chatId, "❌ ليس لديك صلاحية الوصول لأوامر الإدارة.");
        }

        const admins = AdminsService.getAll();
        return bot.sendMessage(chatId, `قائمة المشرفين: \n${admins.join("\n")}`);
    });
}