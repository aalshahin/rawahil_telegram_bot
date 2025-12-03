import TelegramBot, { CallbackQuery, Message } from "node-telegram-bot-api";
import { LecturesService } from "./services/lectures.service.js";
import { AdminsService } from "./services/admin.service.js";

console.log("Environment variables available:", Object.keys(process.env));
console.log("BOT_TOKEN exists?", !!process.env.BOT_TOKEN);
console.log("BOT_TOKEN length:", process.env.BOT_TOKEN?.length);

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ BOT_TOKEN is missing!");
  console.error("Available env vars:", Object.keys(process.env));
  throw new Error("there are no token!");
}

const bot = new TelegramBot(TOKEN, { polling: true });

bot.setMyCommands([{ command: "/start", description: "ابدأ" }]);

const waitingForYoutube: Record<number, { branch: string; className: string; subject: string; lecture_no: number }> = {};

async function safeEditMessage(bot: TelegramBot, chatId: number, messageId: number, text: string, keyboard?: TelegramBot.InlineKeyboardMarkup) {
  try {
    return await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard,
    });
  } catch (err: any) {
    if (err.response?.body?.description?.includes("message is not modified")) return null;
    console.error("Edit error:", err);
  }
}

bot.onText(/\/start/, (msg: Message) => {
  const chatId = msg.chat.id;
  const branches = LecturesService.getBranches();
  const buttons = branches.map((b) => [{ text: b, callback_data: `branch|${b}` }]);
  bot.sendMessage(chatId, "اختر الفرع:", { reply_markup: { inline_keyboard: buttons } });
});

bot.on("callback_query", async (query: CallbackQuery) => {
  const chatId = query.message?.chat.id;
  const msgId = query.message?.message_id;
  if (!chatId || !msgId || !query.data) return;

  const [action, branch, className, subject, lectureNo] = query.data.split("|");

  await bot.answerCallbackQuery(query.id);

  if (action === "branch") {
    const classes = LecturesService.getClasses(branch);
    const buttons = classes.map((c) => [{ text: c, callback_data: `class|${branch}|${c}` }]);
    return safeEditMessage(bot, chatId, msgId, `اختر المستوى في ${branch}:`, { inline_keyboard: buttons });
  }

  if (action === "class") {
    const subjects = LecturesService.getSubjects(branch, className);
    const buttons = subjects.map((s) => [{ text: s, callback_data: `subject|${branch}|${className}|${s}` }]);
    return safeEditMessage(bot, chatId, msgId, `اختر المادة في ${className}:`, { inline_keyboard: buttons });
  }

  if (action === "subject") {
    const lectures = LecturesService.getLectures(branch, className, subject);
    const buttons = lectures.map((l) => [{ text: `الدرس ${l.lecture_no}`, callback_data: `lecture|${branch}|${className}|${subject}|${l.lecture_no}` }]);
    return safeEditMessage(bot, chatId, msgId, `اختر الدرس في ${subject}:`, { inline_keyboard: buttons });
  }

  if (action === "lecture") {
    const lecture = LecturesService.getLecture(branch, className, subject, Number(lectureNo));
    if (!lecture) return bot.sendMessage(chatId, "الدرس غير موجود.");

    if (lecture.transcript_file_id) await bot.sendDocument(chatId, lecture.transcript_file_id, { caption: `تفريغ - ${subject}` });
    if (lecture.summary_file_id) await bot.sendDocument(chatId, lecture.summary_file_id, { caption: `ملخص - ${subject}` });
    if (lecture.youtube_url) await bot.sendMessage(chatId, lecture.youtube_url);

    if (AdminsService.isAdmin(query.from.id)) {
      await bot.sendMessage(chatId, "هل تريد تعديل رابط اليوتيوب؟", {
        reply_markup: { inline_keyboard: [[{ text: "نعم", callback_data: `yt|${branch}|${className}|${subject}|${lectureNo}` }]] },
      });
    }
  }

  if (action === "yt") {
    if (!AdminsService.isAdmin(query.from.id)) return bot.sendMessage(chatId, "❌ ليس لديك صلاحية تعديل الرابط.");
    waitingForYoutube[chatId] = { branch, className, subject, lecture_no: Number(lectureNo) };
    bot.sendMessage(chatId, "أرسل رابط اليوتيوب الجديد الآن:");
  }
});

bot.on("message", async (msg: Message) => {
  const chatId = msg.chat.id;

  if (waitingForYoutube[chatId]) {
    const info = waitingForYoutube[chatId];
    delete waitingForYoutube[chatId];
    LecturesService.updateYoutube(info.branch, info.className, info.subject, info.lecture_no, msg.text || "");
    return bot.sendMessage(chatId, "✅ تم تحديث رابط اليوتيوب بنجاح.");
  }

  if (msg.document) {
    const userId = msg.from?.id;
    if (!AdminsService.isAdmin(userId!)) return bot.sendMessage(chatId, "❌ ليس لديك صلاحية رفع الملفات.");

    const file = msg.document;

    const summaryMatch = file.file_name?.match(/ملخص_(.+)_الدرس(\d+)_المستوى(\d+)_([^\s]+)\.pdf/);
    if (summaryMatch) {
      const subject = summaryMatch[1];
      const lecture_no = Number(summaryMatch[2]);
      const className = `مستوى${summaryMatch[3]}`;
      const branch = summaryMatch[4];
      LecturesService.updateSummary(branch, className, subject, lecture_no, file.file_id);
      return bot.sendMessage(chatId, `📘 تم حفظ **ملخص الدرس ${lecture_no} - مادة ${subject}** في ${className} (${branch}) بنجاح.`);
    }

    const match = file.file_name?.match(/(.+)_الدرس(\d+)_المستوى(\d+)_([^\s]+)\.pdf/);
    if (!match) return bot.sendMessage(chatId, "صيغة اسم الملف غير صحيحة.\nمثال: برمجة_الدرس3_المستوى2_علمي.pdf");

    const subject = match[1];
    const lecture_no = Number(match[2]);
    const className = `مستوى${match[3]}`;
    const branch = match[4];

    LecturesService.addLecture(branch, className, subject, {
      lecture_no,
      title: subject,
      transcript_file_id: file.file_id,
      summary_file_id: "",
      youtube_url: "",
    });

    return bot.sendMessage(chatId, `✅ تم حفظ الدرس ${lecture_no} لمادة ${subject} في ${className} (${branch}).`);
  }
});

console.log("BOT IS WORKING... 🤖");
