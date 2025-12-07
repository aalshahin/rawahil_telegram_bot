import { LecturesService } from "../../services/lectures.service.js";
import { AdminsService } from "../../services/admin.service.js";
import { safeEditMessage, makeKeyboard } from "../../utils/messages.js";
import { waitingForYoutube } from "../state.js";
export function setupNavigationHandler(bot) {
    bot.on("callback_query", async (query) => {
        const chatId = query.message?.chat.id;
        const msgId = query.message?.message_id;
        const from = query.from;
        const data = query.data;
        if (!chatId || !msgId || !data)
            return;
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
            // Get subject data
            const subjectData = LecturesService.getSubjectData(branch, className, subject);
            const lectures = subjectData?.lectures || [];
            const buttons = [];
            // Add subject-level buttons if data exists
            if (subjectData?.subject_summary_file_id) {
                buttons.push([{ text: "📘 ملخص المادة", callback_data: `sub_summary|${branch}|${className}|${subject}` }]);
            }
            if (subjectData?.subject_questions_file_id) {
                buttons.push([{ text: "📝 أسئلة المادة", callback_data: `sub_questions|${branch}|${className}|${subject}` }]);
            }
            if (subjectData?.playlist_url) {
                buttons.push([{ text: "▶️ Playlist", callback_data: `playlist|${branch}|${className}|${subject}` }]);
            }
            // Add lecture buttons
            lectures.forEach((l) => {
                buttons.push([{ text: `الدرس ${l.lecture_no}`, callback_data: `lecture|${branch}|${className}|${subject}|${l.lecture_no}` }]);
            });
            return safeEditMessage(bot, chatId, msgId, `اختر من ${subject}:`, makeKeyboard(buttons));
        }
        if (action === "sub_summary") {
            const branch = parts[1];
            const className = parts[2];
            const subject = parts[3];
            const fileId = LecturesService.getSubjectSummary(branch, className, subject);
            if (!fileId) {
                return bot.sendMessage(chatId, "❌ ملخص المادة غير متوفر.");
            }
            try {
                await bot.sendDocument(chatId, fileId, { caption: `📘 ملخص المادة - ${subject}` });
            }
            catch (err) {
                console.error("Error sending subject summary:", err);
                return bot.sendMessage(chatId, "❌ حدث خطأ أثناء إرسال ملخص المادة.");
            }
            return;
        }
        if (action === "sub_questions") {
            const branch = parts[1];
            const className = parts[2];
            const subject = parts[3];
            const fileId = LecturesService.getSubjectQuestions(branch, className, subject);
            if (!fileId) {
                return bot.sendMessage(chatId, "❌ أسئلة المادة غير متوفرة.");
            }
            try {
                await bot.sendDocument(chatId, fileId, { caption: `📝 أسئلة المادة - ${subject}` });
            }
            catch (err) {
                console.error("Error sending subject questions:", err);
                return bot.sendMessage(chatId, "❌ حدث خطأ أثناء إرسال أسئلة المادة.");
            }
            return;
        }
        if (action === "playlist") {
            const branch = parts[1];
            const className = parts[2];
            const subject = parts[3];
            const playlistUrl = LecturesService.getPlaylistUrl(branch, className, subject);
            if (!playlistUrl) {
                return bot.sendMessage(chatId, "❌ رابط البلايليست غير متوفر.");
            }
            return bot.sendMessage(chatId, `▶️ رابط البلايليست - ${subject}:\n${playlistUrl}`);
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
            }
            catch (err) {
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
