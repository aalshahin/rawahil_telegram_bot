import { LecturesService } from "../../services/lectures.service.js";
import { AdminsService } from "../../services/admin.service.js";
import { waitingForYoutube } from "../state.js";
import { waitingForPlaylist } from "../state.js";

export function setupLectureHandler(bot) {
    bot.on("message", async (msg) => {
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
        const playlistWaiting = waitingForPlaylist[chatId];
        if (playlistWaiting) {
            const senderId = msg.from?.id;
            if (senderId !== playlistWaiting.requestedBy) {
                return bot.sendMessage(chatId, "❌ هذه العملية محفوظة للمشرف الذي بدأها فقط.");
            }

            const url = msg.text?.trim() || "";
            waitingForPlaylist[chatId] = undefined;

            LecturesService.updatePlaylist(
                playlistWaiting.branch,
                playlistWaiting.className,
                playlistWaiting.subject,
                url
            );

            return bot.sendMessage(chatId, "✅ تم تحديث رابط الـ Playlist بنجاح.");
        }
        if (msg.document) {
            const userId = msg.from?.id;
            if (!userId || !AdminsService.isAdmin(userId)) {
                return bot.sendMessage(chatId, "❌ ليس لديك صلاحية رفع الملفات.");
            }
            const file = msg.document;
            const name = file.file_name || "";
            // Pattern 1: Subject summary - ملخص_مادة_<subject>_المستوى<no>_<branch>.pdf
            const subjectSummaryMatch = name.match(/ملخص_مادة_(.+)_المستوى(\d+)_([^\s]+)\.pdf/);
            if (subjectSummaryMatch) {
                const subject = subjectSummaryMatch[1];
                const className = `مستوى${subjectSummaryMatch[2]}`;
                const branch = subjectSummaryMatch[3];
                LecturesService.updateSubjectSummary(branch, className, subject, file.file_id);
                return bot.sendMessage(chatId, `📘 تم حفظ ملخص المادة - ${subject} في ${className} (${branch})`);
            }
            // Pattern 2: Subject questions - اسئلة_مادة_<subject>_المستوى<no>_<branch>.pdf
            const subjectQuestionsMatch = name.match(/اسئلة_مادة_(.+)_المستوى(\d+)_([^\s]+)\.pdf/);
            if (subjectQuestionsMatch) {
                const subject = subjectQuestionsMatch[1];
                const className = `مستوى${subjectQuestionsMatch[2]}`;
                const branch = subjectQuestionsMatch[3];
                LecturesService.updateSubjectQuestions(branch, className, subject, file.file_id);
                return bot.sendMessage(chatId, `📝 تم حفظ أسئلة المادة - ${subject} في ${className} (${branch})`);
            }
            // Pattern 3: Lesson summary - ملخص_<subject>_الدرس<no>_المستوى<no>_<branch>.pdf
            const lessonSummaryMatch = name.match(/ملخص_(.+)_الدرس(\d+)_المستوى(\d+)_([^\s]+)\.pdf/);
            if (lessonSummaryMatch) {
                const subject = lessonSummaryMatch[1];
                const lecture_no = Number(lessonSummaryMatch[2]);
                const className = `مستوى${lessonSummaryMatch[3]}`;
                const branch = lessonSummaryMatch[4];
                LecturesService.updateSummary(branch, className, subject, lecture_no, file.file_id);
                return bot.sendMessage(chatId, `📘 تم حفظ ملخص الدرس ${lecture_no} - مادة ${subject} في ${className} (${branch})`);
            }
            // Pattern 4: Lesson transcript - <subject>_الدرس<no>_المستوى<no>_<branch>.pdf
            const lessonTranscriptMatch = name.match(/(.+)_الدرس(\d+)_المستوى(\d+)_([^\s]+)\.pdf/);
            if (lessonTranscriptMatch) {
                const subject = lessonTranscriptMatch[1];
                const lecture_no = Number(lessonTranscriptMatch[2]);
                const className = `مستوى${lessonTranscriptMatch[3]}`;
                const branch = lessonTranscriptMatch[4];
                LecturesService.addOrUpdateLecture(branch, className, subject, {
                    lecture_no,
                    title: subject,
                    transcript_file_id: file.file_id,
                    summary_file_id: "",
                    youtube_url: "",
                });
                return bot.sendMessage(chatId, `✅ تم حفظ الدرس ${lecture_no} لمادة ${subject} في ${className} (${branch}).`);
            }
            // No pattern matched
            return bot.sendMessage(chatId, "❌ صيغة اسم الملف غير صحيحة.\n\n" +
                "الصيغ الصحيحة:\n" +
                "• ملخص المادة: ملخص_مادة_اسم_المادة_المستوى1_رجال.pdf\n" +
                "• أسئلة المادة: اسئلة_مادة_اسم_المادة_المستوى1_رجال.pdf\n" +
                "• تفريغ الدرس: اسم_المادة_الدرس1_المستوى1_رجال.pdf\n" +
                "• ملخص الدرس: ملخص_اسم_المادة_الدرس1_المستوى1_رجال.pdf");
        }
    });
}
