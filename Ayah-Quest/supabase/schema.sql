-- ==============================================================================
-- آيَة | AYAH QUEST - COMPLETE SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Designed for: Cloudflare Workers + Supabase REST + Telegram Mini App
-- Author: Ayah Quest Engineering Team
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    username TEXT,
    language_code TEXT DEFAULT 'en',
    photo_url TEXT,
    is_pro BOOLEAN DEFAULT FALSE,
    pro_expires_at TIMESTAMPTZ,
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Telegram ID lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_is_pro ON public.users(is_pro);

-- ------------------------------------------------------------------------------
-- 2. USER SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT UNIQUE NOT NULL,
    theme TEXT DEFAULT 'system', -- 'light', 'dark', 'system'
    preferred_reciter TEXT DEFAULT 'ar.alafasy', -- Alafasy, Husary, Minshawi, etc.
    playback_speed NUMERIC(3,2) DEFAULT 1.0,
    auto_next BOOLEAN DEFAULT TRUE,
    default_repetitions INT DEFAULT 3,
    quran_font_size INT DEFAULT 26,
    show_translation BOOLEAN DEFAULT TRUE,
    show_transliteration BOOLEAN DEFAULT FALSE,
    preferred_translation TEXT DEFAULT 'en.sahih',
    daily_ayah_goal INT DEFAULT 5,
    daily_review_goal INT DEFAULT 10,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. HIFZ PROGRESS TABLE (Per Ayah Tracking)
-- ------------------------------------------------------------------------------
-- Tracks individual ayah mastery, repetitions, and Spaced Repetition (SRS)
CREATE TABLE IF NOT EXISTS public.hifz_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    ayah_number INT NOT NULL CHECK (ayah_number >= 1),
    status TEXT NOT NULL DEFAULT 'learning', -- 'new', 'learning', 'strong', 'weak'
    repetitions_count INT DEFAULT 0,
    successful_recalls INT DEFAULT 0,
    mistake_count INT DEFAULT 0,
    ease_factor NUMERIC(4,2) DEFAULT 2.5, -- SRS ease multiplier
    interval_days INT DEFAULT 1,         -- SRS current interval
    last_reviewed_at TIMESTAMPTZ,
    next_review_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_ayah UNIQUE(user_id, surah_number, ayah_number)
);

CREATE INDEX IF NOT EXISTS idx_hifz_progress_user ON public.hifz_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hifz_progress_telegram ON public.hifz_progress(telegram_id);
CREATE INDEX IF NOT EXISTS idx_hifz_progress_review ON public.hifz_progress(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_hifz_progress_status ON public.hifz_progress(user_id, status);

-- ------------------------------------------------------------------------------
-- 4. REVISION SESSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.revision_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    surah_number INT NOT NULL,
    start_ayah INT NOT NULL,
    end_ayah INT NOT NULL,
    session_type TEXT NOT NULL, -- 'hifz', 'revision', 'recall', 'recitation'
    total_repetitions INT DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    ayahs_reviewed INT DEFAULT 0,
    accuracy_percentage NUMERIC(5,2) DEFAULT 100.0,
    completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.revision_sessions(user_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. AYAH REVIEWS (Individual Review History Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ayah_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    surah_number INT NOT NULL,
    ayah_number INT NOT NULL,
    result TEXT NOT NULL, -- 'perfect', 'hesitant', 'mistake', 'failed'
    mode TEXT NOT NULL,   -- 'audio', 'hide_reveal', 'active_recall', 'recitation'
    repetition_cycle INT DEFAULT 1,
    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_user_ayah ON public.ayah_reviews(user_id, surah_number, ayah_number);

-- ------------------------------------------------------------------------------
-- 6. MISTAKES & RECITATION ANALYSIS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mistakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    surah_number INT NOT NULL,
    ayah_number INT NOT NULL,
    word_index INT,
    expected_word TEXT,
    recited_word TEXT,
    mistake_type TEXT NOT NULL, -- 'missed', 'wrong', 'extra', 'skipped'
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mistakes_user ON public.mistakes(user_id, surah_number, ayah_number);

-- ------------------------------------------------------------------------------
-- 7. GOALS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    goal_type TEXT NOT NULL, -- 'memorize', 'review', 'recite', 'time'
    target_value INT NOT NULL, -- e.g. 5 ayahs, 15 minutes
    period TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekly'
    current_value INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    streak_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id);

-- ------------------------------------------------------------------------------
-- 8. ACHIEVEMENTS & USER ACHIEVEMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'milestone',
    target_value INT NOT NULL
);

INSERT INTO public.achievements (id, title, description, icon, category, target_value)
VALUES 
    ('first_session', 'Bismillah', 'Completed your very first Hifz session', '🌱', 'milestone', 1),
    ('rep_100', 'Centurion of Repetition', 'Completed 100 ayah repetitions', '🔄', 'repetitions', 100),
    ('streak_7', 'Week of Light', 'Maintained a 7-day Hifz streak', '🔥', 'streak', 7),
    ('streak_30', 'Steadfast Memorizer', 'Maintained a 30-day Hifz streak', '✨', 'streak', 30),
    ('surah_complete', 'Surah Master', 'Completed full memorization of a Surah', '📖', 'hifz', 1),
    ('rev_1000', 'Guardian of the Verses', 'Completed 1,000 Ayah reviews', '👑', 'review', 1000)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_achievement UNIQUE(user_id, achievement_id)
);

-- ------------------------------------------------------------------------------
-- 9. BOOKMARKS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    surah_number INT NOT NULL,
    ayah_number INT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_bookmark UNIQUE(user_id, surah_number, ayah_number)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- ------------------------------------------------------------------------------
-- 10. QUIZ RESULTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    quiz_type TEXT NOT NULL, -- 'identify_surah', 'continue_verse', 'missing_words', 'random_recall'
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    score_percentage NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. PAYMENT REQUESTS TABLE (Telebirr + Stars)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    username TEXT,
    user_full_name TEXT,
    payment_method TEXT NOT NULL, -- 'telebirr', 'stars'
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL,       -- 'ETB', 'XTR'
    reference_number TEXT,        -- Telebirr reference number
    screenshot_url TEXT,          -- Uploaded receipt
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_notes TEXT,
    processed_by BIGINT,          -- Admin Telegram ID
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON public.payment_requests(reference_number);

-- ------------------------------------------------------------------------------
-- 12. SAVED CUSTOM HIFZ RANGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_ranges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    title TEXT NOT NULL, -- e.g. "My Daily Review", "Surah Mulk 1-10"
    surah_number INT NOT NULL,
    start_ayah INT NOT NULL,
    end_ayah INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_ranges_user ON public.custom_ranges(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hifz_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ayah_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_ranges ENABLE ROW LEVEL SECURITY;

-- Public achievements are readable by all authenticated requests
CREATE POLICY "Public achievements are viewable by everyone" 
    ON public.achievements FOR SELECT USING (true);

-- Backend Service Role has full access.
-- Direct user access policies can be bound via auth.uid() or Cloudflare Worker service token.
