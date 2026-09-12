/**
 * Ayah Quest (آية) - Cloudflare Worker
 * 
 * Handles:
 * 1. 1v1 Real-Time Room API (/api/rooms/*) for instant mobile phone sync
 * 2. Telegram Bot Webhook (/webhook, /api/bot, /start, etc.)
 * 3. Static Assets (serves the React Mini App from dist/)
 */

// In-memory room storage in Worker isolate
const workerRooms = new Map();

// Helper to return JSON responses with CORS headers
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // Health check
    if (url.pathname === "/api/health" || url.pathname === "/webhook" || url.pathname === "/api/bot") {
      if (request.method === "GET") {
        return jsonResponse({
          status: "active",
          service: "Ayah Quest Cloudflare Worker & Room Relay",
          activeRooms: workerRooms.size,
          botTokenConfigured: !!env.BOT_TOKEN,
          time: new Date().toISOString(),
        });
      }
    }

    // =============================================================
    // 1. 1v1 LIVE ROOM ENDPOINTS (/api/rooms/*)
    // =============================================================

    function findRoom(key) {
      if (!key) return null;
      const clean = String(key).trim();
      const upper = clean.toUpperCase();
      if (workerRooms.has(upper)) return workerRooms.get(upper);

      const search = clean.replace(/^@/, "").toLowerCase();
      for (const r of workerRooms.values()) {
        if (r.code.toLowerCase() === search) return r;
        if (r.hostId && String(r.hostId).toLowerCase() === search) return r;
        if (r.hostName && r.hostName.toLowerCase() === search) return r;
        if (r.guestName && r.guestName.toLowerCase() === search) return r;
      }
      return null;
    }

    // POST /api/rooms/create
    if (request.method === "POST" && url.pathname === "/api/rooms/create") {
      try {
        const body = await request.json();
        const { code, hostName, hostId, surahNum, diff, questionCount, seed } = body;
        if (!code) return jsonResponse({ error: "Room code required" }, 400);

        const cleanCode = String(code).trim().toUpperCase();
        const room = {
          code: cleanCode,
          hostName: hostName || "Host",
          hostId: hostId || "host_user",
          guestName: undefined,
          guestId: undefined,
          surahNum: typeof surahNum === "number" ? surahNum : 0,
          diff: diff || "hafiz",
          questionCount: typeof questionCount === "number" ? questionCount : 5,
          seed: typeof seed === "number" ? seed : Math.floor(Math.random() * 10000) + 1,
          status: "waiting",
          hostScore: 0,
          hostQIndex: 0,
          guestScore: 0,
          guestQIndex: 0,
          createdAt: Date.now(),
          lastUpdated: Date.now(),
        };

        workerRooms.set(cleanCode, room);
        return jsonResponse({ success: true, isHost: true, room });
      } catch (err) {
        return jsonResponse({ error: err.message }, 500);
      }
    }

    // POST /api/rooms/join
    if (request.method === "POST" && url.pathname === "/api/rooms/join") {
      try {
        const body = await request.json();
        const { code, guestName, guestId } = body;
        if (!code) return jsonResponse({ error: "Room code required" }, 400);

        let room = findRoom(code);

        if (!room) {
          const cleanCode = String(code).trim().toUpperCase();
          room = {
            code: cleanCode,
            hostName: "Host Companion",
            hostId: "host_user",
            guestName: guestName || "Guest Companion",
            guestId: guestId || "guest_user",
            surahNum: 0,
            diff: "hafiz",
            questionCount: 5,
            seed: Math.floor(Math.random() * 10000) + 1,
            status: "ready",
            hostScore: 0,
            hostQIndex: 0,
            guestScore: 0,
            guestQIndex: 0,
            createdAt: Date.now(),
            lastUpdated: Date.now(),
          };
          workerRooms.set(cleanCode, room);
        } else {
          room.guestName = guestName || "Guest Companion";
          room.guestId = guestId || "guest_user";
          room.status = "ready";
          room.lastUpdated = Date.now();
        }

        return jsonResponse({ success: true, isHost: false, room });
      } catch (err) {
        return jsonResponse({ error: err.message }, 500);
      }
    }

    // GET /api/rooms/:code
    if (request.method === "GET" && url.pathname.startsWith("/api/rooms/")) {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length === 3 && parts[1] === "rooms") {
        const room = findRoom(parts[2]);
        if (!room) return jsonResponse({ error: "Room not found" }, 404);
        return jsonResponse({ success: true, room });
      }
    }

    // POST /api/rooms/:code/start
    if (request.method === "POST" && url.pathname.includes("/start")) {
      const match = url.pathname.match(/\/api\/rooms\/([^\/]+)\/start/);
      if (match) {
        const room = findRoom(match[1]);
        if (!room) return jsonResponse({ error: "Room not found" }, 404);

        try {
          const body = await request.json();
          if (typeof body.seed === "number") room.seed = body.seed;
        } catch {}

        room.status = "playing";
        room.hostScore = 0;
        room.hostQIndex = 0;
        room.guestScore = 0;
        room.guestQIndex = 0;
        room.lastUpdated = Date.now();

        return jsonResponse({ success: true, room });
      }
    }

    // POST /api/rooms/:code/progress
    if (request.method === "POST" && url.pathname.includes("/progress")) {
      const match = url.pathname.match(/\/api\/rooms\/([^\/]+)\/progress/);
      if (match) {
        const room = findRoom(match[1]);
        if (!room) return jsonResponse({ error: "Room not found" }, 404);

        try {
          const body = await request.json();
          const { isHost, score, qIndex } = body;
          if (isHost) {
            if (typeof score === "number") room.hostScore = score;
            if (typeof qIndex === "number") room.hostQIndex = qIndex;
          } else {
            if (typeof score === "number") room.guestScore = score;
            if (typeof qIndex === "number") room.guestQIndex = qIndex;
          }
          room.lastUpdated = Date.now();
        } catch {}

        return jsonResponse({ success: true, room });
      }
    }

    // =============================================================
    // 2. TELEGRAM BOT WEBHOOK (POST to / or /webhook or /api/bot)
    // =============================================================
    if (request.method === "POST" && !url.pathname.startsWith("/api/rooms")) {
      try {
        const update = await request.json();
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
              "Tap the button below to launch the Mini App:";
          } else if (text.startsWith("/daily")) {
            replyText =
              "💫 *Daily Quran Reflection & Hadith*\n\n" +
              "«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»\n" +
              "\"The best among you are those who learn the Quran and teach it.\"\n— *Sahih Al-Bukhari 5027*";
          } else {
            replyText =
              "📖 *Ayah Quest (آية)*\n\n" +
              "Welcome! You can open the Quran Memorization Mini App anytime using the button below.";
          }

          if (botToken) {
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
          }

          return new Response("OK", { status: 200 });
        }
      } catch (err) {
        return new Response("Webhook error: " + err.message, { status: 200 });
      }
    }

    // =============================================================
    // 3. STATIC ASSETS (React SPA)
    // =============================================================
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Ayah Quest Worker is active.", { status: 200 });
  }
};
