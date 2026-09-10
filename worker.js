/**
 * Ayah Quest (آية) - Cloudflare Worker
 * 
 * Handles both:
 * 1. Static Assets (serves the React Mini App from dist/)
 * 2. Telegram Bot Webhook (handles /start, /daily, etc. when Telegram sends updates)
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check endpoint for verifying webhook status in browser
    if (request.method === "GET" && (url.pathname === "/webhook" || url.pathname === "/api/bot" || url.searchParams.has("check"))) {
      const hasToken = !!env.BOT_TOKEN;
      return new Response(
        JSON.stringify({
          status: "active",
          service: "Ayah Quest Telegram Webhook Worker",
          botTokenConfigured: hasToken,
          appUrl: env.APP_URL || url.origin,
          time: new Date().toISOString()
        }, null, 2),
        {
          headers: { "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    // 1. If Telegram webhook sends a POST request (to root / or /api/bot or /webhook)
    if (request.method === "POST") {
      try {
        const update = await request.json();
        
        // Handle message updates
        const message = update?.message || update?.channel_post;
        if (message && message.chat) {
          const chatId = message.chat.id;
          const text = (message.text || "").trim();
          const botToken = env.BOT_TOKEN;
          const appUrl = env.APP_URL || url.origin;

          let replyText = "";
          let replyMarkup = {
            inline_keyboard: [
              [{ text: "📖 Open Ayah Quest | آية", web_app: { url: appUrl } }]
            ]
          };

          if (text.startsWith("/start")) {
            replyText =
              "﷽\n\n" +
              "Assalamu Alaikum wa Rahmatullah! 🌙\n\n" +
              "Welcome to *Ayah Quest (آية)* — your companion for memorizing the Holy Quran through active recall and spaced repetition.\n\n" +
              "Whether you are memorizing your first Surah, reviewing Juz' Amma, or strengthening your existing Hifz, Ayah Quest is designed to help you build an enduring bond with the Book of Allah:\n\n" +
              "• 🎧 *Renowned Reciters:* Listen and repeat with *Sheikh جابر القيطان*, Mishary Alafasy, Ali Jaber, Nasser Al-Qatami, and Maher Al-Muaiqly.\n" +
              "• 🔁 *Smart Repetition Loops:* Auto-loop any ayah 3x, 5x, 10x, or infinite times with auto-advancing surah playback.\n" +
              "• 🧠 *Active Recall & Hifz Quizzes:* Mask verses, fill in missing words, unscramble ayah orders, and test twin verses (المتشابهات).\n" +
              "• 📊 *Progress Tracking:* Daily memorization streaks, page bookmarking, and cloud sync.\n" +
              "• ✨ *100% Free, Ad-Free & Offline Capable.*\n\n" +
              "Tap the button below to launch the Mini App:";
          } else if (text.startsWith("/daily")) {
            replyText =
              "💫 *Daily Quran Reflection & Hadith*\n\n" +
              "«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»\n" +
              "\"The best among you are those who learn the Quran and teach it.\"\n— *Sahih Al-Bukhari 5027*\n\n" +
              "💡 *Daily Tip:* Even dedicating 5 focused minutes or reciting one single ayah today places you among the best in the sight of Allah.";
          } else if (text.startsWith("/hifz")) {
            replyText =
              "🎧 *Hifz Repetition Mode*\n\n" +
              "Select your target Surah, set repetition counts (3x, 5x, 10x), and memorize verse by verse with Sheikh Jaber Al-Qaitan.\n\n" +
              "Tap below to begin:";
          } else if (text.startsWith("/review")) {
            replyText =
              "🧠 *Active Recall & Review Quiz*\n\n" +
              "Test whether your memorization is rock-solid by masking verses, finding missing words, and distinguishing mutashabihat twin verses.\n\n" +
              "Tap below to test your retention:";
          } else if (text.startsWith("/reciters")) {
            replyText =
              "🎙 *Available Reciters on Ayah Quest:*\n\n" +
              "1. *جابر القيطان (Jaber Al-Qaitan)*\n" +
              "2. *Mishary Rashid Alafasy*\n" +
              "3. *Ali Jaber*\n" +
              "4. *Nasser Al-Qatami*\n" +
              "5. *Maher Al-Muaiqly*\n\n" +
              "All recitations stream in crystal-clear audio with repetition loops.";
          } else if (text.startsWith("/streak")) {
            replyText =
              "🔥 *Daily Quran Streak*\n\n" +
              "«أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»\n" +
              "\"The most beloved deeds to Allah are those done consistently, even if they are small.\"\n\n" +
              "Launch the app to check in and preserve your daily streak!";
          } else {
            replyText =
              "📖 *Ayah Quest (آية)*\n\n" +
              "Welcome! You can open the Quran Memorization Mini App anytime using the button below.\n\n" +
              "Commands you can try:\n" +
              "• /start - Welcome & features\n" +
              "• /daily - Daily Hadith & reflection\n" +
              "• /hifz - Repetition loops guide\n" +
              "• /review - Active recall test\n" +
              "• /reciters - Available Quran reciters\n" +
              "• /streak - Consistency reminder\n\n" +
              "For inquiries or feedback: @luck_7n";
          }

          if (botToken) {
            const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: replyText,
                parse_mode: "Markdown",
                reply_markup: replyMarkup
              })
            });

            if (!tgRes.ok) {
              const errBody = await tgRes.text();
              console.error("Telegram API error:", tgRes.status, errBody);
            }
          } else {
            console.warn("BOT_TOKEN is not configured in Worker environment variables.");
          }

          return new Response("OK", { status: 200 });
        }
      } catch (err) {
        console.error("Webhook processing error:", err);
        return new Response("Webhook error: " + err.message, { status: 200 });
      }
    }

    // 2. Otherwise, serve static assets (React app)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Ayah Quest Worker is active.", { status: 200 });
  }
};
