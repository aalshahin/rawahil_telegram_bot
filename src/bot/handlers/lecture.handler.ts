// src/bot/handlers/lecture.handler.ts
import TelegramBot, { Message } from "node-telegram-bot-api";
import { LecturesService } from "../../services/lectures.service.js";
import { AdminsService } from "../../services/admin.service.js";
import { waitingForYoutube } from "../state.js";

export function setupLectureHandler(bot: TelegramBot) {
    bot.on("message", async (msg: Message) => {
        const chatId = msg.chat.id;

        const waiting = waitingForYoutube[chatId];
        if (waiting) {
            const senderId = msg.from?.id;
            if (senderId !== waiting.requestedBy) {
                return bot.sendMessage(chatId, "❌ هذه العملية محفوظة للمشرف الذي بدأها فقط.");
            }

            const url = msg.text || "";
            waitingForYoutube[chatId] = undefined;

            LecturesService.updateYoutube(waiting.branch, waiting.className, waiting.subject, waiting.lecture_no, url);
            return bot.sendMessage(chatId, "✅ تم تحديث رابط اليوتيوب بنجاح.");
        }

        if (msg.document) {
            const userId = msg.from?.id;
            if (!userId || !AdminsService.isAdmin(userId)) {
                return bot.sendMessage(chatId, "❌ ليس لديك صلاحية رفع الملفات.");
            }

            const file = msg.document;
            const name = file.file_name || "";

            const summaryMatch = name.match(/ملخص_(.+)_الدرس(\d+)_المستوى(\d+)_([^\s]+)\.pdf/);
            if (summaryMatch) {
                const subject = summaryMatch[1];
                const lecture_no = Number(summaryMatch[2]);
                const className = `مستوى${summaryMatch[3]}`;
                const branch = summaryMatch[4];

                LecturesService.updateSummary(branch, className, subject, lecture_no, file.file_id);
                return bot.sendMessage(chatId, `📘 تم حفظ ملخص الدرس ${lecture_no} - مادة ${subject} في ${className} (${branch})`);
            }

            const match = name.match(/(.+)_الدرس(\d+)_المستوى(\d+)_([^\s]+)\.pdf/);
            if (!match) {
                return bot.sendMessage(
                    chatId,
                    "صيغة اسم الملف غير صحيحة.\nمثال صحيح: برمجة_الدرس3_المستوى2_علمي.pdf\nأو للملخص: ملخص_برمجة_الدرس3_المستوى2_علمي.pdf"
                );
            }

            const subject = match[1];
            const lecture_no = Number(match[2]);
            const className = `مستوى${match[3]}`;
            const branch = match[4];

            LecturesService.addOrUpdateLecture(branch, className, subject, {
                lecture_no,
                title: subject,
                transcript_file_id: file.file_id,
                summary_file_id: "",
                youtube_url: "",
            });

            return bot.sendMessage(chatId, `✅ تم حفظ الدرس ${lecture_no} لمادة ${subject} في ${className} (${branch}).`);
        }
    });
}