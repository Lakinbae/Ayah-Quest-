# آيَة | Ayah Quest
> **Production-Ready Telegram Quran Hifz & Memorization Companion**

![Ayah Quest](https://img.shields.io/badge/Ayah_Quest-v1.0.0-emerald)
![Telegram Mini App](https://img.shields.io/badge/Platform-Telegram_Mini_App-blue)
![Backend](https://img.shields.io/badge/Backend-Cloudflare_Workers-orange)
![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-green)

---

## 🌟 What is Ayah Quest?

**Ayah Quest** (آيَة) is a purpose-built Quran Hifz and revision companion designed as a modern **Telegram Mini App**. Rather than feeling like a superficial quiz game, it is engineered as a serious, elegant, and distraction-free memorization studio.

### The Core Hifz Pipeline:
```
SELECT QURAN RANGE 
  → LISTEN 
  → REPEAT (1x, 2x, 3x, 5x, 10x, ∞) 
  → MEMORIZE 
  → HIDE 
  → RECALL (7 Active Recall Modes) 
  → RECITE (Web Speech Recognition & Word Diff) 
  → GET FEEDBACK 
  → REVIEW (Smart SRS Queue) 
  → TRACK PROGRESS 
  → IMPROVE
```

---

## 🏗️ Architecture & Technology Stack

```
                     ┌───────────────────────────────┐
                     │     Telegram Mobile App       │
                     └───────────────┬───────────────┘
                                     │
                        Telegram WebApp SDK & initData
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │   Ayah Quest Mobile Frontend  │
                     │  (Vercel / Tailwind CSS / JS) │
                     └───────────────┬───────────────┘
                                     │
                              HTTPS REST API
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │   Cloudflare Workers Backend  │
                     │ (Web Crypto HMAC verification)│
                     └───────┬───────────────┬───────┘
                             │               │
                  REST API / Service Key  Bot Webhook
                             │               │
                             ▼               ▼
        ┌─────────────────────────┐   ┌─────────────────────────┐
        │    Supabase Database    │   │   Telegram Bot API      │
        │(PostgreSQL + RLS + SRS) │   │ (Stars Invoices + Admin)│
        └─────────────────────────┘   └─────────────────────────┘
```

- **Frontend:** HTML5, Tailwind CSS, Modular JavaScript, Telegram WebApp SDK, Mobile-First UI, Web Audio API, Web Speech Recognition.
- **Backend:** Cloudflare Workers (zero cold-start, edge execution, Web Crypto API for HMAC-SHA256 signature verification).
- **Database:** Supabase (PostgreSQL with Row-Level Security, automated indexes, and SRS queue optimization).
- **Payments:** Telegram Stars (official Bot API invoices) and Telebirr (Ethiopian mobile wallet manual verification flow).

---

## 📂 Project Structure

```
Ayah-Quest/
├── frontend/
│   ├── index.html            # Main Telegram Mini App Single-Page Shell
│   ├── pages/                # Modular page views
│   │   ├── home.html         # Dashboard, streak, daily targets
│   │   ├── hifz.html         # Range picker, repetition session, audio player
│   │   ├── quran.html        # Mushaf reader with RTL typography & audio
│   │   ├── quiz.html         # Active recall quizzes (surah/ayah/continue)
│   │   ├── progress.html     # Mastery analytics, charts, weak verses
│   │   ├── profile.html      # Verified Telegram user info, goals
│   │   ├── pro.html          # Pro upgrade (Telebirr + Telegram Stars)
│   │   └── settings.html     # Reciter, theme, font size, reminders
│   ├── js/                   # Clean modular vanilla JavaScript
│   │   ├── app.js            # App coordinator & navigation router
│   │   ├── api.js            # Backend API communication layer
│   │   ├── auth.js           # Telegram initData validator & user state
│   │   ├── hifz.js           # Repetition engine & session manager
│   │   ├── audio.js          # Quran audio streaming player & reciters
│   │   ├── recall.js         # 7 Active recall modes
│   │   ├── recitation.js     # Speech recognition & Arabic word-diff
│   │   ├── quiz.js           # Quiz generator & scoring
│   │   ├── progress.js       # Analytics calculations
│   │   ├── profile.js        # Profile & user preferences
│   │   ├── payments.js       # Stars & Telebirr flow
│   │   ├── storage.js        # Local cache & offline sync
│   │   └── utils.js          # Arabic text normalizers & formatters
│   └── assets/               # Visual assets & icons
├── worker/
│   ├── worker.js             # Cloudflare Worker script
│   ├── wrangler.jsonc        # Worker configuration & environment variables
│   └── package.json          # Worker dependencies
├── supabase/
│   └── schema.sql            # Complete Supabase database schema & RLS
├── .env.example              # Environment variables template
├── DEPLOYMENT-MOBILE.md      # Mobile-only deployment guide for Android
└── README.md                 # Project documentation
```

---

## 🧠 Smart SRS (Spaced Repetition System)

Ayah Quest uses an intelligent SuperMemo-2 based review scheduling algorithm:
- Every ayah is assigned an interval and status:
  - `New`: Not yet memorized.
  - `Learning`: Currently undergoing repetitions (1-3 days interval).
  - `Strong`: Consistently recalled without mistake (3-14 days interval).
  - `Weak`: Mistakes detected or marked hesitant (daily review priority).
- **Today's Review Queue** automatically prioritizes:
  1. Overdue ayahs (`next_review_at <= NOW()`).
  2. Weak ayahs with repeated hesitation.
  3. Recently memorized verses to solidify short-term retention.

---

## 🎙️ Recitation & Mistake Detection

Ayah Quest includes real-time browser recitation analysis using the Web Speech Recognition API with Arabic language models (`ar-SA`).
- Words are normalized to remove tatweel, diacritics, and hamza variations.
- Recited speech is compared word-by-word against verified Quranic text.
- Accurately classifies:
  - **Matched Words** (green)
  - **Missed Words** (red underline)
  - **Extra / Substituted Words** (amber)
- Computes overall recitation accuracy percentage and automatically logs weak words to your review queue.

---

## 💳 Payments: Telegram Stars & Telebirr

### 1. Telegram Stars (20 XTR)
- Generates official Telegram Stars invoices via `/api/create-invoice`.
- Handled seamlessly through Telegram client with zero manual intervention.
- Immediate Pro activation via `successful_payment` bot webhook event.

### 2. Telebirr (50 ETB)
- Dedicated payment screen with Ethiopian mobile money instructions:
  - **Account Number:** `0938054751`
  - **Account Name:** `Lakin`
  - **Price:** `50 ETB`
- Users input their **Telebirr Reference Number** and upload a payment receipt screenshot.
- Submitting triggers an instant Telegram notification to the Administrator (`ADMIN_TELEGRAM_ID=6545688842`) with inline **Approve Pro** / **Reject** buttons.
- Approval immediately promotes the user in Supabase and sends an automated celebratory Telegram notification to the user!

---

## 🔐 Security & Data Integrity

1. **Cryptographic Validation:** Backend validates Telegram `initData` using HMAC-SHA256 with the bot token. No user can impersonate another Telegram ID.
2. **Row-Level Security (RLS):** Supabase tables enforce strict access controls. Service-role key resides strictly in Cloudflare Worker secrets.
3. **No AI-Fabricated Quran Text:** Quran text is sourced strictly from verified Uthmanic text datasets.
4. **Offline Resilience:** Local cache preserves current session repetitions, active ranges, and user preferences even if mobile connection fluctuates.

---

## 📲 Quick Setup

See **[DEPLOYMENT-MOBILE.md](./DEPLOYMENT-MOBILE.md)** for detailed instructions on deploying via Android phone and Chrome browser.
