import TelegramBot from "node-telegram-bot-api";

export async function safeEditMessage(
    bot: TelegramBot,
    chatId: number,
    messageId: number,
    text: string,
    keyboard?: TelegramBot.InlineKeyboardMarkup
) {
    try {
        return await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: keyboard,
            parse_mode: "HTML",
        });
    } catch (err: any) {
        const desc = err?.response?.body?.description;
        if (typeof desc === "string" && desc.includes("message is not modified")) {
            return null;
        }
        console.error("safeEditMessage error:", err?.response?.body ?? err);
        return null;
    }
}

export function makeKeyboard(buttons: { text: string; callback_data: string }[][]) {
    return { inline_keyboard: buttons };
}