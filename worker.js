/**
 * Ayah Quest (آية) - Telegram Bot Webhook Handler (Cloudflare Worker)
 * 
 * Environment Variables required in Cloudflare Worker:
 * - BOT_TOKEN: Your Telegram bot token from @BotFather
 * - APP_URL: Your deployed Cloudflare Pages URL (e.g., https://ayah-quest.pages.dev)
 */

export default {
  async fetch(request, env) {
    // Only accept POST requests from Telegram Webhooks
    if (request.method !== "POST") {
      return new Response("Ayah Quest Telegram Bot Worker is running.", { status: 200 });
    }

    try {
      const update = await request.json();
      if (!update.message || !update.message.text) {
        return new Response("OK", { status: 200 });
      }

      const chatId = update.message.chat.id;
      const text = update.message.text.trim();
      const botToken = env.BOT_TOKEN;
      const appUrl = env.APP_URL || "https://ayah-quest.pages.dev";

      if (!botToken) {
        return new Response("BOT_TOKEN is not configured", { status: 500 });
      }

      let replyText = "";
      let replyMarkup = {
        inline_keyboard: [
          [{ text: "📖 Open Ayah Quest | آية", web_app: { url: appUrl } }]
        ]
      };

      if (text.startsWith("/start")) {
        replyText =
          "🌙 *بسم الله الرحمن الرحيم*\n\n" +
          "السلام عليكم ورحمة الله وبركاته\n\n" +
          "Welcome to *Ayah Quest (آية)* — your distraction-free Quran memorization and SRS review companion.\n\n" +
          "✨ *Key Features:*\n" +
          "• 🔁 *Ayah Loops:* Set 3x, 5x, or 10x audio repetitions\n" +
          "• 🎙 *Verified Reciters:* Listen to Sheikh جابر القيطان, Mishary Alafasy, Ali Jaber, and more\n" +
          "• 🧠 *Active Recall:* Test your retention by hiding words and testing memory\n" +
          "• 🔥 *Daily Streaks:* Build a consistent Quran habit for the sake of Allah\n" +
          "• 100% Free with no subscriptions or ads\n\n" +
          "Tap below to open your Quran companion:";
      } else if (text.startsWith("/daily")) {
        replyText =
          "💫 *Daily Quran Reflection & Hadith*\n\n" +
          "«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»\n" +
          "_\"The best among you are those who learn the Quran and teach it.\"_\n" +
          "— *Sahih Al-Bukhari 5027*\n\n" +
          "💡 *Actionable reminder:* Even reviewing a single Ayah today places you among the best in the sight of Allah.";
      } else if (text.startsWith("/hifz")) {
        replyText =
          "🎧 *Hifz Memorization Mode*\n\n" +
          "Select any Surah, set your repetition loop count, and memorize verse by verse with continuous audio playback.";
      } else if (text.startsWith("/review")) {
        replyText =
          "🧠 *Active Recall Quiz*\n\n" +
          "Test your retention! Words are masked and revealed with first-letter hints to ensure your Hifz is solid.";
      } else if (text.startsWith("/reciters")) {
        replyText =
          "🎙 *Featured Reciters on Ayah Quest:*\n\n" +
          "1. *جابر القيطان (Jaber Al-Qaitan)* — Melodic & reverent\n" +
          "2. *مشاري العفاسي (Mishary Alafasy)* — Clear Murattal\n" +
          "3. *علي جابر (Ali Jaber)* — Classic Haramayn cadence\n" +
          "4. *ناصر القطامي (Nasser Al-Qatami)* — Emotional & deep\n" +
          "5. *ماهر المعيقلي (Maher Al-Muaiqly)* — Steady pacing";
      } else if (text.startsWith("/streak")) {
        replyText =
          "🔥 *Daily Consistency*\n\n" +
          "The Messenger of Allah ﷺ said:\n" +
          "_\"The most beloved deeds to Allah are those that are most consistent, even if they are small.\"_\n\n" +
          "Open Ayah Quest to log today's review and keep your streak alive!";
      } else if (text.startsWith("/help")) {
        replyText =
          "ℹ️ *Ayah Quest Help & Support*\n\n" +
          "• Use the button below to launch the Mini App inside Telegram\n" +
          "• For queries or suggestions, reach out to: @luck_7n\n" +
          "• May Allah bless your efforts in memorizing the Holy Quran!";
      } else {
        replyText =
          "📖 *Ayah Quest (آية)*\n\n" +
          "Tap the button below to launch your Quran companion:";
      }

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
          parse_mode: "Markdown",
          reply_markup: replyMarkup
        })
      });

      return new Response("OK", { status: 200 });
    } catch (err) {
      return new Response("Error processing update", { status: 500 });
    }
  }
};
