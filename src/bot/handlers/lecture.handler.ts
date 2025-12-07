// src/bot/handlers/lecture.handler.ts
import TelegramBot, { Message, CallbackQuery } from "node-telegram-bot-api";
import { LecturesService } from "../../services/lectures.service.js";
import { AdminsService } from "../../services/admin.service.js";
import { waitingForYoutube, waitingForFile, WaitingForFileEntry } from "../state.js";

export function setupLectureHandler(bot: TelegramBot) {
    // Handle document uploads
    bot.on("message", async (msg: Message) => {
        const chatId = msg.chat.id;
        const userId = msg.from?.id;

        // Handle YouTube URL input
        const youtubeWaiting = waitingForYoutube[chatId];
        if (youtubeWaiting) {
            if (userId !== youtubeWaiting.requestedBy) {
                return bot.sendMessage(chatId, "❌ هذه العملية محفوظة للمشرف الذي بدأها فقط.");
            }

            const url = msg.text || "";
            waitingForYoutube[chatId] = undefined;

            LecturesService.updateYoutube(youtubeWaiting.branch, youtubeWaiting.className, youtubeWaiting.subject, youtubeWaiting.lecture_no, url);
            return bot.sendMessage(chatId, "✅ تم تحديث رابط اليوتيوب بنجاح.");
        }

        // Handle file upload workflow - text input steps
        const fileWaiting = waitingForFile[chatId];
        if (fileWaiting && msg.text) {
            if (userId !== fileWaiting.requestedBy) {
                return bot.sendMessage(chatId, "❌ هذه العملية محفوظة للمشرف الذي بدأها فقط.");
            }

            return handleFileWorkflowTextInput(bot, chatId, fileWaiting, msg.text);
        }

        // Handle new document upload
        if (msg.document) {
            if (!userId || !AdminsService.isAdmin(userId)) {
                return bot.sendMessage(chatId, "❌ ليس لديك صلاحية رفع الملفات.");
            }

            const file = msg.document;

            // Check if it's a PDF
            if (!file.file_name?.toLowerCase().endsWith('.pdf')) {
                return bot.sendMessage(chatId, "❌ يرجى رفع ملف PDF فقط.");
            }

            // Store file_id and ask for type
            waitingForFile[chatId] = {
                file_id: file.file_id,
                type: "type_subject_summary", // temporary, will be set by callback
                step: "awaiting_type",
                requestedBy: userId
            };

            const keyboard = {
                inline_keyboard: [
                    [{ text: "📘 ملخص مادة", callback_data: "type_subject_summary" }],
                    [{ text: "📝 أسئلة مادة", callback_data: "type_subject_questions" }],
                    [{ text: "📄 ملخص درس", callback_data: "type_lesson_summary" }],
                    [{ text: "📚 تفريغ درس", callback_data: "type_lesson_transcript" }],
                    [{ text: "❌ إلغاء", callback_data: "cancel_upload" }]
                ]
            };

            return bot.sendMessage(chatId, "✅ تم استلام الملف.\n\nالرجاء اختيار نوع الملف:", { reply_markup: keyboard });
        }
    });

    // Handle callback queries for file type selection and workflow
    bot.on("callback_query", async (query: CallbackQuery) => {
        const chatId = query.message?.chat.id;
        const userId = query.from.id;
        const data = query.data;

        if (!chatId || !data) return;

        // Answer callback to remove loading state
        await bot.answerCallbackQuery(query.id);

        const fileWaiting = waitingForFile[chatId];

        // Handle cancel
        if (data === "cancel_upload") {
            waitingForFile[chatId] = undefined;
            return bot.sendMessage(chatId, "❌ تم إلغاء عملية رفع الملف.");
        }

        // Handle file type selection
        if (data.startsWith("type_") && fileWaiting?.step === "awaiting_type") {
            if (userId !== fileWaiting.requestedBy) {
                return bot.sendMessage(chatId, "❌ هذه العملية محفوظة للمشرف الذي بدأها فقط.");
            }

            fileWaiting.type = data as WaitingForFileEntry["type"];
            fileWaiting.step = "awaiting_subject";

            return bot.sendMessage(chatId, "📝 الرجاء إدخال اسم المادة:");
        }
    });
}

/**
 * Handle text input for the file upload workflow
 */
async function handleFileWorkflowTextInput(
    bot: TelegramBot,
    chatId: number,
    fileWaiting: WaitingForFileEntry,
    text: string
) {
    const trimmedText = text.trim();

    if (!trimmedText) {
        return bot.sendMessage(chatId, "❌ الرجاء إدخال قيمة صحيحة.");
    }

    switch (fileWaiting.step) {
        case "awaiting_subject":
            fileWaiting.subject = trimmedText;
            fileWaiting.step = "awaiting_class";
            return bot.sendMessage(chatId, "📚 الرجاء إدخال المستوى (مثال: مستوى1، مستوى2، ...):");

        case "awaiting_class":
            // Validate class format
            if (!trimmedText.startsWith("مستوى")) {
                return bot.sendMessage(chatId, "❌ يجب أن يبدأ المستوى بكلمة 'مستوى' متبوعة بالرقم.\nمثال: مستوى1");
            }
            fileWaiting.className = trimmedText;

            // Check if we need lesson number
            if (fileWaiting.type === "type_lesson_summary" || fileWaiting.type === "type_lesson_transcript") {
                fileWaiting.step = "awaiting_lesson_no";
                return bot.sendMessage(chatId, "🔢 الرجاء إدخال رقم الدرس:");
            } else {
                fileWaiting.step = "awaiting_branch";
                return bot.sendMessage(chatId, "🏢 الرجاء إدخال الفرع (رجال أو نساء):");
            }

        case "awaiting_lesson_no":
            const lessonNo = parseInt(trimmedText);
            if (isNaN(lessonNo) || lessonNo < 1) {
                return bot.sendMessage(chatId, "❌ الرجاء إدخال رقم درس صحيح (رقم موجب).");
            }
            fileWaiting.lecture_no = lessonNo;
            fileWaiting.step = "awaiting_branch";
            return bot.sendMessage(chatId, "🏢 الرجاء إدخال الفرع (رجال أو نساء):");

        case "awaiting_branch":
            // Validate branch
            if (trimmedText !== "رجال" && trimmedText !== "نساء") {
                return bot.sendMessage(chatId, "❌ الفرع يجب أن يكون 'رجال' أو 'نساء' فقط.");
            }
            fileWaiting.branch = trimmedText;

            // All data collected, now save the file
            return finalizeFileUpload(bot, chatId, fileWaiting);

        default:
            return bot.sendMessage(chatId, "❌ حدث خطأ في العملية. الرجاء المحاولة مرة أخرى.");
    }
}

/**
 * Finalize the file upload by calling the appropriate service method
 */
async function finalizeFileUpload(
    bot: TelegramBot,
    chatId: number,
    fileWaiting: WaitingForFileEntry
) {
    const { file_id, type, subject, className, lecture_no, branch } = fileWaiting;

    // Validate all required fields are present
    if (!subject || !className || !branch) {
        waitingForFile[chatId] = undefined;
        return bot.sendMessage(chatId, "❌ حدث خطأ: بيانات غير مكتملة.");
    }

    try {
        switch (type) {
            case "type_subject_summary":
                LecturesService.updateSubjectSummary(branch, className, subject, file_id);
                waitingForFile[chatId] = undefined;
                return bot.sendMessage(chatId, `✅ تم حفظ ملخص المادة بنجاح!\n\n📘 المادة: ${subject}\n📚 المستوى: ${className}\n🏢 الفرع: ${branch}`);

            case "type_subject_questions":
                LecturesService.updateSubjectQuestions(branch, className, subject, file_id);
                waitingForFile[chatId] = undefined;
                return bot.sendMessage(chatId, `✅ تم حفظ أسئلة المادة بنجاح!\n\n📝 المادة: ${subject}\n📚 المستوى: ${className}\n🏢 الفرع: ${branch}`);

            case "type_lesson_summary":
                if (!lecture_no) {
                    waitingForFile[chatId] = undefined;
                    return bot.sendMessage(chatId, "❌ حدث خطأ: رقم الدرس مفقود.");
                }
                LecturesService.updateSummary(branch, className, subject, lecture_no, file_id);
                waitingForFile[chatId] = undefined;
                return bot.sendMessage(chatId, `✅ تم حفظ ملخص الدرس بنجاح!\n\n📄 المادة: ${subject}\n🔢 الدرس: ${lecture_no}\n📚 المستوى: ${className}\n🏢 الفرع: ${branch}`);

            case "type_lesson_transcript":
                if (!lecture_no) {
                    waitingForFile[chatId] = undefined;
                    return bot.sendMessage(chatId, "❌ حدث خطأ: رقم الدرس مفقود.");
                }
                LecturesService.addOrUpdateLecture(branch, className, subject, {
                    lecture_no,
                    title: subject,
                    transcript_file_id: file_id,
                    summary_file_id: "",
                    youtube_url: "",
                });
                waitingForFile[chatId] = undefined;
                return bot.sendMessage(chatId, `✅ تم حفظ تفريغ الدرس بنجاح!\n\n📚 المادة: ${subject}\n🔢 الدرس: ${lecture_no}\n📚 المستوى: ${className}\n🏢 الفرع: ${branch}`);

            default:
                waitingForFile[chatId] = undefined;
                return bot.sendMessage(chatId, "❌ نوع الملف غير معروف.");
        }
    } catch (error) {
        console.error("Error saving file:", error);
        waitingForFile[chatId] = undefined;
        return bot.sendMessage(chatId, "❌ حدث خطأ أثناء حفظ الملف. الرجاء المحاولة مرة أخرى.");
    }
}