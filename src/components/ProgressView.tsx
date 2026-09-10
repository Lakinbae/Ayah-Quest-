import React, { useState } from 'react';
import { 
  Award, TrendingUp, Calendar, Zap, AlertCircle, BookOpen, 
  Target, CheckCircle2, Info, Check, AlertTriangle, XCircle, RotateCcw
} from 'lucide-react';
import { UserProfile, SrsReviewRecord } from '../types';
import { SURAH_LIST } from '../data/surahList';

interface ProgressViewProps {
  user: UserProfile;
  srsRecords: SrsReviewRecord[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({ user, srsRecords }) => {
  const [showCyclesInfo, setShowCyclesInfo] = useState<boolean>(false);

  const targetMeta = SURAH_LIST.find((s) => s.number === (user?.target_surah || 1)) || SURAH_LIST[0];

  // Fetch real 7-day consistency data from localStorage
  const getDynamic7Days = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let history: Record<string, number> = {};
    try {
      const stored = localStorage.getItem('ayah_daily_history_v1');
      if (stored) history = JSON.parse(stored);
    } catch {}

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      // For today, prioritize user.today_reviewed
      const val = i === 0 ? user.today_reviewed : (history[dateKey] || 0);
      result.push({
        day: dayName,
        date: dateKey,
        val: val,
        isToday: i === 0,
      });
    }
    return result;
  };

  const last7Days = getDynamic7Days();

  // Calculate real SRS stats
  const perfectCount = srsRecords.filter((r) => r.rating === 'perfect').length;
  const hesitantCount = srsRecords.filter((r) => r.rating === 'hesitant').length;
  const weakCount = srsRecords.filter((r) => r.rating === 'weak').length;
  const totalGraded = srsRecords.length;

  // Real total repetition cycles (at least 3 cycles per reviewed ayah)
  const totalCycles = user.today_reviewed * 3;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase">
            Hifz Analytics
          </span>
          <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            Memorization & SRS Progress
          </h2>
        </div>
        <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Real-time user data</span>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#faf8f5] dark:bg-stone-900 p-3.5 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-bold">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Today's Ayahs</span>
          </div>
          <p className="text-2xl font-black text-emerald-800 dark:text-emerald-400 mt-1">
            {user.today_reviewed} <span className="text-xs font-normal text-stone-400">/ {user.daily_goal}</span>
          </p>
        </div>

        <div className="bg-[#faf8f5] dark:bg-stone-900 p-3.5 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Recitation Cycles</span>
            </div>
            <button
              onClick={() => setShowCyclesInfo(!showCyclesInfo)}
              className="text-stone-400 hover:text-amber-600 transition-colors"
              title="What are recitation cycles?"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalCycles} <span className="text-xs font-normal text-stone-400">cycles</span>
          </p>
        </div>

        <div className="bg-[#faf8f5] dark:bg-stone-900 p-3.5 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            <span>Current Streak</span>
          </div>
          <p className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
            {user.current_streak} <span className="text-xs font-normal text-stone-400">days</span>
          </p>
        </div>

        <div className="bg-[#faf8f5] dark:bg-stone-900 p-3.5 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 text-[11px] font-bold">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Best Streak</span>
          </div>
          <p className="text-2xl font-black text-teal-700 dark:text-teal-400 mt-1">
            {user.best_streak} <span className="text-xs font-normal text-stone-400">days</span>
          </p>
        </div>
      </div>

      {/* Recitation Cycles Info Drawer */}
      {showCyclesInfo && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-3xl text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>What are Recitation Cycles (تكرار الحفظ)?</span>
            </h4>
            <button
              onClick={() => setShowCyclesInfo(false)}
              className="text-stone-400 hover:text-stone-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            In Quran memorization, <strong>Tikrar (Repetition)</strong> is the essential Sunnah method of anchoring verses. 
            One recitation cycle equals one complete listening loop or recitation repetition of an Ayah.
          </p>
          <p className="text-[11px] text-stone-600 dark:text-stone-400">
            Scholars recommend 3 to 10 cycles per verse so that memorization shifts from fragile short-term recall into firm, lasting heart knowledge.
          </p>
        </div>
      )}

      {/* Real 7-Day Consistency Bar Graph */}
      <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
            7-Day Memorization Consistency
          </h3>
          <span className="text-[10px] text-stone-500 dark:text-stone-400">Actual verses completed</span>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[10px]">
          {last7Days.map((item, idx) => {
            const hPercent = item.val > 0 
              ? Math.min(100, Math.max(15, (item.val / Math.max(1, user.daily_goal)) * 100))
              : 6;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="h-20 bg-stone-200/60 dark:bg-stone-800 rounded-xl flex items-end justify-center p-1">
                  <div
                    className={`w-full rounded-lg transition-all ${
                      item.isToday 
                        ? 'bg-emerald-600' 
                        : item.val > 0 
                        ? 'bg-emerald-500/60' 
                        : 'bg-stone-300/40 dark:bg-stone-800'
                    }`}
                    style={{ height: `${hPercent}%` }}
                    title={`${item.day} (${item.date}): ${item.val} ayahs`}
                  />
                </div>
                <div className="space-y-0.5">
                  <span
                    className={`block font-bold ${
                      item.isToday ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    {item.day}
                  </span>
                  <span className="block text-[9px] text-stone-400 font-mono">
                    {item.val}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Spaced Repetition (SRS) Mastery Breakdown */}
      <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Spaced Repetition Mastery Ledger</span>
          </h3>
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
            {totalGraded} Graded Verses
          </span>
        </div>

        {totalGraded === 0 ? (
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-800 text-center space-y-1">
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              No verses graded in your review ledger yet.
            </p>
            <p className="text-[11px] text-stone-400">
              Grade your verses as Known, Hesitant, or Weak in the Memorize tab to start tracking mastery!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1">
                <Check className="w-3 h-3" /> Mastered
              </span>
              <p className="text-lg font-black text-emerald-800 dark:text-emerald-300 mt-1">
                {perfectCount}
              </p>
              <span className="text-[9px] text-stone-500">7–14d interval</span>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Hesitant
              </span>
              <p className="text-lg font-black text-amber-800 dark:text-amber-300 mt-1">
                {hesitantCount}
              </p>
              <span className="text-[9px] text-stone-500">3d interval</span>
            </div>

            <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl">
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 flex items-center justify-center gap-1">
                <XCircle className="w-3 h-3" /> Needs Review
              </span>
              <p className="text-lg font-black text-rose-800 dark:text-rose-300 mt-1">
                {weakCount}
              </p>
              <span className="text-[9px] text-stone-500">Daily queue</span>
            </div>
          </div>
        )}

        {/* Target Surah Overall Progress Bar */}
        <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="font-bold text-stone-800 dark:text-stone-200">
              Surah {targetMeta.englishName} ({targetMeta.name})
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              {Math.min(user.today_reviewed, targetMeta.numberOfAyahs)} / {targetMeta.numberOfAyahs} Ayahs
            </span>
          </div>
          <div className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((user.today_reviewed / Math.max(1, targetMeta.numberOfAyahs)) * 100))}%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
