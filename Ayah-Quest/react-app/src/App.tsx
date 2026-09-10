/**
 * آيَة | Ayah Quest
 * Production Telegram Mini App for Quran Hifz & Spaced Repetition Memorization
 */

import React, { useState, useEffect } from 'react';
import { Download, Flame, Moon, Sun, Sparkles, Shield } from 'lucide-react';
import { TabType, UserProfile, Ayah, TelebirrPaymentRequest } from './types';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // User state
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ayah_quest_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      id: 'local-user-id',
      telegram_id: 123456789,
      first_name: 'Tariq',
      username: 'quran_seeker',
      is_pro: false,
      current_streak: 5,
      best_streak: 14,
      today_reviewed: 7,
      daily_goal: 10,
      preferred_reciter: 'ar.alafasy',
      font_size: 28,
      theme: 'dark',
    };
  });

  // Telebirr payment queue
  const [telebirrRequests, setTelebirrRequests] = useState<TelebirrPaymentRequest[]>(() => {
    const saved = localStorage.getItem('ayah_telebirr_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'tb-1',
        telegram_id: 987654321,
        username: 'abdul_rahman',
        full_name: 'Abdul Rahman',
        amount: 50,
        reference_number: '5HB987123A',
        screenshot_url: 'receipt_telebirr_50etb.jpg',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ];
  });

  // Modals state
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState<boolean>(false);
  const [isRecitationModalOpen, setIsRecitationModalOpen] = useState<boolean>(false);
  const [activeAyahForRecitation, setActiveAyahForRecitation] = useState<Ayah>(SURAHS_DATA[67].ayahs[0]);
  const [recallAyahs, setRecallAyahs] = useState<Ayah[]>(SURAHS_DATA[67].ayahs);

  // Sync user changes to localStorage
  useEffect(() => {
    localStorage.setItem('ayah_quest_user', JSON.stringify(user));
  }, [user]);

  // Sync telebirr requests
  useEffect(() => {
    localStorage.setItem('ayah_telebirr_requests', JSON.stringify(telebirrRequests));
  }, [telebirrRequests]);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    if (user.theme === 'dark' || (user.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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

  const handleDownloadZip = () => {
    const link = document.createElement('a');
    link.href = '/Ayah-Quest.zip';
    link.download = 'Ayah-Quest.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleTheme = (theme: 'light' | 'dark' | 'system') => {
    setUser(prev => ({ ...prev, theme }));
  };

  const handleReciterChange = (id: string) => {
    setUser(prev => ({ ...prev, preferred_reciter: id }));
  };

  const handleLogReview = (ayah: Ayah, result: 'perfect' | 'hesitant' | 'weak') => {
    setUser(prev => ({
      ...prev,
      today_reviewed: prev.today_reviewed + 1
    }));
  };

  const handleSubmitTelebirr = (reqData: Omit<TelebirrPaymentRequest, 'id' | 'status' | 'created_at'>) => {
    const newReq: TelebirrPaymentRequest = {
      ...reqData,
      id: `tb-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    setTelebirrRequests(prev => [newReq, ...prev]);
  };

  const handleApproveTelebirr = (id: string) => {
    setTelebirrRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'approved' } : r)
    );
    // If approved, promote user to Pro!
    setUser(prev => ({ ...prev, is_pro: true }));
    alert('✅ Payment verified! User has been promoted to Ayah Quest Pro.');
  };

  const handleRejectTelebirr = (id: string) => {
    setTelebirrRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r)
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
              آ
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-emerald-900 dark:text-emerald-400 leading-none">
                آيَة <span className="text-stone-300 dark:text-stone-600 font-normal">|</span> Ayah Quest
              </h1>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                Quran Hifz & Spaced Repetition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{user.current_streak}</span>
            </div>

            {/* Pro Badge */}
            <button
              id="header-pro-badge"
              onClick={() => setIsProModalOpen(true)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider transition-all ${
                user.is_pro
                  ? 'bg-amber-400/20 text-amber-500 border border-amber-400/40'
                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:scale-105'
              }`}
            >
              {user.is_pro ? 'PRO' : 'GET PRO'}
            </button>

            {/* Download Project ZIP Button */}
            <button
              onClick={handleDownloadZip}
              title="Download standalone Ayah-Quest.zip for Telegram deployment"
              className="p-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dynamic View Content Container */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 pb-24">
        {activeTab === 'home' && (
          <HomeView
            user={user}
            onNavigate={setActiveTab}
            onOpenPro={() => setIsProModalOpen(true)}
            onDownloadZip={handleDownloadZip}
          />
        )}

        {activeTab === 'hifz' && (
          <HifzView
            currentReciterId={user.preferred_reciter}
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
          />
        )}

        {activeTab === 'quran' && (
          <QuranView currentReciterId={user.preferred_reciter} />
        )}

        {activeTab === 'quiz' && (
          <QuizView />
        )}

        {activeTab === 'progress' && (
          <ProgressView user={user} />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            onOpenPro={() => setIsProModalOpen(true)}
            onOpenAdmin={() => setIsAdminModalOpen(true)}
            onToggleTheme={handleToggleTheme}
            currentReciterId={user.preferred_reciter}
            onReciterChange={handleReciterChange}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenPro={() => setIsProModalOpen(true)}
        isPro={user.is_pro}
      />

      {/* Modals */}
      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        onSubmitTelebirr={handleSubmitTelebirr}
        onActivateProInstant={() => setUser(prev => ({ ...prev, is_pro: true }))}
        isPro={user.is_pro}
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
      />

      <RecitationModal
        isOpen={isRecitationModalOpen}
        onClose={() => setIsRecitationModalOpen(false)}
        ayah={activeAyahForRecitation}
        onLogReview={handleLogReview}
      />
    </div>
  );
}
