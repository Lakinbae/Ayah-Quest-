import React from 'react';
import { Play, RotateCcw, Flame, CheckCircle2, ChevronRight, Sparkles, Download, BookOpen, Target } from 'lucide-react';
import { UserProfile, TabType } from '../types';
import { SURAH_LIST } from '../data/surahList';

interface HomeViewProps {
  user: UserProfile;
  onNavigate: (tab: TabType) => void;
  onOpenPro: () => void;
  onDownloadZip: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  onNavigate,
  onOpenPro,
  onDownloadZip,
}) => {
  const percentComplete = user.daily_goal > 0 
    ? Math.min(100, Math.round((user.today_reviewed / user.daily_goal) * 100))
    : 0;

  const targetMeta = SURAH_LIST.find((s) => s.number === (user.target_surah || 1)) || SURAH_LIST[0];

  return (
    <div className="space-y-4">
      {/* Standalone ZIP package download banner */}
      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            📦
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">Ayah Quest Source ZIP Ready</h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">114 Surahs • Spck / Acode / GitHub</p>
          </div>
        </div>
        <button
          id="btn-download-zip"
          onClick={onDownloadZip}
          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Get ZIP</span>
        </button>
      </div>

      {/* Islamic Greeting & Today's Target Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-900 text-white p-5 rounded-3xl border border-emerald-800/40 shadow-sm relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between text-xs text-emerald-300 font-medium">
          <span>Assalamu Alaikum, {user.first_name || 'Seeker'}</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-800/60 text-[10px] border border-emerald-700/50">
            <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{user.current_streak} Day Streak</span>
          </span>
        </div>

        <h2 className="text-xl font-bold mt-1.5 text-emerald-50">Today's Hifz Target</h2>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-white tracking-tight">
              {user.today_reviewed}{' '}
              <span className="text-xs font-normal text-emerald-300">
                / {user.daily_goal} ayahs reviewed
              </span>
            </p>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              {user.today_reviewed === 0
                ? 'Clean start — Begin your first session today'
                : `${Math.max(0, user.daily_goal - user.today_reviewed)} verses remaining today`}
            </p>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 flex items-center justify-center font-bold text-xs text-white bg-emerald-950/40">
            {percentComplete}%
          </div>
        </div>
      </div>

      {/* Primary Action Card: Active Memorization Range */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active Memorization Range
            </span>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {targetMeta.number}. {targetMeta.englishName} ({targetMeta.name})
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {targetMeta.numberOfAyahs} Ayahs Total
          </span>
        </div>

        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden mb-4">
          <div 
            className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
            style={{ width: `${percentComplete}%` }} 
          />
        </div>

        <div className="flex gap-2">
          <button
            id="home-btn-continue-hifz"
            onClick={() => onNavigate('hifz')}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{user.today_reviewed === 0 ? 'Start Memorizing' : 'Continue Hifz'}</span>
          </button>
          <button
            id="home-btn-start-revision"
            onClick={() => onNavigate('quran')}
            className="py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 font-semibold text-sm transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Quran</span>
          </button>
        </div>
      </div>

      {/* Today's Review Queue / Smart SRS */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Today's Review Queue
            </h3>
          </div>
          <span className="text-xs font-semibold text-stone-400">
            {user.today_reviewed > 0 ? `${user.today_reviewed} Reviewed` : 'Ready to Start'}
          </span>
        </div>

        {user.today_reviewed === 0 ? (
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 text-center space-y-2 border border-stone-200 dark:border-stone-800">
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              ✨ Fresh start! No pending reviews or mistakes logged yet.
            </p>
            <p className="text-[11px] text-stone-400">
              Begin by listening, repeating, and grading your recall in the Memorize tab.
            </p>
            <button
              onClick={() => onNavigate('hifz')}
              className="mt-1 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-sm"
            >
              Start Session on {targetMeta.englishName}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  {targetMeta.englishName} : Ayahs 1–{Math.min(user.today_reviewed, targetMeta.numberOfAyahs)}
                </span>
                <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Completed in today's quota
                </span>
              </div>
              <button
                onClick={() => onNavigate('hifz')}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Repeat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Tools */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <button
          onClick={() => onNavigate('hifz')}
          className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 transition-all flex flex-col items-center gap-1.5 shadow-sm"
        >
          <span className="text-xl">🎧</span>
          <span className="font-semibold text-stone-800 dark:text-stone-200">Listen & Repeat</span>
        </button>
        <button
          onClick={() => onNavigate('quiz')}
          className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 transition-all flex flex-col items-center gap-1.5 shadow-sm"
        >
          <span className="text-xl">🧠</span>
          <span className="font-semibold text-stone-800 dark:text-stone-200">Recall Quiz</span>
        </button>
        <button
          onClick={() => onNavigate('quran')}
          className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 transition-all flex flex-col items-center gap-1.5 shadow-sm"
        >
          <span className="text-xl">📖</span>
          <span className="font-semibold text-stone-800 dark:text-stone-200">114 Surahs</span>
        </button>
      </div>

      {/* Pro Banner */}
      {!user.is_pro && (
        <div
          onClick={onOpenPro}
          className="cursor-pointer bg-gradient-to-r from-emerald-950 to-stone-900 p-4 rounded-3xl border border-emerald-500/20 flex items-center justify-between shadow-sm hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              ⭐
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Unlock Voice AI & All 4 Reciters</h4>
              <p className="text-[10px] text-emerald-300">Ethiopian Telebirr (50 ETB) or 20 Stars</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400" />
        </div>
      )}
    </div>
  );
};
