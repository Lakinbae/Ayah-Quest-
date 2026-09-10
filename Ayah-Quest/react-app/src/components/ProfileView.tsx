import React from 'react';
import { User, Shield, Moon, Sun, Monitor, Star, ExternalLink, Sliders, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { UserProfile } from '../types';
import { RECITERS } from '../data/quranData';

interface ProfileViewProps {
  user: UserProfile;
  onOpenPro: () => void;
  onOpenAdmin: () => void;
  onToggleTheme: (theme: 'light' | 'dark' | 'system') => void;
  currentReciterId: string;
  onReciterChange: (id: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onOpenPro,
  onOpenAdmin,
  onToggleTheme,
  currentReciterId,
  onReciterChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Telegram User Identity Card */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-xl shadow-sm">
          {user.first_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
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
          <p className="text-xs text-stone-400">@{user.username || 'quran_seeker'}</p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            <Shield className="w-3 h-3 text-emerald-600" />
            <span>Telegram ID: {user.telegram_id}</span>
          </div>
        </div>
      </div>

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
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Speech recognition, deep analysis enabled</p>
            </div>
          </div>
        </div>
      )}

      {/* Reciter & Audio Settings */}
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
