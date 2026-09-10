# 📱 Mobile Deployment Guide: آيَة | Ayah Quest
### Complete Step-by-Step Instructions for Android Phone + Chrome Browser

This guide is written specifically for deploying the complete **Ayah Quest** system (Supabase database, Cloudflare Worker backend, Telegram Bot Webhook, and Vercel frontend) entirely from an **Android smartphone using Google Chrome**. No desktop computer or terminal is required.

---

## Quick Architecture Overview
- **Database:** Supabase (PostgreSQL with RLS & Storage)
- **Backend:** Cloudflare Workers (`https://ayah-backend1.lakin-awel.workers.dev`)
- **Frontend:** Vercel (`https://quran-ayah-quiz.vercel.app`)
- **Platform:** Telegram Mini App (accessed via your Telegram Bot)
- **Admin ID:** `6545688842` | **Support:** `@luck_7n`

---

## Step 1: Create Supabase Project on Phone

1. Open **Google Chrome** on your Android phone.
2. Go to **[supabase.com](https://supabase.com)** and tap **Start your project** (log in with GitHub or Email).
3. Tap **New Project**.
4. Set:
   - **Name:** `ayah-quest`
   - **Database Password:** Choose a strong password (save it in your phone notes).
   - **Region:** Pick a region close to your users (e.g., *Frankfurt eu-central-1* or *Dubai*).
   - **Pricing Plan:** Free tier.
5. Tap **Create new project** and wait 60 seconds for provisioning.

---

## Step 2: Run Database `schema.sql` on Phone

1. In Supabase, tap the **hamburger menu (☰)** in the top-left corner.
2. Select **SQL Editor**.
3. Tap **+ New Query**.
4. In Ayah Quest project files, open `supabase/schema.sql`, tap **Select All** and **Copy**.
5. Paste the entire SQL code into the Supabase query editor on your phone.
6. Tap the green **Run** button at the bottom right.
7. Confirm the result banner displays: `Success. No rows returned`.
   *(All 13 tables, indexes, constraints, and initial achievements are now created!)*

---

## Step 3: Copy Supabase URL and Secret Key

1. Tap **Project Settings** (gear icon ⚙️ in bottom left menu).
2. Tap **API** under Configuration.
3. Find and copy:
   - **Project URL** (e.g., `https://abcdefghijklm.supabase.co`)
   - **service_role (secret) key** (Tap *Reveal* and copy the long `eyJ...` token).
   *(⚠️ Keep this secret safe in your notes. Never share it with anyone!)*

---

## Step 4: Obtain Telegram Bot Token from @BotFather

1. Open the **Telegram app** on your phone.
2. Search for `@BotFather` (verified checkmark).
3. Send `/newbot`.
4. Name your bot (e.g., `Ayah Quest Companion`).
5. Choose a username ending in `bot` (e.g., `AyahQuestBot`).
6. BotFather will reply with your **HTTP API Token** (e.g., `123456789:ABCdefGHIjklMNO...`). Copy this token.
7. Send `/setmenubutton` to BotFather:
   - Choose your bot.
   - Send the button title: `📖 Open Ayah Quest`
   - Send the URL: `https://quran-ayah-quiz.vercel.app`

---

## Step 5: Setup Cloudflare Worker on Phone

1. In Chrome, navigate to **[dash.cloudflare.com](https://dash.cloudflare.com)** and sign in.
2. Tap **Compute (Workers & Pages)** in the sidebar.
3. Tap **Create application** ➔ **Create Worker**.
4. Name the worker `ayah-backend1`. Tap **Deploy**.
5. Tap **Edit code** on your phone:
   - Clear the default code.
   - Open `worker/worker.js` from the Ayah Quest package, copy all code, and paste it into the Cloudflare web editor.
   - Tap **Deploy** (top-right).

---

## Step 6: Add Cloudflare Environment Variables & Secrets

1. Back on the Worker overview page, tap the **Settings** tab.
2. Select **Variables and Secrets**.
3. Under **Environment Variables (Plain text)**, tap **Add**:
   - `ADMIN_TELEGRAM_ID` = `6545688842`
   - `FRONTEND_URL` = `https://quran-ayah-quiz.vercel.app`
   - `SUPPORT_USERNAME` = `@luck_7n`
   - `TELEBIRR_NUMBER` = `0938054751`
   - `TELEBIRR_NAME` = `Lakin`
   - `PRO_STARS` = `20`
   - `TELEBIRR_ETB` = `50`
4. Under **Worker Secrets (Encrypted)**, tap **Add**:
   - `BOT_TOKEN` = *(Paste your Telegram bot token from Step 4)*
   - `SUPABASE_URL` = *(Paste your Supabase URL from Step 3)*
   - `SUPABASE_SECRET_KEY` = *(Paste your Supabase service_role secret from Step 3)*
   - `TELEGRAM_WEBHOOK_SECRET` = *(Choose any 24+ character random string)*
   - `WEBHOOK_SETUP_SECRET` = `AyahQuest2026Setup`
5. Tap **Save and Deploy**.

---

## Step 7: Activate Telegram Bot Webhook (Directly from Phone Chrome)

You don't need curl! Just open Chrome on your phone and enter this URL:

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://ayah-backend1.lakin-awel.workers.dev/telegram/webhook&secret_token=<YOUR_TELEGRAM_WEBHOOK_SECRET>
```

Replace `<YOUR_BOT_TOKEN>` and `<YOUR_TELEGRAM_WEBHOOK_SECRET>` with your actual values.

The browser will respond with:
```json
{"ok": true, "result": true, "description": "Webhook was set"}
```
Your bot is now connected to Cloudflare Workers!

---

## Step 8: Deploy Frontend to Vercel on Phone

1. Go to **[github.com](https://github.com)** in Chrome:
   - Create a new repository named `ayah-quest`.
   - Upload the project files (or push via GitHub mobile app / Git).
2. Go to **[vercel.com](https://vercel.com)** and log in with GitHub.
3. Tap **Add New... ➔ Project**.
4. Import your `ayah-quest` repository.
5. In build settings, the default static build will deploy to `https://quran-ayah-quiz.vercel.app`.
6. Tap **Deploy**. Within 40 seconds your frontend is live!

---

## Step 9: Testing & Verification

1. **Open your Telegram Bot:** Send `/start`. The bot will respond with the Islamic greeting and an inline button: `📖 Open Ayah Quest`.
2. **Launch Mini App:** Tap the button. The app opens inside Telegram WebView with your Telegram photo, first name, and streak.
3. **Test Hifz Studio:**
   - Tap **Hifz** on bottom bar.
   - Choose Surah Al-Mulk, Ayahs 1 to 5.
   - Press **Play Audio** to test reciter playback.
   - Tap **Hide / Reveal** to test active recall.
   - Tap **Recitation Practice** and recite into your phone microphone.
4. **Test Telebirr Flow:**
   - Go to **Pro** page.
   - Select **Telebirr (50 ETB)**.
   - Enter a test Telebirr Reference Number and submit.
   - Because your admin ID is `6545688842`, you will receive an instant Telegram message with `Approve Pro` / `Reject` buttons!
   - Tap **Approve Pro** directly in Telegram to verify automatic Pro activation.

---

## Troubleshooting Common Mobile Issues

- **Blank screen inside Telegram WebView:**
  - Ensure your Vercel deployment URL uses `https://` (Telegram blocks non-HTTPS).
  - Check Chrome developer console via Remote Debugging or verify `index.html` loads directly in Chrome mobile browser.
- **Audio does not play:**
  - Ensure mobile silent/mute switch is off.
  - Browser permissions: Tap the lock icon in Chrome address bar and ensure sound & microphone are set to *Allowed*.
- **Admin commands not working:**
  - Verify your numerical Telegram ID matches `ADMIN_TELEGRAM_ID=6545688842`. Send `/start` to `@userinfobot` on Telegram if unsure of your ID.
