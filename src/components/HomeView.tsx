import React, { useState, useEffect } from 'react';
import { 
  Play, RotateCcw, Flame, CheckCircle2, ChevronRight, Sparkles, 
  BookOpen, Target, Heart, ShieldAlert, AlertTriangle, Check, Award, Compass, MessageCircle,
  ArrowRight, ArrowLeft, Share2
} from 'lucide-react';
import { UserProfile, TabType, SrsReviewRecord } from '../types';
import { SURAH_LIST } from '../data/surahList';
import { MOTIVATIONAL_REFLECTIONS } from '../data/motivationalData';

interface HomeViewProps {
  user: UserProfile;
  srsRecords: SrsReviewRecord[];
  onNavigate: (tab: TabType, targetSurah?: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  srsRecords,
  onNavigate,
}) => {
  const [reflectionIndex, setReflectionIndex] = useState<number>(0);
  const [copiedMotivation, setCopiedMotivation] = useState<boolean>(false);

  useEffect(() => {
    // Pick daily reflection based on date
    const day = new Date().getDate();
    setReflectionIndex(day % MOTIVATIONAL_REFLECTIONS.length);
  }, []);

  const reflection = MOTIVATIONAL_REFLECTIONS[reflectionIndex];

  const handleNextMotivation = () => {
    setReflectionIndex((prev) => (prev + 1) % MOTIVATIONAL_REFLECTIONS.length);
  };

  const handlePrevMotivation = () => {
    setReflectionIndex((prev) => (prev - 1 + MOTIVATIONAL_REFLECTIONS.length) % MOTIVATIONAL_REFLECTIONS.length);
  };

  const handleShareMotivation = () => {
    const text = `«${reflection.arabic}»\n"${reflection.translation}"\n(${reflection.source})\n\n— Read on Ayah Quest`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMotivation(true);
      setTimeout(() => setCopiedMotivation(false), 2000);
    }
  };

  const percentComplete = (user?.daily_goal || 5) > 0 
    ? Math.min(100, Math.round(((user?.today_reviewed || 0) / (user?.daily_goal || 5)) * 100))
    : 0;

  const targetMeta = SURAH_LIST.find((s) => s.number === (user?.target_surah || 1)) || SURAH_LIST[0];

  // Weak and hesitant items in the user's real SRS ledger
  const weakRecords = srsRecords.filter((r) => r.rating === 'weak');
  const hesitantRecords = srsRecords.filter((r) => r.rating === 'hesitant');

  return (
    <div className="space-y-4">
      {/* Daily Spiritual Heart Connection Card: آية اليوم ونور القلب */}
      <div className="bg-[#f7f5ef] dark:bg-stone-900 p-4 rounded-3xl border border-amber-600/20 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-bold text-xs">
            <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>نور اليوم • Daily Reflection</span>
          </div>
          <span className="text-[10px] text-amber-900 dark:text-amber-300 font-semibold bg-amber-500/15 px-2 py-0.5 rounded-full">
            {reflection.theme}
          </span>
        </div>

        <p className="font-quran text-lg md:text-xl text-emerald-950 dark:text-emerald-100 text-center py-1 leading-relaxed" dir="rtl">
          «{reflection.arabic}»
        </p>

        <p className="text-xs text-stone-700 dark:text-stone-300 italic text-center leading-relaxed">
          "{reflection.translation}"
        </p>

        <p className="text-[10px] text-stone-500 dark:text-stone-400 text-center font-medium">
          — {reflection.source}
        </p>

        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-stone-700 dark:text-stone-300 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span><strong>Actionable Tip:</strong> {reflection.practicalTip}</span>
        </div>

        {/* Carousel controls & share */}
        <div className="flex items-center justify-between pt-1 border-t border-amber-600/10 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMotivation}
              title="Previous motivation"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-stone-400 font-medium px-1">
              {reflectionIndex + 1} / {MOTIVATIONAL_REFLECTIONS.length}
            </span>
            <button
              onClick={handleNextMotivation}
              title="Next motivation"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleShareMotivation}
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline px-2 py-1 rounded-lg"
          >
            <Share2 className="w-3 h-3" />
            <span>{copiedMotivation ? 'Copied to Clipboard!' : 'Share Verse'}</span>
          </button>
        </div>
      </div>

      {/* Islamic Greeting & Today's Target Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-stone-900 text-white p-5 rounded-3xl border border-emerald-800/40 shadow-sm relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between text-xs text-emerald-300 font-medium">
          <span>Assalamu Alaikum, {user.first_name || 'Seeker'}</span>
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-800/70 text-[11px] font-bold border border-emerald-700/50">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{user.current_streak} Day Streak</span>
          </span>
        </div>

        <h2 className="text-xl font-bold mt-1.5 text-emerald-50">Today's Hifz Target</h2>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-white tracking-tight">
              {user.today_reviewed}{' '}
              <span className="text-xs font-normal text-emerald-300">
                / {user.daily_goal} ayahs completed
              </span>
            </p>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              {user.today_reviewed === 0
                ? 'Clean start — Begin today’s sacred session'
                : `${Math.max(0, user.daily_goal - user.today_reviewed)} verses left to meet today’s intention`}
            </p>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center font-bold text-xs text-white bg-emerald-950/50 shadow-inner">
            {percentComplete}%
          </div>
        </div>
      </div>

      {/* Primary Action Card: Active Memorization Range */}
      <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Active Memorization Range
            </span>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {targetMeta.number}. {targetMeta.englishName} ({targetMeta.name})
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 border border-emerald-600/20">
            {targetMeta.numberOfAyahs} Ayahs Total
          </span>
        </div>

        <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden mb-4">
          <div 
            className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
            style={{ width: `${percentComplete}%` }} 
          />
        </div>

        <div className="flex gap-2">
          <button
            id="home-btn-continue-hifz"
            onClick={() => onNavigate('hifz', targetMeta.number)}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{user.today_reviewed === 0 ? 'Start Memorizing' : 'Continue Hifz'}</span>
          </button>
          <button
            id="home-btn-start-revision"
            onClick={() => onNavigate('quran')}
            className="py-3 px-4 rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 font-bold text-xs sm:text-sm border border-stone-200 dark:border-stone-700 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Browse 114 Surahs</span>
          </button>
        </div>
      </div>

      {/* Today's Review Queue / Smart SRS Ledger */}
      <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Today's Review Queue (Spaced Repetition)
            </h3>
          </div>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            {weakRecords.length + hesitantRecords.length > 0 
              ? `${weakRecords.length + hesitantRecords.length} Need Attention`
              : 'All Up to Date'}
          </span>
        </div>

        {weakRecords.length === 0 && hesitantRecords.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 text-center space-y-2 border border-stone-200/90 dark:border-stone-800">
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              ✨ Al-Hamdulillah! No weak verses flagged in your queue.
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              When you grade ayahs as "Hesitant" or "Weak" during recitation, they appear here automatically for targeted repetition.
            </p>
            <button
              onClick={() => onNavigate('hifz', targetMeta.number)}
              className="mt-1 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
            >
              Recite & Grade Surah {targetMeta.englishName}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {weakRecords.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                      Weak
                    </span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {rec.surahName} (Surah {rec.surahNumber} : Ayah {rec.ayahNumber})
                    </span>
                  </div>
                  <p className="font-quran text-sm text-stone-800 dark:text-stone-200 mt-1 truncate max-w-[240px]" dir="rtl">
                    {rec.text}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('hifz', rec.surahNumber)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-xs"
                >
                  Revise Now
                </button>
              </div>
            ))}

            {hesitantRecords.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 text-[10px] font-bold">
                      Hesitant
                    </span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {rec.surahName} (Surah {rec.surahNumber} : Ayah {rec.ayahNumber})
                    </span>
                  </div>
                  <p className="font-quran text-sm text-stone-800 dark:text-stone-200 mt-1 truncate max-w-[240px]" dir="rtl">
                    {rec.text}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('hifz', rec.surahNumber)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shrink-0 shadow-xs"
                >
                  Reinforce
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access Tools */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <button
          onClick={() => onNavigate('hifz')}
          className="p-3.5 rounded-2xl bg-[#faf8f5] dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-emerald-600 transition-all flex flex-col items-center gap-1.5 shadow-xs"
        >
          <span className="text-xl">🎧</span>
          <span className="font-bold text-stone-800 dark:text-stone-200">Listen & Repeat</span>
        </button>
        <button
          onClick={() => onNavigate('quiz')}
          className="p-3.5 rounded-2xl bg-[#faf8f5] dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-emerald-600 transition-all flex flex-col items-center gap-1.5 shadow-xs"
        >
          <span className="text-xl">🧠</span>
          <span className="font-bold text-stone-800 dark:text-stone-200">Recall Quiz</span>
        </button>
        <button
          onClick={() => onNavigate('quran')}
          className="p-3.5 rounded-2xl bg-[#faf8f5] dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-emerald-600 transition-all flex flex-col items-center gap-1.5 shadow-xs"
        >
          <span className="text-xl">📖</span>
          <span className="font-bold text-stone-800 dark:text-stone-200">114 Surahs</span>
        </button>
      </div>

      {/* Motivational Pause & Exit Reminder Banner */}
      <div className="p-4 bg-gradient-to-r from-emerald-950 to-stone-900 text-white rounded-3xl border border-emerald-700/30 flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
            <Compass className="w-3 h-3" /> Before You Step Away Today
          </span>
          <p className="font-semibold text-stone-200">
            «For every letter of Allah's book, you earn 10 good deeds.»
          </p>
        </div>
        <button
          onClick={() => onNavigate('hifz')}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 shadow-xs active:scale-95"
        >
          Recite 1 Last Ayah
        </button>
      </div>
    </div>
  );
};
