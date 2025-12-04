import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";
import { LecturesService } from "../../services/lectures.service.js";
import { AdminsService } from "../../services/admin.service.js";
import { safeEditMessage, makeKeyboard } from "../../utils/messages.js";
import { waitingForYoutube } from "../state.js";

export function setupNavigationHandler(bot: TelegramBot) {
    bot.on("callback_query", async (query: CallbackQuery) => {
        const chatId = query.message?.chat.id;
        const msgId = query.message?.message_id;
        const from = query.from;
        const data = query.data;
        if (!chatId || !msgId || !data) return;

        const parts = data.split("|");
        const action = parts[0];

        await bot.answerCallbackQuery(query.id).catch(() => null);

        if (action === "branch") {
            const branch = parts[1];
            const classes = LecturesService.getClasses(branch);
            const buttons = classes.map((c) => [{ text: c, callback_data: `class|${branch}|${c}` }]);
            return safeEditMessage(bot, chatId, msgId, `اختر المستوى في ${branch}:`, makeKeyboard(buttons));
        }

        if (action === "class") {
            const branch = parts[1];
            const className = parts[2];
            const subjects = LecturesService.getSubjects(branch, className);
            const buttons = subjects.map((s) => [{ text: s, callback_data: `subject|${branch}|${className}|${s}` }]);
            return safeEditMessage(bot, chatId, msgId, `اختر المادة في ${className}:`, makeKeyboard(buttons));
        }

        if (action === "subject") {
            const branch = parts[1];
            const className = parts[2];
            const subject = parts[3];
            const lectures = LecturesService.getLectures(branch, className, subject);
            const buttons = lectures.map((l: any) => [
                { text: `الدرس ${l.lecture_no}`, callback_data: `lecture|${branch}|${className}|${subject}|${l.lecture_no}` },
            ]);
            return safeEditMessage(bot, chatId, msgId, `اختر الدرس في ${subject}:`, makeKeyboard(buttons));
        }

        if (action === "lecture") {
            const branch = parts[1];
            const className = parts[2];
            const subject = parts[3];
            const lectureNo = Number(parts[4]);

            const lecture = LecturesService.getLecture(branch, className, subject, lectureNo);
            if (!lecture) {
                return bot.sendMessage(chatId, "الدرس غير موجود.");
            }

            try {
                if (lecture.transcript_file_id) {
                    await bot.sendDocument(chatId, lecture.transcript_file_id, { caption: `تفريغ - ${subject}` });
                }
                if (lecture.summary_file_id) {
                    await bot.sendDocument(chatId, lecture.summary_file_id, { caption: `ملخص - ${subject}` });
                }
                if (lecture.youtube_url) {
                    await bot.sendMessage(chatId, `رابط اليوتيوب:\n${lecture.youtube_url}`);
                }
            } catch (err) {
                console.error("Error sending lecture assets:", err);
            }

            if (AdminsService.isAdmin(from.id)) {
                const keyboard = makeKeyboard([
                    [{ text: "تعديل رابط اليوتيوب", callback_data: `yt|${branch}|${className}|${subject}|${lectureNo}` }],
                ]);
                return bot.sendMessage(chatId, "هل تريد تعديل رابط اليوتيوب؟", { reply_markup: keyboard });
            }
            return;
        }

        if (action === "yt") {
            const branch = parts[1];
            const className = parts[2];
            const subject = parts[3];
            const lectureNo = Number(parts[4]);

            if (!AdminsService.isAdmin(from.id)) {
                return bot.sendMessage(chatId, "❌ ليس لديك صلاحية تعديل الرابط.");
            }

            waitingForYoutube[chatId] = {
                branch,
                className,
                subject,
                lecture_no: lectureNo,
                requestedBy: from.id,
            };

            return bot.sendMessage(chatId, "أرسل رابط اليوتيوب الجديد الآن:");
        }
    });
}