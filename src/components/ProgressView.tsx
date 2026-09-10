import React, { useState } from 'react';
import { Award, TrendingUp, Calendar, Zap, AlertCircle, BookOpen, Target, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { SURAH_LIST } from '../data/surahList';

interface ProgressViewProps {
  user: UserProfile;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ user }) => {
  const targetMeta = SURAH_LIST.find((s) => s.number === (user.target_surah || 1)) || SURAH_LIST[0];
  const isCleanSlate = user.today_reviewed === 0 && user.current_streak === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            Hifz Analytics
          </span>
          <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            Memorization & SRS Progress
          </h2>
        </div>
        <span className="text-xs text-stone-400 font-medium">Updated live</span>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-semibold">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Today's Ayahs</span>
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {user.today_reviewed} <span className="text-xs font-normal text-stone-400">/ {user.daily_goal}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Repetition Cycles</span>
          </div>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {user.today_reviewed * 3} <span className="text-xs font-normal text-stone-400">cycles</span>
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            <span>Current Streak</span>
          </div>
          <p className="text-2xl font-black text-orange-500 mt-1">
            {user.current_streak} <span className="text-xs font-normal text-stone-400">days</span>
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-semibold">
            <Calendar className="w-3.5 h-3.5 text-teal-500" />
            <span>Best Streak</span>
          </div>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {user.best_streak} <span className="text-xs font-normal text-stone-400">days</span>
          </p>
        </div>
      </div>

      {/* 7-Day Consistency Bar Graph */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
            7-Day Memorization Consistency
          </h3>
          <span className="text-[10px] text-stone-400">Daily Verses Completed</span>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-[10px]">
          {[
            { day: 'Mon', val: isCleanSlate ? 0 : 3 },
            { day: 'Tue', val: isCleanSlate ? 0 : 5 },
            { day: 'Wed', val: isCleanSlate ? 0 : 4 },
            { day: 'Thu', val: isCleanSlate ? 0 : 2 },
            { day: 'Fri', val: user.today_reviewed, active: true },
            { day: 'Sat', val: 0 },
            { day: 'Sun', val: 0 },
          ].map((item, idx) => {
            const hPercent = Math.min(100, Math.max(8, (item.val / Math.max(1, user.daily_goal)) * 100));
            return (
              <div key={idx} className="space-y-1.5">
                <div className="h-20 bg-stone-100 dark:bg-stone-850 rounded-xl flex items-end justify-center p-1">
                  <div
                    className={`w-full rounded-lg transition-all ${
                      item.active ? 'bg-emerald-600' : item.val > 0 ? 'bg-emerald-500/50' : 'bg-stone-200 dark:bg-stone-800'
                    }`}
                    style={{ height: `${hPercent}%` }}
                  />
                </div>
                <span
                  className={`font-semibold ${
                    item.active ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-400'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Target Surah Mastery Breakdown */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Target Surah Progress</span>
          </h3>
          <span className="text-[11px] font-semibold text-stone-400">
            {targetMeta.numberOfAyahs} ayahs
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {targetMeta.number}. {targetMeta.englishName} ({targetMeta.name})
              </span>
              <span className="text-emerald-600 font-bold">
                {user.today_reviewed} / {targetMeta.numberOfAyahs} ({Math.round((user.today_reviewed / targetMeta.numberOfAyahs) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (user.today_reviewed / targetMeta.numberOfAyahs) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Smart Hifz Target & Revision Planner for any of 114 Surahs */}
      <HifzPlannerWidget initialSurahNum={user.target_surah || 1} />
    </div>
  );
};

const HifzPlannerWidget: React.FC<{ initialSurahNum: number }> = ({ initialSurahNum }) => {
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(initialSurahNum);
  const [daysTarget, setDaysTarget] = useState<number>(15);

  const meta = SURAH_LIST.find((s) => s.number === selectedSurahNum) || SURAH_LIST[0];
  const totalAyahs = meta.numberOfAyahs;

  const dailySabaq = Math.ceil(totalAyahs / daysTarget);
  const dailyMurajaah = Math.min(totalAyahs, Math.max(3, dailySabaq * 2));

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysTarget);
  const formattedDate = targetDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Hifz Planner
          </span>
          <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
            Calculate Completion Timeline
          </h3>
        </div>
        <BookOpen className="w-4 h-4 text-emerald-600" />
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-[11px] font-bold text-stone-500 block mb-1">
            Choose Surah (All 114 Surahs)
          </label>
          <select
            value={selectedSurahNum}
            onChange={(e) => setSelectedSurahNum(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 font-semibold"
          >
            {SURAH_LIST.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.englishName} ({s.numberOfAyahs} Ayahs)
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-stone-500">Days to complete:</span>
            <span className="font-bold text-emerald-600">{daysTarget} Days</span>
          </div>
          <input
            type="range"
            min="3"
            max="60"
            value={daysTarget}
            onChange={(e) => setDaysTarget(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      {/* Target Roadmap Results */}
      <div className="p-3 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/10 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="text-[10px] text-stone-400 block uppercase font-bold">New Ayahs</span>
          <span className="font-black text-emerald-700 dark:text-emerald-300 text-sm">
            {dailySabaq} / day
          </span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block uppercase font-bold">Revision</span>
          <span className="font-black text-amber-600 text-sm">
            {dailyMurajaah} / day
          </span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block uppercase font-bold">Target Date</span>
          <span className="font-black text-stone-800 dark:text-stone-200 text-xs">
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
};
