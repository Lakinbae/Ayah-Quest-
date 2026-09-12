/**
 * آيَة | Ayah Quest
 * Production Quran Hifz & Spaced Repetition Memorization Application
 */

import React, { useState, useEffect } from 'react';
import { Flame, Moon, Sun } from 'lucide-react';
import { TabType, UserProfile, Ayah, SrsReviewRecord } from './types';
import { SURAHS_DATA } from './data/quranData';

import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { HifzView } from './components/HifzView';
import { QuranView } from './components/QuranView';
import { QuizView } from './components/QuizView';
import { ProgressView } from './components/ProgressView';
import { ProfileView } from './components/ProfileView';

import { RecallModesModal } from './components/RecallModesModal';
import {
  syncUserProfileToCloud,
  fetchUserProfileFromCloud,
  syncSrsRecordsToCloud,
  fetchSrsRecordsFromCloud,
  isSupabaseConfigured,
} from './lib/supabase';

const DEFAULT_USER: UserProfile = {
  id: 'hafiz-' + Math.floor(100000 + Math.random() * 900000),
  telegram_id: 6545688842,
  first_name: 'Seeker',
  last_name: '',
  username: 'hafiz_seeker',
  bio: 'Bismillah — Striving to memorize the Holy Quran for the sake of Allah.',
  current_streak: 0,
  best_streak: 0,
  today_reviewed: 0,
  daily_goal: 5,
  target_surah: 1,
  target_surah_name: 'Al-Fatihah',
  preferred_reciter: 'ar.alafasy',
  font_size: 28,
  theme: 'dark',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('duel') || params.get('challenge') || params.get('room') || params.get('tgWebAppStartParam')) {
        return 'quiz';
      }
      const tgParam = (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param;
      if (tgParam && (tgParam.startsWith('duel') || tgParam.startsWith('room'))) {
        return 'quiz';
      }
    } catch {}
    return 'home';
  });
  const [targetHifzSurah, setTargetHifzSurah] = useState<number | undefined>(undefined);

  // User state - starts with authentic clean storage (0/5 clean start)
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ayah_quest_user_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_USER,
            ...parsed,
            target_surah: parsed.target_surah || 1,
            target_surah_name: parsed.target_surah_name || 'Al-Fatihah',
            today_reviewed: typeof parsed.today_reviewed === 'number' ? parsed.today_reviewed : 0,
            daily_goal: parsed.daily_goal || 5,
          };
        }
      } catch {}
    }

    return DEFAULT_USER;
  });

  // SRS Ledger of reviewed/graded ayahs
  const [srsRecords, setSrsRecords] = useState<SrsReviewRecord[]>(() => {
    const saved = localStorage.getItem('ayah_srs_records_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Modals state
  const [isRecallModalOpen, setIsRecallModalOpen] = useState<boolean>(false);
  const [recallAyahs, setRecallAyahs] = useState<Ayah[]>(SURAHS_DATA[1].ayahs);

  // Sync user changes to localStorage
  useEffect(() => {
    localStorage.setItem('ayah_quest_user_v4', JSON.stringify(user));
  }, [user]);

  // Sync SRS records
  useEffect(() => {
    localStorage.setItem('ayah_srs_records_v1', JSON.stringify(srsRecords));
  }, [srsRecords]);

  // Global Theme application (light / dark / system)
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      user.theme === 'dark' ||
      (user.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [user.theme]);

  // Telegram Mini App viewport & user identity initialization
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#064e3b');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#0a0908');

      // Detect real Telegram user identity if available
      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser && tgUser.id) {
        setUser((prev) => {
          const updated = {
            ...prev,
            telegram_id: tgUser.id,
            first_name: tgUser.first_name || prev.first_name,
            last_name: tgUser.last_name || prev.last_name,
            username: tgUser.username || prev.username,
          };
          return updated;
        });

        // If Supabase is active, restore user's saved data from cloud
        if (isSupabaseConfigured) {
          fetchUserProfileFromCloud(tgUser.id).then((cloudProfile) => {
            if (cloudProfile) {
              setUser((prev) => ({ ...prev, ...cloudProfile }));
            }
          });
          fetchSrsRecordsFromCloud(tgUser.id).then((cloudSrs) => {
            if (cloudSrs && cloudSrs.length > 0) {
              setSrsRecords(cloudSrs);
            }
          });
        }
      }
    }
  }, []);

  // Sync user changes to cloud in the background if Supabase is configured
  useEffect(() => {
    if (isSupabaseConfigured && user.telegram_id) {
      syncUserProfileToCloud(user);
    }
  }, [user]);

  // Sync SRS records to cloud in the background
  useEffect(() => {
    if (isSupabaseConfigured && user.telegram_id && srsRecords.length > 0) {
      syncSrsRecordsToCloud(user.telegram_id, srsRecords);
    }
  }, [srsRecords, user.telegram_id]);

  const handleToggleTheme = (theme: 'light' | 'dark' | 'system') => {
    setUser((prev) => ({ ...prev, theme }));
  };

  const handleReciterChange = (id: string) => {
    setUser((prev) => ({ ...prev, preferred_reciter: id }));
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const handleResetProgress = () => {
    setUser((prev) => ({
      ...prev,
      today_reviewed: 0,
      current_streak: 0,
      best_streak: 0,
    }));
    setSrsRecords([]);
    localStorage.removeItem('ayah_srs_records_v1');
    localStorage.removeItem('ayah_daily_history_v1');
  };

  // Called when user completes an ayah or grades it (Known / Hesitant / Weak)
  const handleLogReview = (ayah: Ayah, rating: 'perfect' | 'hesitant' | 'weak') => {
    // 1. Update user streak and count
    setUser((prev) => {
      const nextCount = prev.today_reviewed + 1;
      const nextStreak = prev.current_streak === 0 ? 1 : prev.current_streak;
      return {
        ...prev,
        today_reviewed: nextCount,
        current_streak: nextStreak,
        best_streak: Math.max(prev.best_streak, nextStreak),
      };
    });

    // 2. Record in daily history
    try {
      const todayKey = new Date().toISOString().split('T')[0];
      const historyStr = localStorage.getItem('ayah_daily_history_v1');
      const history = historyStr ? JSON.parse(historyStr) : {};
      history[todayKey] = (history[todayKey] || 0) + 1;
      localStorage.setItem('ayah_daily_history_v1', JSON.stringify(history));
    } catch {}

    // 3. Save into SRS review records ledger
    const newRecord: SrsReviewRecord = {
      id: `srs-${ayah.surahNumber}-${ayah.number}`,
      surahNumber: ayah.surahNumber,
      surahName: ayah.surahName,
      ayahNumber: ayah.number,
      text: ayah.text,
      translation: ayah.translation,
      rating,
      reviewedAt: new Date().toISOString(),
      nextReviewAt: new Date(
        Date.now() + (rating === 'perfect' ? 7 : rating === 'hesitant' ? 3 : 1) * 86400000
      ).toISOString(),
      repetitionCount: 1,
    };

    setSrsRecords((prev) => {
      const filtered = prev.filter((r) => r.id !== newRecord.id);
      return [newRecord, ...filtered];
    });
  };

  const handleNavigate = (tab: TabType, targetSurah?: number) => {
    if (targetSurah) {
      setTargetHifzSurah(targetSurah);
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-stone-950 text-stone-800 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/90 dark:border-stone-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-serif font-bold text-lg shadow-xs">
              آ
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-emerald-950 dark:text-emerald-400 leading-none">
                آيَة <span className="text-stone-300 dark:text-stone-600 font-normal">|</span> Ayah Quest
              </h1>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                Quran Hifz & Spaced Repetition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-black shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{user.current_streak}</span>
            </div>

            {/* Quick Theme Toggle */}
            <button
              onClick={() => handleToggleTheme(user.theme === 'dark' ? 'light' : 'dark')}
              title="Toggle Theme"
              className="p-1.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-all shadow-xs"
            >
              {user.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 pb-28">
        {activeTab === 'home' && (
          <HomeView
            user={user}
            srsRecords={srsRecords}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'hifz' && (
          <HifzView
            user={user}
            currentReciterId={user?.preferred_reciter || 'ar.alafasy'}
            initialSurah={targetHifzSurah || user?.target_surah || 1}
            targetSurahNum={targetHifzSurah || user?.target_surah || 1}
            onSurahChange={(surahNum) => setTargetHifzSurah(surahNum)}
            onReciterChange={handleReciterChange}
            onLogReview={handleLogReview}
            onOpenRecallModes={(ayahs) => {
              setRecallAyahs(ayahs);
              setIsRecallModalOpen(true);
            }}
          />
        )}

        {activeTab === 'quran' && (
          <QuranView
            currentReciterId={user?.preferred_reciter || 'ar.alafasy'}
            initialSurah={targetHifzSurah || user?.target_surah || 1}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView />
        )}

        {activeTab === 'progress' && (
          <ProgressView user={user} srsRecords={srsRecords} />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            onToggleTheme={handleToggleTheme}
            currentReciterId={user.preferred_reciter}
            onReciterChange={handleReciterChange}
            onUpdateUser={handleUpdateUser}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setTargetHifzSurah(undefined);
          setActiveTab(tab);
        }}
      />

      {/* Interactive Active Recall Modes Modal (Word masking, first-letter hint, tap-to-reveal) */}
      <RecallModesModal
        isOpen={isRecallModalOpen}
        onClose={() => setIsRecallModalOpen(false)}
        ayahs={recallAyahs}
        currentReciterId={user.preferred_reciter}
      />
    </div>
  );
}
