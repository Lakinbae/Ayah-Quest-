import React, { useState } from 'react';
import { 
  User, Shield, Moon, Sun, Monitor, Star, ExternalLink, 
  CheckCircle2, ChevronRight, Lock, Edit3, Target, BookOpen, 
  Trash2, Save, X, RotateCcw, Award, Volume2, Key, Download, Archive, Code
} from 'lucide-react';
import { UserProfile } from '../types';
import { RECITERS } from '../data/quranData';
import { SURAH_LIST } from '../data/surahList';

interface ProfileViewProps {
  user: UserProfile;
  onOpenPro: () => void;
  onOpenAdmin: () => void;
  onToggleTheme: (theme: 'light' | 'dark' | 'system') => void;
  currentReciterId: string;
  onReciterChange: (id: string) => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onResetProgress: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onOpenPro,
  onOpenAdmin,
  onToggleTheme,
  currentReciterId,
  onReciterChange,
  onUpdateUser,
  onResetProgress,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>(user?.first_name || '');
  const [lastName, setLastName] = useState<string>(user?.last_name || '');
  const [username, setUsername] = useState<string>(user?.username || '');
  const [bio, setBio] = useState<string>(user?.bio || '');
  const [targetSurah, setTargetSurah] = useState<number>(user?.target_surah || 1);
  const [dailyGoal, setDailyGoal] = useState<number>(user?.daily_goal || 5);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [adminTapCount, setAdminTapCount] = useState<number>(0);
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(user?.telegram_id === 6545688842);

  const selectedTargetMeta = SURAH_LIST.find((s) => s.number === (user?.target_surah || 1)) || SURAH_LIST[0];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMeta = SURAH_LIST.find((s) => s.number === targetSurah);
    onUpdateUser({
      first_name: firstName.trim() || 'Seeker',
      last_name: lastName.trim(),
      username: username.trim() || 'seeker',
      bio: bio.trim(),
      target_surah: targetSurah,
      target_surah_name: targetMeta ? targetMeta.englishName : 'Al-Fatihah',
      daily_goal: dailyGoal,
    });
    setIsEditing(false);
  };

  const handleSecretAdminTap = () => {
    const next = adminTapCount + 1;
    setAdminTapCount(next);
    if (next >= 5) {
      setShowAdminPanel(true);
      alert('🔓 Admin Moderation Panel unlocked.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Identity Card (Private & Clean - Telegram ID hidden) */}
      <div className="bg-[#faf8f5] dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs relative">
        <button
          onClick={() => {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setUsername(user.username || '');
            setBio(user.bio || '');
            setTargetSurah(user.target_surah || 1);
            setDailyGoal(user.daily_goal || 5);
            setIsEditing(!isEditing);
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 border border-stone-200 dark:border-stone-700 transition-all shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isEditing ? 'Close' : 'Edit Profile'}</span>
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            {(user.first_name || 'S').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 pr-14">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                {user.first_name} {user.last_name || ''}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                  user.is_pro
                    ? 'bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30'
                    : 'bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {user.is_pro ? 'PRO MEMBER' : 'FREE PLAN'}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">@{user.username || 'hafiz_seeker'}</p>
            {user.bio ? (
              <p className="text-xs text-stone-700 dark:text-stone-300 mt-1.5 italic leading-relaxed">
                "{user.bio}"
              </p>
            ) : (
              <p className="text-xs text-stone-400 mt-1.5 italic">
                No bio set yet. Tap Edit Profile to customize!
              </p>
            )}
          </div>
        </div>

        {/* Current Active Goal Pill */}
        <div className="mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-800 grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-2xl bg-emerald-600/10 border border-emerald-600/20">
            <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <Target className="w-3 h-3" /> Target Surah
            </span>
            <p className="font-extrabold text-stone-900 dark:text-stone-100 mt-0.5 truncate">
              {selectedTargetMeta.number}. {selectedTargetMeta.englishName} ({selectedTargetMeta.name})
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
            <span className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-emerald-600" /> Daily Quota
            </span>
            <p className="font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
              {user.daily_goal} Ayahs / day
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile & Target Surah Form */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-[#faf8f5] dark:bg-stone-900 p-5 rounded-3xl border border-emerald-600/30 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-600" />
              <span>Customize Profile & Memorization Plan</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-stone-400 hover:text-stone-600 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Bilal"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Ahmed"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">Username / Handle</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-stone-400">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
                placeholder="quran_seeker"
                className="w-full pl-7 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">Personal Bio / Intention (Niyyah)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. In the path of memorizing the Holy Quran for the pleasure of Allah."
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Decide which Surah to recite and memorize - ALL 114 SURAHS */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
              Active Surah to Recite & Memorize (Choose from all 114 Surahs)
            </label>
            <select
              value={targetSurah}
              onChange={(e) => setTargetSurah(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600 font-semibold"
            >
              {SURAH_LIST.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.englishName} ({s.name}) — {s.numberOfAyahs} ayahs ({s.revelationType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
              Daily Ayah Goal
            </label>
            <div className="flex items-center gap-2">
              {[3, 5, 7, 10, 15].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setDailyGoal(g)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dailyGoal === g
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile & Targets</span>
          </button>
        </form>
      )}

      {/* Reciter Voice Preference (All reciters including Sheikh Ali Jaber & Nasser Al-Qatami) */}
      <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Preferred Quran Reciter Voice
            </h3>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
            {RECITERS.length} High-Fidelity Reciters
          </span>
        </div>

        <div className="space-y-2">
          {RECITERS.map((r) => {
            const isSelected = r.id === currentReciterId;
            return (
              <div
                key={r.id}
                onClick={() => onReciterChange(r.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-600/10 border-emerald-600/40 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-500/30'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold">{r.name}</h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">{r.style}</p>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="text-[10px] text-stone-400">Select</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* App Appearance & Theme Selection */}
      <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
          Color Theme
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onToggleTheme('light')}
            className={`py-2.5 rounded-2xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
              user.theme === 'light'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>
          <button
            onClick={() => onToggleTheme('dark')}
            className={`py-2.5 rounded-2xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
              user.theme === 'dark'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => onToggleTheme('system')}
            className={`py-2.5 rounded-2xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
              user.theme === 'system'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Progress Reset Tool */}
      <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-2">
        <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
          Reset Progress
        </h3>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2 rounded-2xl border border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress to 0</span>
          </button>
        ) : (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Reset reviewed ayahs and streaks to 0?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onResetProgress();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                Yes, Start Clean Slate
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Project Export & Direct ZIP Download */}
      <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-emerald-600/20 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Export App & ZIP Packages
            </h3>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Ready to deploy
          </span>
        </div>
        <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
          Download clean, fully packaged ZIP archives to push to GitHub or deploy directly to Cloudflare Pages.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Source Code ZIP */}
          <a
            href="/ayah-quest-source.zip"
            download="ayah-quest-source.zip"
            className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Source Code ZIP</p>
                <p className="text-[10px] text-stone-500">For GitHub & Cloudflare</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
          </a>

          {/* Compiled Dist ZIP */}
          <a
            href="/ayah-quest-dist.zip"
            download="ayah-quest-dist.zip"
            className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Archive className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Compiled Dist ZIP</p>
                <p className="text-[10px] text-stone-500">Drag & drop to Cloudflare</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-amber-600 group-hover:translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* Hidden Admin Moderation Panel (Shown only to authorized admin ID 6545688842 or via unlock) */}
      {showAdminPanel && (
        <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-emerald-600/30 shadow-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Admin Telebirr Moderation Panel
              </h3>
            </div>
            <span className="text-[10px] text-emerald-700 font-mono font-bold">Admin ID Verified</span>
          </div>
          <p className="text-[11px] text-stone-600 dark:text-stone-400">
            Review incoming payment screenshots, verify transaction reference numbers, and approve Pro accounts.
          </p>
          <button
            onClick={onOpenAdmin}
            className="w-full py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Open Telebirr Review Queue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Discreet Version & Support Footer */}
      <div className="text-center pt-2 space-y-1">
        <a
          href="https://t.me/luck_7n"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-emerald-600 transition-all"
        >
          <span>Telegram Support:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">@luck_7n</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <p
          onClick={handleSecretAdminTap}
          className="text-[10px] text-stone-400 cursor-pointer select-none"
        >
          آيَة • Ayah Quest v2.5
        </p>
      </div>
    </div>
  );
};
