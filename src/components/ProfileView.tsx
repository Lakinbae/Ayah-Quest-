import React, { useState } from 'react';
import { 
  User, Shield, Moon, Sun, Monitor, Star, ExternalLink, 
  CheckCircle2, ChevronRight, Lock, Edit3, Target, BookOpen, 
  Trash2, Save, X, RotateCcw, Award 
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
  const [firstName, setFirstName] = useState<string>(user.first_name || '');
  const [lastName, setLastName] = useState<string>(user.last_name || '');
  const [username, setUsername] = useState<string>(user.username || '');
  const [bio, setBio] = useState<string>(user.bio || '');
  const [targetSurah, setTargetSurah] = useState<number>(user.target_surah || 1);
  const [dailyGoal, setDailyGoal] = useState<number>(user.daily_goal || 5);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const selectedTargetMeta = SURAH_LIST.find((s) => s.number === (user.target_surah || 1)) || SURAH_LIST[0];

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

  return (
    <div className="space-y-4">
      {/* Identity Card */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm relative">
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
          className="absolute top-4 right-4 p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Close' : 'Edit Profile'}</span>
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
            {(user.first_name || 'S').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 pr-16">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                {user.first_name} {user.last_name || ''}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                  user.is_pro
                    ? 'bg-amber-400/20 text-amber-500 border border-amber-400/30'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                }`}
              >
                {user.is_pro ? 'PRO MEMBER' : 'FREE PLAN'}
              </span>
            </div>
            <p className="text-xs text-stone-400">@{user.username || 'new_hafiz'}</p>
            {user.bio ? (
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 italic">
                "{user.bio}"
              </p>
            ) : (
              <p className="text-xs text-stone-400 mt-1.5 italic">
                No bio set yet. Tap Edit Profile to customize!
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-stone-500 dark:text-stone-400">
              <Shield className="w-3 h-3 text-emerald-600" />
              <span>Telegram ID: {user.telegram_id}</span>
            </div>
          </div>
        </div>

        {/* Current Active Goal Pill */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <Target className="w-3 h-3" /> Target Surah
            </span>
            <p className="font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
              {selectedTargetMeta.number}. {selectedTargetMeta.englishName} ({selectedTargetMeta.name})
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
            <span className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Daily Quota
            </span>
            <p className="font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
              {user.daily_goal} Ayahs / day
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile & Hifz Target Form */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-emerald-500/30 dark:border-emerald-500/30 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-600" />
              <span>Customize Profile & Memorization Target</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Tariq"
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-500 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Ali"
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-500 mb-1">Username / Handle</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-stone-400">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
                placeholder="quran_seeker"
                className="w-full pl-7 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-500 mb-1">Personal Bio / Intention</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. In the path of memorizing the Holy Quran for the sake of Allah."
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Decide which Surah to recite and memorize - ALL 114 SURAHS */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 mb-1">
              Active Surah to Recite & Memorize (Choose from all 114 Surahs)
            </label>
            <select
              value={targetSurah}
              onChange={(e) => setTargetSurah(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600 font-semibold"
            >
              {SURAH_LIST.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.englishName} ({s.name}) — {s.numberOfAyahs} ayahs ({s.revelationType})
                </option>
              ))}
            </select>
          </div>

          {/* Daily Goal */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 mb-1">
              Daily Target Review Goal: {dailyGoal} ayahs
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="30"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="flex-1 accent-emerald-600 cursor-pointer"
              />
              <div className="flex gap-1.5">
                {[3, 5, 10, 15].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDailyGoal(preset)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                      dailyGoal === preset
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Target Goals</span>
          </button>
        </form>
      )}

      {/* Pro Upgrade CTA */}
      {!user.is_pro ? (
        <div
          onClick={onOpenPro}
          className="cursor-pointer bg-gradient-to-r from-emerald-900 to-emerald-950 p-4 rounded-3xl border border-emerald-700/40 text-white flex items-center justify-between shadow-sm hover:border-emerald-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center text-lg">
              ⭐
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Upgrade to Ayah Quest Pro</h4>
              <p className="text-[10px] text-emerald-300">
                50 ETB via Telebirr or 20 Telegram Stars
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition-all">
            Upgrade
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Ayah Quest Pro Active</h4>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Speech recognition, live tajweed feedback unlocked</p>
            </div>
          </div>
        </div>
      )}

      {/* Audio & Reciter Settings */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Audio & Reciter
        </h3>
        <div className="space-y-2">
          {RECITERS.map((r) => (
            <button
              key={r.id}
              onClick={() => onReciterChange(r.id)}
              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                currentReciterId === r.id
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                  : 'border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200'
              }`}
            >
              <div>
                <div className="text-xs font-bold">{r.name}</div>
                <div className="text-[10px] text-stone-400">{r.style}</div>
              </div>
              {currentReciterId === r.id && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Appearance
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onToggleTheme('light')}
            className={`py-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              user.theme === 'light'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>
          <button
            onClick={() => onToggleTheme('dark')}
            className={`py-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              user.theme === 'dark'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => onToggleTheme('system')}
            className={`py-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              user.theme === 'system'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Clean Slate / Reset Progress Option */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
            Reset Progress to Clean Slate
          </h3>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          Start fresh with 0 ayahs reviewed, 0 day streak, and clean review queues.
        </p>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2 rounded-2xl border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress to 0</span>
          </button>
        ) : (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
              Are you sure? This will set reviewed ayahs and streaks to 0.
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

      {/* Admin Panel Access Button for Telegram ID 6545688842 */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Admin Moderation Panel
            </h3>
          </div>
          <span className="text-[10px] text-stone-400">ID: 6545688842</span>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400">
          Review incoming Telebirr payments, verify reference codes, and approve Pro accounts.
        </p>
        <button
          onClick={onOpenAdmin}
          className="w-full py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <span>Open Telebirr Admin Review Panel</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Developer & Support Contact */}
      <div className="text-center pt-2">
        <a
          href="https://t.me/luck_7n"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-emerald-600 transition-all"
        >
          <span>💬 Need help or feedback? Telegram Support:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">@luck_7n</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
