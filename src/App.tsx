/**
 * آيَة | Ayah Quest
 * Production Quran Hifz & Spaced Repetition Memorization Application
 */

import React, { useState, useEffect } from 'react';
import { Flame, Moon, Sun, Sparkles, Shield, Mic } from 'lucide-react';
import { TabType, UserProfile, Ayah, TelebirrPaymentRequest, SrsReviewRecord } from './types';
import { SURAHS_DATA, RECITERS } from './data/quranData';

import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { HifzView } from './components/HifzView';
import { QuranView } from './components/QuranView';
import { QuizView } from './components/QuizView';
import { ProgressView } from './components/ProgressView';
import { ProfileView } from './components/ProfileView';

import { ProModal } from './components/ProModal';
import { AdminModal } from './components/AdminModal';
import { RecallModesModal } from './components/RecallModesModal';
import { RecitationModal } from './components/RecitationModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';

const DEFAULT_USER: UserProfile = {
  id: 'hafiz-' + Math.floor(100000 + Math.random() * 900000),
  telegram_id: 6545688842,
  first_name: 'Seeker',
  last_name: '',
  username: 'hafiz_seeker',
  bio: 'Bismillah — Striving to memorize the Holy Quran for the sake of Allah.',
  is_pro: false,
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
  const [activeTab, setActiveTab] = useState<TabType>('home');
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

  // Telebirr payment queue
  const [telebirrRequests, setTelebirrRequests] = useState<TelebirrPaymentRequest[]>(() => {
    const saved = localStorage.getItem('ayah_telebirr_requests_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Modals state
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState<boolean>(false);
  const [isRecitationModalOpen, setIsRecitationModalOpen] = useState<boolean>(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState<boolean>(false);
  const [activeAyahForRecitation, setActiveAyahForRecitation] = useState<Ayah>(SURAHS_DATA[1].ayahs[0]);
  const [recallAyahs, setRecallAyahs] = useState<Ayah[]>(SURAHS_DATA[1].ayahs);

  // Sync user changes to localStorage
  useEffect(() => {
    localStorage.setItem('ayah_quest_user_v4', JSON.stringify(user));
  }, [user]);

  // Sync SRS records
  useEffect(() => {
    localStorage.setItem('ayah_srs_records_v1', JSON.stringify(srsRecords));
  }, [srsRecords]);

  // Sync telebirr requests
  useEffect(() => {
    localStorage.setItem('ayah_telebirr_requests_v4', JSON.stringify(telebirrRequests));
  }, [telebirrRequests]);

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

  // Telegram Mini App viewport initialization
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#064e3b');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#0a0908');
    }
  }, []);

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

  // Telebirr payment submission (status = 'pending')
  const handleSubmitTelebirr = (reqData: Omit<TelebirrPaymentRequest, 'id' | 'status' | 'created_at'>) => {
    const newReq: TelebirrPaymentRequest = {
      ...reqData,
      id: `tb-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setTelebirrRequests((prev) => [newReq, ...prev]);
  };

  // Admin Manual Approval
  const handleApproveTelebirr = (id: string, telegramId: number) => {
    setTelebirrRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );
    // If approved, unlock Pro access for the user
    if (telegramId === user.telegram_id || user.telegram_id === 6545688842) {
      setUser((prev) => ({ ...prev, is_pro: true }));
    }
  };

  const handleRejectTelebirr = (id: string) => {
    setTelebirrRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
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

          <div className="flex items-center gap-1.5">
            {/* Voice Search Button */}
            <button
              onClick={() => setIsVoiceSearchOpen(true)}
              title="Voice Search Quran (Recite or speak an Ayah)"
              className="p-2 rounded-full bg-emerald-600/10 border border-emerald-600/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-600/20 transition-all active:scale-95 shadow-xs"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-black shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{user.current_streak}</span>
            </div>

            {/* Pro Badge */}
            <button
              id="header-pro-badge"
              onClick={() => setIsProModalOpen(true)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider transition-all shadow-xs ${
                user.is_pro
                  ? 'bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-400/40'
                  : 'bg-emerald-600/10 border border-emerald-600/20 text-emerald-800 dark:text-emerald-300 hover:scale-102'
              }`}
            >
              {user.is_pro ? 'PRO' : 'GET PRO'}
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
            onOpenPro={() => setIsProModalOpen(true)}
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
            onOpenRecitation={(ayah) => {
              setActiveAyahForRecitation(ayah);
              setIsRecitationModalOpen(true);
            }}
            onOpenRecallModes={(ayahs) => {
              setRecallAyahs(ayahs);
              setIsRecallModalOpen(true);
            }}
            onOpenPro={() => setIsProModalOpen(true)}
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
            onOpenPro={() => setIsProModalOpen(true)}
            onOpenAdmin={() => setIsAdminModalOpen(true)}
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
        onOpenPro={() => setIsProModalOpen(true)}
        isPro={user.is_pro}
      />

      {/* Modals */}
      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        onSubmitTelebirr={handleSubmitTelebirr}
        onActivateProInstant={() => setUser((prev) => ({ ...prev, is_pro: true }))}
        isPro={user.is_pro}
        user={user}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        requests={telebirrRequests}
        onApprove={handleApproveTelebirr}
        onReject={handleRejectTelebirr}
      />

      <RecallModesModal
        isOpen={isRecallModalOpen}
        onClose={() => setIsRecallModalOpen(false)}
        ayahs={recallAyahs}
        currentReciterId={user.preferred_reciter}
      />

      <RecitationModal
        isOpen={isRecitationModalOpen}
        onClose={() => setIsRecitationModalOpen(false)}
        ayah={activeAyahForRecitation}
        onLogReview={handleLogReview}
      />

      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onSelectAyah={(surahNum, ayahNum) => {
          setIsVoiceSearchOpen(false);
          const foundAyah = SURAHS_DATA[surahNum]?.ayahs?.find((a) => a.number === ayahNum);
          if (foundAyah) {
            setActiveAyahForRecitation(foundAyah);
          }
          setTargetHifzSurah(surahNum);
          setActiveTab('quran');
        }}
      />
    </div>
  );
}
