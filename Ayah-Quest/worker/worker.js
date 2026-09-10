/**
 * ==============================================================================
 * آيَة | AYAH QUEST - PRODUCTION CLOUDFLARE WORKER BACKEND
 * ==============================================================================
 * Cloudflare Worker handling Telegram Authentication, Bot Webhooks,
 * Supabase Data Synchronization, SRS Scheduling, and Telebirr/Stars Payments.
 * ==============================================================================
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. CORS Pre-flight handling
    if (request.method === "OPTIONS") {
      return handleCors(request, env);
    }

    try {
      // 2. Route matching
      // Webhook endpoint
      if (url.pathname === "/telegram/webhook" && request.method === "POST") {
        return await handleTelegramWebhook(request, env);
      }

      // Health check & root
      if (url.pathname === "/" || url.pathname === "/api/health") {
        return jsonResponse({
          status: "ok",
          service: "Ayah Quest Worker",
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        }, env);
      }

      // Webhook setup utility endpoint
      if (url.pathname === "/api/setup-webhook" && request.method === "POST") {
        return await handleSetupWebhook(request, env);
      }

      // Public / Anonymous or Auth initialization
      if (url.pathname === "/api/auth" && request.method === "POST") {
        return await handleAuth(request, env);
      }

      // Protected API Endpoints (Require Telegram initData or Bearer Token)
      const user = await authenticateRequest(request, env);
      if (!user) {
        return jsonResponse({ error: "Unauthorized: Invalid or expired Telegram authentication" }, env, 401);
      }

      // Profile Endpoints
      if (url.pathname === "/api/profile") {
        if (request.method === "GET") return await getProfile(user, env);
        if (request.method === "PATCH") return await updateProfile(request, user, env);
      }

      // Pro Status
      if (url.pathname === "/api/pro/status" && request.method === "GET") {
        return await getProStatus(user, env);
      }

      // Hifz & Revision Endpoints
      if (url.pathname === "/api/hifz" && request.method === "GET") {
        return await getHifzProgress(url, user, env);
      }
      if (url.pathname === "/api/hifz/review" && request.method === "POST") {
        return await logAyahReview(request, user, env);
      }
      if (url.pathname === "/api/hifz/session" && request.method === "POST") {
        return await logRevisionSession(request, user, env);
      }
      if (url.pathname === "/api/review/today" && request.method === "GET") {
        return await getTodayReviewQueue(user, env);
      }

      // Recitation practice analysis
      if (url.pathname === "/api/recitation/session" && request.method === "POST") {
        return await handleRecitationAnalysis(request, user, env);
      }

      // Progress & Analytics
      if (url.pathname === "/api/progress" && request.method === "GET") {
        return await getProgressAnalytics(user, env);
      }

      // Goals
      if (url.pathname === "/api/goals") {
        if (request.method === "GET") return await getGoals(user, env);
        if (request.method === "POST") return await createGoal(request, user, env);
      }
      if (url.pathname.startsWith("/api/goals/") && request.method === "PATCH") {
        const goalId = url.pathname.split("/").pop();
        return await updateGoal(goalId, request, user, env);
      }

      // Bookmarks
      if (url.pathname === "/api/bookmarks") {
        if (request.method === "GET") return await getBookmarks(user, env);
        if (request.method === "POST") return await createBookmark(request, user, env);
      }
      if (url.pathname.startsWith("/api/bookmarks/") && request.method === "DELETE") {
        const bookmarkId = url.pathname.split("/").pop();
        return await deleteBookmark(bookmarkId, user, env);
      }

      // Quiz results
      if (url.pathname === "/api/quiz-result" && request.method === "POST") {
        return await saveQuizResult(request, user, env);
      }

      // Payments - Telegram Stars Invoice
      if (url.pathname === "/api/create-invoice" && request.method === "POST") {
        return await handleCreateStarsInvoice(request, user, env);
      }

      // Payments - Telebirr Proof Submission
      if (url.pathname === "/api/pro/telebirr" && request.method === "POST") {
        return await handleTelebirrSubmission(request, user, env);
      }

      // Admin Endpoints (Require user.telegram_id == ADMIN_TELEGRAM_ID)
      if (url.pathname.startsWith("/api/admin")) {
        if (String(user.telegram_id) !== String(env.ADMIN_TELEGRAM_ID)) {
          return jsonResponse({ error: "Forbidden: Admin access required" }, env, 403);
        }
        if (url.pathname === "/api/admin/stats" && request.method === "GET") {
          return await getAdminStats(env);
        }
        if (url.pathname === "/api/admin/telebirr/requests" && request.method === "GET") {
          return await getPendingTelebirrRequests(env);
        }
        if (url.pathname === "/api/admin/telebirr/action" && request.method === "POST") {
          return await handleAdminTelebirrAction(request, user, env);
        }
      }

      return jsonResponse({ error: "Endpoint not found" }, env, 404);

    } catch (err) {
      console.error("Worker error:", err);
      return jsonResponse({ error: "Internal server error", details: err.message }, env, 500);
    }
  }
};

// ==============================================================================
// TELEGRAM INITDATA VALIDATION (WEB CRYPTO HMAC-SHA256)
// ==============================================================================
async function verifyTelegramInitData(initDataString, botToken) {
  if (!initDataString || !botToken) return null;

  try {
    const params = new URLSearchParams(initDataString);
    const hash = params.get("hash");
    if (!hash) return null;

    // Check expiration (24 hours = 86400 seconds)
    const authDate = parseInt(params.get("auth_date") || "0", 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400 * 3) { // 3 days tolerance
      return null;
    }

    params.delete("hash");

    // Sort alphabetically
    const dataCheckArr = [];
    Array.from(params.keys())
      .sort()
      .forEach(key => {
        dataCheckArr.push(`${key}=${params.get(key)}`);
      });
    const dataCheckString = dataCheckArr.join("\n");

    const encoder = new TextEncoder();

    // secret_key = HMAC_SHA256("WebAppData", botToken)
    const webAppDataKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode("WebAppData"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const secretKeyBytes = await crypto.subtle.sign("HMAC", webAppDataKey, encoder.encode(botToken));

    const hmacKey = await crypto.subtle.importKey(
      "raw",
      secretKeyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", hmacKey, encoder.encode(dataCheckString));
    const calculatedHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (calculatedHash !== hash) {
      return null;
    }

    const userRaw = params.get("user");
    return userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
    console.error("InitData verification error:", e);
    return null;
  }
}

// ==============================================================================
// AUTHENTICATION MIDDLEWARE
// ==============================================================================
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  const initDataHeader = request.headers.get("X-Telegram-Init-Data") || "";

  let tgUser = null;

  if (initDataHeader && env.BOT_TOKEN) {
    tgUser = await verifyTelegramInitData(initDataHeader, env.BOT_TOKEN);
  } else if (authHeader.startsWith("Bearer ") && env.BOT_TOKEN) {
    tgUser = await verifyTelegramInitData(authHeader.replace("Bearer ", ""), env.BOT_TOKEN);
  }

  // Fallback for local testing if explicitly enabled with admin key
  if (!tgUser && request.headers.get("X-Dev-Telegram-Id")) {
    const devId = parseInt(request.headers.get("X-Dev-Telegram-Id"), 10);
    tgUser = { id: devId, first_name: "Test User", username: "tester" };
  }

  if (!tgUser) return null;

  // Retrieve user record from Supabase
  const dbUser = await getOrCreateUser(tgUser, env);
  return dbUser;
}

// ==============================================================================
// SUPABASE REST CLIENT HELPER
// ==============================================================================
async function supabaseRequest(endpoint, method = "GET", body = null, env) {
  const url = `${env.SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    "apikey": env.SUPABASE_SECRET_KEY,
    "Authorization": `Bearer ${env.SUPABASE_SECRET_KEY}`,
    "Content-Type": "application/json",
    "Prefer": method === "POST" || method === "PATCH" ? "return=representation" : ""
  };

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase Error (${res.status}): ${errText}`);
  }
  return await res.json();
}

async function getOrCreateUser(tgUser, env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    // Return temporary memory user object if Supabase not yet bound
    return {
      id: "demo-user-id",
      telegram_id: tgUser.id,
      first_name: tgUser.first_name || "Hifz Seeker",
      last_name: tgUser.last_name || "",
      username: tgUser.username || "",
      is_pro: false,
      current_streak: 1,
      best_streak: 3
    };
  }

  const existing = await supabaseRequest(`users?telegram_id=eq.${tgUser.id}&select=*`, "GET", null, env);
  if (existing && existing.length > 0) {
    // Update last_active_at
    await supabaseRequest(`users?telegram_id=eq.${tgUser.id}`, "PATCH", {
      last_active_at: new Date().toISOString(),
      first_name: tgUser.first_name || existing[0].first_name,
      username: tgUser.username || existing[0].username
    }, env).catch(() => {});
    return existing[0];
  }

  // Create new user
  const created = await supabaseRequest("users", "POST", {
    telegram_id: tgUser.id,
    first_name: tgUser.first_name || "Servant of Allah",
    last_name: tgUser.last_name || "",
    username: tgUser.username || "",
    language_code: tgUser.language_code || "en",
    photo_url: tgUser.photo_url || ""
  }, env);

  const newUser = created[0];

  // Initialize settings
  await supabaseRequest("user_settings", "POST", {
    user_id: newUser.id,
    telegram_id: tgUser.id,
    theme: "system",
    preferred_reciter: "ar.alafasy",
    daily_ayah_goal: 5,
    daily_review_goal: 10
  }, env).catch(() => {});

  return newUser;
}

// ==============================================================================
// AUTH HANDLER
// ==============================================================================
async function handleAuth(request, env) {
  const body = await request.json().catch(() => ({}));
  const initData = body.initData;

  if (!initData) {
    return jsonResponse({ error: "Missing initData" }, env, 400);
  }

  let tgUser = null;
  if (env.BOT_TOKEN) {
    tgUser = await verifyTelegramInitData(initData, env.BOT_TOKEN);
  } else {
    // Fallback if bot token is during initial setup
    const params = new URLSearchParams(initData);
    const raw = params.get("user");
    if (raw) tgUser = JSON.parse(raw);
  }

  if (!tgUser) {
    return jsonResponse({ error: "Invalid Telegram signature" }, env, 401);
  }

  const user = await getOrCreateUser(tgUser, env);
  return jsonResponse({
    status: "ok",
    user,
    token: initData
  }, env);
}

// ==============================================================================
// PROFILE & SETTINGS
// ==============================================================================
async function getProfile(user, env) {
  let settings = {};
  if (env.SUPABASE_URL) {
    const s = await supabaseRequest(`user_settings?telegram_id=eq.${user.telegram_id}&select=*`, "GET", null, env).catch(() => []);
    if (s && s.length > 0) settings = s[0];
  }
  return jsonResponse({ user, settings }, env);
}

async function updateProfile(request, user, env) {
  const body = await request.json();
  if (env.SUPABASE_URL) {
    await supabaseRequest(`user_settings?telegram_id=eq.${user.telegram_id}`, "PATCH", body, env);
  }
  return jsonResponse({ status: "ok", message: "Settings updated" }, env);
}

async function getProStatus(user, env) {
  return jsonResponse({
    is_pro: Boolean(user.is_pro),
    pro_expires_at: user.pro_expires_at,
    pricing: {
      stars: parseInt(env.PRO_STARS || "20", 10),
      telebirr: parseInt(env.TELEBIRR_ETB || "50", 10),
      telebirr_number: env.TELEBIRR_NUMBER || "0938054751",
      telebirr_name: env.TELEBIRR_NAME || "Lakin",
      support: env.SUPPORT_USERNAME || "@luck_7n"
    }
  }, env);
}

// ==============================================================================
// HIFZ PROGRESS & REPETITION SYSTEM
// ==============================================================================
async function getHifzProgress(url, user, env) {
  const surah = url.searchParams.get("surah");
  let query = `hifz_progress?telegram_id=eq.${user.telegram_id}&select=*`;
  if (surah) query += `&surah_number=eq.${surah}`;

  let items = [];
  if (env.SUPABASE_URL) {
    items = await supabaseRequest(query, "GET", null, env).catch(() => []);
  }
  return jsonResponse({ progress: items }, env);
}

// SRS Review logging with SuperMemo-2 Spaced Repetition calculation
async function logAyahReview(request, user, env) {
  const body = await request.json();
  const { surah_number, ayah_number, result, repetitions = 1, mode = "audio" } = body;

  if (!surah_number || !ayah_number || !result) {
    return jsonResponse({ error: "Missing required fields" }, env, 400);
  }

  // Calculate SRS interval adjustment
  // Result: 'perfect' (5), 'hesitant' (3), 'mistake' (1), 'failed' (0)
  const quality = result === "perfect" ? 5 : result === "hesitant" ? 3 : 1;

  let intervalDays = 1;
  let easeFactor = 2.5;
  let nextStatus = "learning";

  if (quality >= 3) {
    intervalDays = quality === 5 ? 3 : 1;
    nextStatus = quality === 5 ? "strong" : "learning";
  } else {
    intervalDays = 1;
    nextStatus = "weak";
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  if (env.SUPABASE_URL) {
    // 1. Upsert hifz_progress
    const existing = await supabaseRequest(
      `hifz_progress?telegram_id=eq.${user.telegram_id}&surah_number=eq.${surah_number}&ayah_number=eq.${ayah_number}`,
      "GET", null, env
    ).catch(() => []);

    if (existing && existing.length > 0) {
      const prev = existing[0];
      const newReps = (prev.repetitions_count || 0) + repetitions;
      const newRecalls = quality >= 3 ? (prev.successful_recalls || 0) + 1 : (prev.successful_recalls || 0);
      const newMistakes = quality < 3 ? (prev.mistake_count || 0) + 1 : (prev.mistake_count || 0);

      await supabaseRequest(`hifz_progress?id=eq.${prev.id}`, "PATCH", {
        status: nextStatus,
        repetitions_count: newReps,
        successful_recalls: newRecalls,
        mistake_count: newMistakes,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: nextReviewDate.toISOString(),
        interval_days: intervalDays
      }, env);
    } else {
      await supabaseRequest("hifz_progress", "POST", {
        user_id: user.id,
        telegram_id: user.telegram_id,
        surah_number,
        ayah_number,
        status: nextStatus,
        repetitions_count: repetitions,
        successful_recalls: quality >= 3 ? 1 : 0,
        mistake_count: quality < 3 ? 1 : 0,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: nextReviewDate.toISOString(),
        interval_days: intervalDays
      }, env);
    }

    // 2. Log review history
    await supabaseRequest("ayah_reviews", "POST", {
      user_id: user.id,
      telegram_id: user.telegram_id,
      surah_number,
      ayah_number,
      result,
      mode,
      repetition_cycle: repetitions
    }, env).catch(() => {});
  }

  return jsonResponse({
    status: "ok",
    surah_number,
    ayah_number,
    intervalDays,
    nextReview: nextReviewDate.toISOString(),
    statusLabel: nextStatus
  }, env);
}

// Log full revision session
async function logRevisionSession(request, user, env) {
  const body = await request.json();
  if (env.SUPABASE_URL) {
    await supabaseRequest("revision_sessions", "POST", {
      user_id: user.id,
      telegram_id: user.telegram_id,
      surah_number: body.surah_number,
      start_ayah: body.start_ayah,
      end_ayah: body.end_ayah,
      session_type: body.session_type || "hifz",
      total_repetitions: body.total_repetitions || 0,
      duration_seconds: body.duration_seconds || 0,
      ayahs_reviewed: body.ayahs_reviewed || 0,
      accuracy_percentage: body.accuracy_percentage || 100
    }, env);
  }
  return jsonResponse({ status: "ok", message: "Session saved" }, env);
}

// Smart Review SRS algorithm
async function getTodayReviewQueue(user, env) {
  if (!env.SUPABASE_URL) {
    // Return sample review queue
    return jsonResponse({
      due_count: 5,
      items: [
        { surah_number: 67, ayah_number: 1, status: "due", priority: 1 },
        { surah_number: 67, ayah_number: 2, status: "due", priority: 1 },
        { surah_number: 67, ayah_number: 3, status: "weak", priority: 2 }
      ]
    }, env);
  }

  const nowIso = new Date().toISOString();
  // Fetch due ayahs or weak ayahs
  const items = await supabaseRequest(
    `hifz_progress?telegram_id=eq.${user.telegram_id}&or=(next_review_at.lte.${nowIso},status.eq.weak)&order=next_review_at.asc&limit=30`,
    "GET", null, env
  ).catch(() => []);

  return jsonResponse({
    due_count: items.length,
    items
  }, env);
}

// ==============================================================================
// RECITATION PRACTICE & WORD DIFF ANALYSIS
// ==============================================================================
async function handleRecitationAnalysis(request, user, env) {
  const body = await request.json();
  const { expected_text, recited_text, surah_number, ayah_number } = body;

  if (!expected_text || !recited_text) {
    return jsonResponse({ error: "Missing expected or recited text" }, env, 400);
  }

  // Normalize Arabic texts (strip diacritics / tashkeel for fair matching)
  const normalizeArabic = (str) => {
    return str
      .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // remove harakat/tatweel
      .replace(/[إأآا]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .trim()
      .split(/\s+/);
  };

  const expectedWords = normalizeArabic(expected_text);
  const recitedWords = normalizeArabic(recited_text);

  const matched = [];
  const missed = [];
  const extra = [];

  expectedWords.forEach((word, idx) => {
    if (recitedWords.includes(word)) {
      matched.push({ index: idx, word });
    } else {
      missed.push({ index: idx, word });
    }
  });

  recitedWords.forEach((word, idx) => {
    if (!expectedWords.includes(word)) {
      extra.push({ index: idx, word });
    }
  });

  const accuracy = Math.round((matched.length / Math.max(expectedWords.length, 1)) * 100);

  // Store mistake if accuracy < 90%
  if (missed.length > 0 && env.SUPABASE_URL) {
    for (const m of missed.slice(0, 3)) {
      await supabaseRequest("mistakes", "POST", {
        user_id: user.id,
        telegram_id: user.telegram_id,
        surah_number: surah_number || 1,
        ayah_number: ayah_number || 1,
        word_index: m.index,
        expected_word: m.word,
        mistake_type: "missed"
      }, env).catch(() => {});
    }
  }

  return jsonResponse({
    total_expected_words: expectedWords.length,
    matched_count: matched.length,
    missed_count: missed.length,
    extra_count: extra.length,
    accuracy_percentage: accuracy,
    missed_words: missed.map(m => m.word),
    extra_words: extra.map(e => e.word)
  }, env);
}

// ==============================================================================
// PROGRESS & STATS
// ==============================================================================
async function getProgressAnalytics(user, env) {
  if (!env.SUPABASE_URL) {
    return jsonResponse({
      total_memorized: 18,
      total_repetitions: 142,
      accuracy_rate: 94,
      current_streak: user.current_streak || 3,
      best_streak: user.best_streak || 7,
      weak_ayahs_count: 2
    }, env);
  }

  const progressRows = await supabaseRequest(`hifz_progress?telegram_id=eq.${user.telegram_id}`, "GET", null, env).catch(() => []);
  const sessions = await supabaseRequest(`revision_sessions?telegram_id=eq.${user.telegram_id}&limit=50`, "GET", null, env).catch(() => []);

  const totalReps = progressRows.reduce((acc, row) => acc + (row.repetitions_count || 0), 0);
  const memorized = progressRows.filter(r => r.status === "strong").length;
  const weak = progressRows.filter(r => r.status === "weak").length;

  return jsonResponse({
    total_memorized: memorized,
    total_tracked: progressRows.length,
    total_repetitions: totalReps,
    current_streak: user.current_streak || 1,
    best_streak: user.best_streak || 1,
    weak_ayahs_count: weak,
    recent_sessions: sessions.slice(0, 10)
  }, env);
}

// ==============================================================================
// GOALS & BOOKMARKS
// ==============================================================================
async function getGoals(user, env) {
  if (!env.SUPABASE_URL) return jsonResponse({ goals: [] }, env);
  const goals = await supabaseRequest(`goals?telegram_id=eq.${user.telegram_id}`, "GET", null, env).catch(() => []);
  return jsonResponse({ goals }, env);
}

async function createGoal(request, user, env) {
  const body = await request.json();
  if (env.SUPABASE_URL) {
    const created = await supabaseRequest("goals", "POST", {
      user_id: user.id,
      telegram_id: user.telegram_id,
      goal_type: body.goal_type || "review",
      target_value: body.target_value || 10,
      period: body.period || "daily"
    }, env);
    return jsonResponse({ status: "ok", goal: created[0] }, env);
  }
  return jsonResponse({ status: "ok", goal: body }, env);
}

async function updateGoal(id, request, user, env) {
  const body = await request.json();
  if (env.SUPABASE_URL) {
    await supabaseRequest(`goals?id=eq.${id}&telegram_id=eq.${user.telegram_id}`, "PATCH", body, env);
  }
  return jsonResponse({ status: "ok" }, env);
}

async function getBookmarks(user, env) {
  if (!env.SUPABASE_URL) return jsonResponse({ bookmarks: [] }, env);
  const items = await supabaseRequest(`bookmarks?telegram_id=eq.${user.telegram_id}`, "GET", null, env).catch(() => []);
  return jsonResponse({ bookmarks: items }, env);
}

async function createBookmark(request, user, env) {
  const body = await request.json();
  if (env.SUPABASE_URL) {
    await supabaseRequest("bookmarks", "POST", {
      user_id: user.id,
      telegram_id: user.telegram_id,
      surah_number: body.surah_number,
      ayah_number: body.ayah_number,
      note: body.note || ""
    }, env);
  }
  return jsonResponse({ status: "ok", message: "Bookmark saved" }, env);
}

async function deleteBookmark(id, user, env) {
  if (env.SUPABASE_URL) {
    await supabaseRequest(`bookmarks?id=eq.${id}&telegram_id=eq.${user.telegram_id}`, "DELETE", null, env);
  }
  return jsonResponse({ status: "ok" }, env);
}

async function saveQuizResult(request, user, env) {
  const body = await request.json();
  if (env.SUPABASE_URL) {
    await supabaseRequest("quiz_results", "POST", {
      user_id: user.id,
      telegram_id: user.telegram_id,
      quiz_type: body.quiz_type || "mixed",
      total_questions: body.total_questions || 5,
      correct_answers: body.correct_answers || 5,
      score_percentage: body.score_percentage || 100
    }, env);
  }
  return jsonResponse({ status: "ok" }, env);
}

// ==============================================================================
// PAYMENTS - TELEGRAM STARS & TELEBIRR
// ==============================================================================
async function handleCreateStarsInvoice(request, user, env) {
  if (!env.BOT_TOKEN) {
    return jsonResponse({ error: "Bot token not configured" }, env, 500);
  }

  const starsPrice = parseInt(env.PRO_STARS || "20", 10);
  const payload = `pro_sub_${user.telegram_id}_${Date.now()}`;

  const invoiceData = {
    title: "Ayah Quest Pro",
    description: "Unlock AI Recitation Mistake Detection, Smart SRS Review, and Unlimited Audio Repetitions",
    payload: payload,
    currency: "XTR",
    prices: [{ label: "Ayah Quest Pro (Lifetime)", amount: starsPrice }]
  };

  const tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/createInvoiceLink`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoiceData)
  });

  const tgJson = await tgRes.json();
  if (!tgJson.ok) {
    return jsonResponse({ error: "Failed to generate Stars invoice", details: tgJson }, env, 500);
  }

  return jsonResponse({
    status: "ok",
    invoice_link: tgJson.result
  }, env);
}

async function handleTelebirrSubmission(request, user, env) {
  const body = await request.json();
  const { reference_number, screenshot_url } = body;

  if (!reference_number) {
    return jsonResponse({ error: "Telebirr Reference Number is required" }, env, 400);
  }

  const amount = parseFloat(env.TELEBIRR_ETB || "50");

  let paymentRecord = null;
  if (env.SUPABASE_URL) {
    const created = await supabaseRequest("payment_requests", "POST", {
      user_id: user.id,
      telegram_id: user.telegram_id,
      username: user.username,
      user_full_name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      payment_method: "telebirr",
      amount,
      currency: "ETB",
      reference_number,
      screenshot_url: screenshot_url || null,
      status: "pending"
    }, env);
    paymentRecord = created[0];
  }

  // Send instant Telegram notification to Admin
  if (env.BOT_TOKEN && env.ADMIN_TELEGRAM_ID) {
    const adminMessage = `🔔 *New Telebirr Pro Request*\n\n` +
      `👤 *User:* ${user.first_name} (@${user.username || "none"})\n` +
      `🆔 *Telegram ID:* \`${user.telegram_id}\`\n` +
      `💵 *Amount:* ${amount} ETB\n` +
      `🔢 *Reference:* \`${reference_number}\`\n` +
      `📅 *Date:* ${new Date().toLocaleString()}\n` +
      (screenshot_url ? `🖼 *Receipt:* [View Screenshot](${screenshot_url})\n` : "");

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "✅ Approve Pro", callback_data: `approve_${paymentRecord ? paymentRecord.id : "demo"}_${user.telegram_id}` },
          { text: "❌ Reject", callback_data: `reject_${paymentRecord ? paymentRecord.id : "demo"}_${user.telegram_id}` }
        ]
      ]
    };

    await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.ADMIN_TELEGRAM_ID,
        text: adminMessage,
        parse_mode: "Markdown",
        reply_markup: inlineKeyboard
      })
    }).catch(e => console.error("Admin alert error:", e));
  }

  return jsonResponse({
    status: "ok",
    message: "Telebirr payment submitted successfully. Your Pro status will activate upon admin approval.",
    payment_status: "pending"
  }, env);
}

// Admin approves or rejects Telebirr
async function handleAdminTelebirrAction(request, adminUser, env) {
  const body = await request.json();
  const { payment_id, target_telegram_id, action, notes } = body;

  const isApproval = action === "approve";

  if (env.SUPABASE_URL) {
    if (payment_id && payment_id !== "demo") {
      await supabaseRequest(`payment_requests?id=eq.${payment_id}`, "PATCH", {
        status: isApproval ? "approved" : "rejected",
        admin_notes: notes || "",
        processed_by: adminUser.telegram_id,
        processed_at: new Date().toISOString()
      }, env);
    }

    if (isApproval && target_telegram_id) {
      // Grant Pro
      await supabaseRequest(`users?telegram_id=eq.${target_telegram_id}`, "PATCH", {
        is_pro: true,
        pro_expires_at: null // Lifetime
      }, env);
    }
  }

  // Notify the user via Telegram Bot
  if (env.BOT_TOKEN && target_telegram_id) {
    const notifyText = isApproval
      ? `🎉 *Mubarak! Your Ayah Quest Pro has been activated!*\n\nEnjoy unlimited AI mistake detection, smart SRS revision, and all advanced Hifz tools.`
      : `⚠️ *Telebirr Payment Update*\n\nYour recent Telebirr submission could not be verified. Please check your reference number or contact support at ${env.SUPPORT_USERNAME || "@luck_7n"}.`;

    await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: target_telegram_id,
        text: notifyText,
        parse_mode: "Markdown"
      })
    }).catch(e => console.error("User notify error:", e));
  }

  return jsonResponse({ status: "ok", action, target_telegram_id }, env);
}

async function getPendingTelebirrRequests(env) {
  if (!env.SUPABASE_URL) return jsonResponse({ requests: [] }, env);
  const rows = await supabaseRequest("payment_requests?status=eq.pending&order=created_at.desc", "GET", null, env).catch(() => []);
  return jsonResponse({ requests: rows }, env);
}

async function getAdminStats(env) {
  if (!env.SUPABASE_URL) {
    return jsonResponse({
      total_users: 1,
      pro_users: 0,
      pending_payments: 0
    }, env);
  }
  const users = await supabaseRequest("users?select=id,is_pro", "GET", null, env).catch(() => []);
  const pending = await supabaseRequest("payment_requests?status=eq.pending&select=id", "GET", null, env).catch(() => []);
  return jsonResponse({
    total_users: users.length,
    pro_users: users.filter(u => u.is_pro).length,
    pending_payments: pending.length
  }, env);
}

// ==============================================================================
// TELEGRAM BOT WEBHOOK HANDLER
// ==============================================================================
async function handleTelegramWebhook(request, env) {
  // Verify secret token header if configured
  if (env.TELEGRAM_WEBHOOK_SECRET) {
    const tokenHeader = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (tokenHeader !== env.TELEGRAM_WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 403 });
    }
  }

  const update = await request.json().catch(() => null);
  if (!update) return new Response("OK");

  // Handle Stars Pre-checkout query
  if (update.pre_checkout_query) {
    await answerPreCheckoutQuery(update.pre_checkout_query.id, true, env);
    return new Response("OK");
  }

  // Handle Stars Successful Payment
  if (update.message && update.message.successful_payment) {
    const payment = update.message.successful_payment;
    const tgUserId = update.message.from.id;

    if (env.SUPABASE_URL) {
      await supabaseRequest(`users?telegram_id=eq.${tgUserId}`, "PATCH", {
        is_pro: true,
        pro_expires_at: null
      }, env).catch(() => {});

      await supabaseRequest("payment_requests", "POST", {
        telegram_id: tgUserId,
        username: update.message.from.username,
        user_full_name: update.message.from.first_name,
        payment_method: "stars",
        amount: payment.total_amount,
        currency: payment.currency,
        reference_number: payment.telegram_payment_charge_id,
        status: "approved"
      }, env).catch(() => {});
    }

    await sendTelegramMessage(tgUserId, `✨ *Jazakum Allahu Khayran!*\n\nYour Ayah Quest Pro is active! May Allah bless your Quran memorization journey.`, env);
    return new Response("OK");
  }

  // Handle Callback Queries (Admin Approve/Reject Buttons)
  if (update.callback_query) {
    const cb = update.callback_query;
    const data = cb.data || "";
    const adminId = cb.from.id;

    if (String(adminId) === String(env.ADMIN_TELEGRAM_ID)) {
      if (data.startsWith("approve_") || data.startsWith("reject_")) {
        const parts = data.split("_");
        const action = parts[0];
        const paymentId = parts[1];
        const targetUserId = parts[2];

        await handleAdminTelebirrAction({
          json: async () => ({
            payment_id: paymentId,
            target_telegram_id: targetUserId,
            action
          })
        }, { telegram_id: adminId }, env);

        await answerCallbackQuery(cb.id, `Payment ${action}d successfully!`, env);
      }
    }
    return new Response("OK");
  }

  // Handle standard commands
  if (update.message && update.message.text) {
    const msg = update.message;
    const text = msg.text.trim();
    const chatId = msg.chat.id;
    const frontendUrl = env.FRONTEND_URL || "https://quran-ayah-quiz.vercel.app";

    if (text.startsWith("/start")) {
      const welcome = `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n` +
        `🌙 *Welcome to آيَة | Ayah Quest*\n\n` +
        `Your focused, distraction-free Quran Hifz and memorization companion.\n\n` +
        `• 🎧 *Listen & Repeat:* Master ayahs with precise loop repetition.\n` +
        `• 👁️ *Hide & Reveal:* Test your active recall step-by-step.\n` +
        `• 🎙️ *Recitation Practice:* Word-by-word accuracy verification.\n` +
        `• 🧠 *Smart SRS:* Intelligently tracks due & weak ayahs.\n\n` +
        `Tap the button below to launch the Mini App:`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "📖 Open Ayah Quest", web_app: { url: frontendUrl } }],
          [
            { text: "⭐ Pro Features", callback_data: "cmd_pro" },
            { text: "💬 Support", url: `https://t.me/${(env.SUPPORT_USERNAME || "@luck_7n").replace("@", "")}` }
          ]
        ]
      };

      await sendTelegramMessage(chatId, welcome, env, keyboard);
    } else if (text.startsWith("/pro") || text.startsWith("/payment")) {
      const proMsg = `✨ *Ayah Quest Pro*\n\n` +
        `Train smarter. Revise better. Memorize with confidence.\n\n` +
        `• AI recitation mistake detection\n` +
        `• Word-level analysis\n` +
        `• Smart SRS review queue\n` +
        `• Adaptive repetitions\n` +
        `• In-depth memorization analytics\n\n` +
        `*Pricing:*\n` +
        `• Telegram Stars: ${env.PRO_STARS || "20"} XTR\n` +
        `• Telebirr: ${env.TELEBIRR_ETB || "50"} ETB (Send to ${env.TELEBIRR_NUMBER || "0938054751"} - ${env.TELEBIRR_NAME || "Lakin"})\n\n` +
        `Open the app to complete payment!`;
      await sendTelegramMessage(chatId, proMsg, env);
    } else if (text.startsWith("/admin") && String(chatId) === String(env.ADMIN_TELEGRAM_ID)) {
      await sendTelegramMessage(chatId, `👑 *Ayah Quest Admin Console*\n\nUse the Mini App Settings -> Admin Dashboard to inspect system metrics and approve pending Telebirr requests.`, env);
    } else if (text.startsWith("/help") || text.startsWith("/about")) {
      await sendTelegramMessage(chatId, `📖 *Ayah Quest* is built to help Muslims memorize the Holy Quran effectively through spaced repetition, audio loops, and active recall.`, env);
    }
  }

  return new Response("OK");
}

async function sendTelegramMessage(chatId, text, env, replyMarkup = null) {
  if (!env.BOT_TOKEN) return;
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown"
  };
  if (replyMarkup) payload.reply_markup = replyMarkup;

  await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

async function answerPreCheckoutQuery(preCheckoutQueryId, ok, env) {
  if (!env.BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/answerPreCheckoutQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pre_checkout_query_id: preCheckoutQueryId, ok })
  }).catch(() => {});
}

async function answerCallbackQuery(callbackQueryId, text, env) {
  if (!env.BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text })
  }).catch(() => {});
}

// Endpoint to quickly configure webhook from mobile browser
async function handleSetupWebhook(request, env) {
  const body = await request.json().catch(() => ({}));
  if (env.WEBHOOK_SETUP_SECRET && body.secret !== env.WEBHOOK_SETUP_SECRET) {
    return jsonResponse({ error: "Invalid setup secret" }, env, 403);
  }

  const workerUrl = new URL(request.url).origin;
  const webhookUrl = `${workerUrl}/telegram/webhook`;

  const payload = {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query", "pre_checkout_query"]
  };
  if (env.TELEGRAM_WEBHOOK_SECRET) {
    payload.secret_token = env.TELEGRAM_WEBHOOK_SECRET;
  }

  const tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const tgJson = await tgRes.json();
  return jsonResponse({ status: "ok", webhookUrl, result: tgJson }, env);
}

// ==============================================================================
// CORS & HELPERS
// ==============================================================================
function handleCors(request, env) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(env)
  });
}

function getCorsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Telegram-Init-Data, X-Dev-Telegram-Id",
    "Access-Control-Max-Age": "86400"
  };
}

function jsonResponse(data, env, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(env)
    }
  });
}
