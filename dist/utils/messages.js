export async function safeEditMessage(bot, chatId, messageId, text, keyboard) {
    try {
        return await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: keyboard,
            parse_mode: "HTML",
        });
    }
    catch (err) {
        const desc = err?.response?.body?.description;
        if (typeof desc === "string" && desc.includes("message is not modified")) {
            return null;
        }
        console.error("safeEditMessage error:", err?.response?.body ?? err);
        return null;
    }
}
export function makeKeyboard(buttons) {
    return { inline_keyboard: buttons };
}
