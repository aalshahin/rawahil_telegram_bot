import TelegramBot from "node-telegram-bot-api";
import { setupStartHandler } from "./handlers/start.handler.js";
import { setupNavigationHandler } from "./handlers/navigation.handler.js";
import { setupLectureHandler } from "./handlers/lecture.handler.js";
import { setupAdminHandler } from "./handlers/admin.handler.js";
import { setupHadithHandler } from "./handlers/hadith.handler.js";
import { setupQuranHandler } from "./handlers/quran.handler.js";
import { setupPrayersHandler } from "./handlers/prayers.handler.js";
export function createBot(token) {
    const bot = new TelegramBot(token, { polling: true });
    bot.setMyCommands([
        { command: "/start", description: "ابدأ" },
        { command: "/gethadith", description: "احصل على حديث شريف" },
        { command: "/getaya", description: "احصل على آية قرآنية" },
        { command: "/getsalahtimes", description: "مواقيت الصلاة لليوم" },
    ]);
    setupStartHandler(bot);
    setupNavigationHandler(bot);
    setupLectureHandler(bot);
    setupAdminHandler(bot);
    setupHadithHandler(bot);
    setupQuranHandler(bot);
    setupPrayersHandler(bot);
    return bot;
}
