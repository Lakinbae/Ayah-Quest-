export async function onRequestPost(context) {
  const { request, env } = context;

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
      return new Response("BOT_TOKEN is missing", { status: 500 });
    }

    let replyText = "";
    let replyMarkup = {
      inline_keyboard: [
        [{ text: "📖 Open Ayah Quest | آية", web_app: { url: appUrl } }]
      ]
    };

    if (text.startsWith("/start")) {
      replyText =
        "Assalamu Alaikum wa Rahmatullah! 🌙\n\n" +
        "Welcome to *Ayah Quest (آية)* — your Quran memorization & active recall companion.\n\n" +
        "• 🎧 Listen to *Sheikh جابر القيطان* and renowned reciters\n" +
        "• 🔁 Loop verses for seamless Hifz\n" +
        "• 🧠 Test retention with word-masking & active recall\n" +
        "• 100% Free & ad-free\n\n" +
        "Tap the button below to open:";
    } else if (text.startsWith("/daily")) {
      replyText =
        "💫 *Daily Quran Reflection & Hadith*\n\n" +
        "«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»\n" +
        "\"The best among you are those who learn the Quran and teach it.\"\n— *Sahih Al-Bukhari 5027*\n\n" +
        "💡 *Actionable Tip:* Even reciting or reviewing 1 single ayah today places you among the best in the sight of Allah.";
    } else if (text.startsWith("/hifz")) {
      replyText = "🎧 *Hifz Mode*\n\nSelect your target Surah, set repetition counts (3x, 5x, 10x), and memorize verse by verse:";
    } else if (text.startsWith("/review")) {
      replyText = "🧠 *Active Recall Quiz*\n\nTest whether your memorization is rock-solid by masking words and revealing hints:";
    } else if (text.startsWith("/reciters")) {
      replyText =
        "🎙 *Available Reciters on Ayah Quest:*\n\n" +
        "1. *جابر القيطان (Jaber Al-Qaitan)*\n" +
        "2. *Mishary Rashid Alafasy*\n" +
        "3. *Ali Jaber*\n" +
        "4. *Nasser Al-Qatami*\n" +
        "5. *Maher Al-Muaiqly*";
    } else if (text.startsWith("/streak")) {
      replyText = "🔥 *Daily Streak*\n\n\"The most beloved deeds to Allah are those that are most consistent, even if they are small.\"\n\nOpen the app to log today's progress!";
    } else {
      replyText =
        "📖 *Ayah Quest (آية)*\n\n" +
        "You can open the app anytime using the button below or contact @luck_7n for support.";
    }

    // Send response to Telegram Bot API
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
    return new Response("Error: " + err.message, { status: 500 });
  }
}

export async function onRequestGet() {
  return new Response("Ayah Quest Telegram Webhook Endpoint is Active.", { status: 200 });
}
