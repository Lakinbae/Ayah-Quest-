import React from 'react';
import { Award, TrendingUp, Calendar, Zap, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface ProgressViewProps {
  user: UserProfile;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ user }) => {
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
            <span>Memorized</span>
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            24 <span className="text-xs font-normal text-stone-400">ayahs</span>
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-3.5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Repetitions</span>
          </div>
          <p className="text-2xl font-black text-amber-500 mt-1">
            320 <span className="text-xs font-normal text-stone-400">cycles</span>
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
            <span>Accuracy Rate</span>
          </div>
          <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
            94% <span className="text-xs font-normal text-stone-400">match</span>
          </p>
        </div>
      </div>

      {/* 7-Day Consistency Visualization */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
            7-Day Memorization Consistency
          </h3>
          <span className="text-[10px] text-stone-400">Repetitions Per Day</span>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-[10px]">
          {[
            { day: 'M', reps: 25, height: '55%' },
            { day: 'T', reps: 38, height: '80%' },
            { day: 'W', reps: 18, height: '40%' },
            { day: 'T', reps: 42, height: '90%' },
            { day: 'F', reps: 48, height: '100%', active: true },
            { day: 'S', reps: 30, height: '65%' },
            { day: 'S', reps: 22, height: '50%' }
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="h-20 bg-stone-100 dark:bg-stone-850 rounded-xl flex items-end justify-center p-1">
                <div
                  className={`w-full rounded-lg transition-all ${
                    item.active ? 'bg-emerald-600' : 'bg-emerald-500/70'
                  }`}
                  style={{ height: item.height }}
                />
              </div>
              <span className={`font-semibold ${item.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`}>
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Surah Mastery Breakdown */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
          Surah Mastery
        </h3>
        <div className="space-y-2.5 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-bold text-stone-800 dark:text-stone-200">Surah Al-Fatihah</span>
              <span className="text-emerald-600 font-bold">7 / 7 (100%)</span>
            </div>
            <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-bold text-stone-800 dark:text-stone-200">Surah Al-Mulk</span>
              <span className="text-emerald-600 font-bold">10 / 30 (33%)</span>
            </div>
            <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '33%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-bold text-stone-800 dark:text-stone-200">Surah Al-Ikhlas, Falaq, Nas</span>
              <span className="text-emerald-600 font-bold">15 / 15 (100%)</span>
            </div>
            <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Weak Verses Review Priority */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
            Identified Weak Verses (SRS Priority)
          </h3>
        </div>
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl flex items-center justify-between">
            <div>
              <div className="font-bold text-stone-800 dark:text-stone-200">Al-Mulk : 1</div>
              <div className="text-[11px] text-rose-500 font-medium">Hesitation on word: "بِيَدِهِ"</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 font-bold text-[10px]">
              Review Due
            </span>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl flex items-center justify-between">
            <div>
              <div className="font-bold text-stone-800 dark:text-stone-200">Al-Mulk : 4</div>
              <div className="text-[11px] text-amber-500 font-medium">Missed end word: "حَسِيرٌ"</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-[10px]">
              Scheduled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
