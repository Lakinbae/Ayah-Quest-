import React, { useState, useEffect, useMemo } from 'react';
import { 
  HelpCircle, Check, X, RotateCcw, Award, Sparkles, 
  ArrowRight, Shuffle, Eye, Volume2, CheckCircle2, ChevronRight, 
  Swords, Flame, BookOpen, Search, Layers, SlidersHorizontal, Loader2 
} from 'lucide-react';
import { SURAHS_DATA } from '../data/quranData';
import { SURAH_LIST } from '../data/surahList';
import { fetchSurah } from '../data/quranApi';
import { FriendDuelView } from './FriendDuelView';
import { UserProfile, Surah } from '../types';
import { 
  SoloQuizMode, 
  SoloQuestion, 
  generateQuestionsForSurah, 
  generateMixedQuranQuestions 
} from '../utils/soloRecallGenerator';

interface QuizViewProps {
  user?: UserProfile;
  initialArenaTab?: 'solo' | 'duel';
}

const LENGTH_OPTIONS = [5, 10, 15, 20];

const POPULAR_SURAHS = [
  { number: 0, name: 'All 114 Surahs (Mixed)', ar: 'جميع السور' },
  { number: 1, name: 'Al-Fatihah (1)', ar: 'الفاتحة' },
  { number: 36, name: 'Ya-Sin (36)', ar: 'يس' },
  { number: 55, name: 'Ar-Rahman (55)', ar: 'الرحمن' },
  { number: 67, name: 'Al-Mulk (67)', ar: 'الملك' },
  { number: 18, name: 'Al-Kahf (18)', ar: 'الكهف' },
  { number: 112, name: 'Al-Ikhlas (112)', ar: 'الإخلاص' },
];

export const QuizView: React.FC<QuizViewProps> = ({
  user = {
    id: 'guest',
    telegram_id: 0,
    first_name: 'Seeker',
    username: 'hafiz_seeker',
    current_streak: 1,
    best_streak: 1,
    today_reviewed: 0,
    daily_goal: 5,
    target_surah: 1,
    preferred_reciter: 'ar.alafasy',
    font_size: 28,
    theme: 'dark',
  },
  initialArenaTab = 'duel',
}) => {
  const [arenaTab, setArenaTab] = useState<'solo' | 'duel'>(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('duel') || p.get('challenge') || p.get('room') || p.get('join') || p.get('tgWebAppStartParam')) return 'duel';
      const tgParam = (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param;
      if (tgParam && (tgParam.startsWith('duel') || tgParam.startsWith('room') || tgParam.startsWith('join'))) return 'duel';
    } catch {}
    return initialArenaTab;
  });

  const [activeMode, setActiveMode] = useState<SoloQuizMode>('fill_blank');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(() => {
    // Default to user target Surah or Surah Al-Mulk (67)
    return user.target_surah || 67;
  });
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isSurahPickerOpen, setIsSurahPickerOpen] = useState<boolean>(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');
  const [isLoadingSurah, setIsLoadingSurah] = useState<boolean>(false);

  // Active quiz state
  const [questions, setQuestions] = useState<SoloQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Word order mode state
  const [constructedWords, setConstructedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  // Filter 114 Surahs by search query
  const filteredSurahs = useMemo(() => {
    const q = surahSearchQuery.trim().toLowerCase();
    if (!q) return SURAH_LIST;
    return SURAH_LIST.filter(
      (s) =>
        s.number.toString() === q ||
        s.englishName.toLowerCase().includes(q) ||
        s.name.includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q)
    );
  }, [surahSearchQuery]);

  // Selected Surah Metadata
  const selectedSurahMeta = useMemo(() => {
    if (selectedSurahNumber === 0) {
      return {
        number: 0,
        englishName: 'All 114 Surahs (Mixed)',
        name: 'كتاب الله الكريم',
        numberOfAyahs: 6236,
      };
    }
    return (
      SURAH_LIST.find((s) => s.number === selectedSurahNumber) || {
        number: selectedSurahNumber,
        englishName: `Surah ${selectedSurahNumber}`,
        name: `سورة ${selectedSurahNumber}`,
        numberOfAyahs: 0,
      }
    );
  }, [selectedSurahNumber]);

  // Load questions whenever Surah, Mode, or Length changes
  const loadQuestions = async (surahNum: number, mode: SoloQuizMode, count: number) => {
    setIsLoadingSurah(true);
    setCurrentQIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsFinished(false);
    setConstructedWords([]);
    setAvailableWords([]);

    try {
      if (surahNum === 0) {
        // Mixed Challenge across All Surahs
        const mixed = generateMixedQuranQuestions(mode, count, SURAHS_DATA);
        setQuestions(mixed);
      } else {
        // Fetch specific Surah data (cached or online via AlQuran API)
        const surahData: Surah = await fetchSurah(surahNum);
        const generated = generateQuestionsForSurah(surahData, mode, count);
        
        // If not enough questions in requested mode, fallback to mixed
        if (generated.length === 0) {
          const fallback = generateMixedQuranQuestions(mode, count, {
            ...SURAHS_DATA,
            [surahNum]: surahData,
          });
          setQuestions(fallback);
        } else {
          setQuestions(generated);
        }
      }
    } catch (err) {
      console.error('Error generating solo recall questions:', err);
      // Fallback to mixed questions from preloaded data
      const fallback = generateMixedQuranQuestions(mode, count, SURAHS_DATA);
      setQuestions(fallback);
    } finally {
      setIsLoadingSurah(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadQuestions(selectedSurahNumber, activeMode, questionCount);
  }, [selectedSurahNumber, activeMode, questionCount]);

  const currentQ = questions[currentQIndex] || questions[0];

  // Initialize word scramble when entering a word_order question
  useEffect(() => {
    if (currentQ?.type === 'word_order' && currentQ.words) {
      const shuffled = [...currentQ.words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      setConstructedWords([]);
    }
  }, [currentQIndex, currentQ]);

  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentQ) return;
    setSelectedAnswer(opt);
    setIsAnswered(true);

    if (opt === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleWordTap = (word: string, index: number) => {
    if (isAnswered || !currentQ) return;
    const newConstructed = [...constructedWords, word];
    const newAvailable = availableWords.filter((_, i) => i !== index);
    setConstructedWords(newConstructed);
    setAvailableWords(newAvailable);

    // If all words placed, check answer!
    if (newAvailable.length === 0) {
      const finalSentence = newConstructed.join(' ');
      setSelectedAnswer(finalSentence);
      setIsAnswered(true);
      if (finalSentence === currentQ.correctAnswer) {
        setScore((prev) => prev + 1);
      }
    }
  };

  const handleRemoveWord = (word: string, index: number) => {
    if (isAnswered) return;
    const newConstructed = constructedWords.filter((_, i) => i !== index);
    setConstructedWords(newConstructed);
    setAvailableWords([...availableWords, word]);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setConstructedWords([]);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    loadQuestions(selectedSurahNumber, activeMode, questionCount);
  };

  return (
    <div className="space-y-4">
      {/* Top Arena Navigation Toggle: Duel / Challenges vs Solo Practice */}
      <div className="flex bg-stone-200/80 dark:bg-stone-800/80 p-1 rounded-2xl">
        <button
          onClick={() => setArenaTab('duel')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            arenaTab === 'duel'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Friend Duels & Challenges</span>
        </button>
        <button
          onClick={() => setArenaTab('solo')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            arenaTab === 'solo'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Solo Recall Practice</span>
        </button>
      </div>

      {arenaTab === 'duel' ? (
        <FriendDuelView user={user} onBackToSolo={() => setArenaTab('solo')} />
      ) : (
        <div className="space-y-4 animate-in fade-in">
          {/* Solo Recall Customization Header: Surah Choice & Length Options */}
          <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 sm:p-5 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-stone-200/80 dark:border-stone-800">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                  Solo Quran Recall
                </span>
                <h2 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                  Custom Practice Session
                </h2>
              </div>

              {/* Surah Picker Trigger Button */}
              <button
                onClick={() => setIsSurahPickerOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300/80 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-emerald-600 flex items-center gap-2 text-xs font-bold shadow-xs transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {selectedSurahNumber === 0
                    ? 'All 114 Surahs'
                    : `${selectedSurahMeta.englishName} (${selectedSurahNumber})`}
                </span>
                <SlidersHorizontal className="w-3 h-3 text-stone-400 ml-1" />
              </button>
            </div>

            {/* Quick Popular Surahs Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
                Quick Surah Select:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SURAHS.map((s) => {
                  const isSelected = selectedSurahNumber === s.number;
                  return (
                    <button
                      key={s.number}
                      onClick={() => setSelectedSurahNumber(s.number)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                      }`}
                    >
                      <span>{s.name}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => setIsSurahPickerOpen(true)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                >
                  <Search className="w-3 h-3" />
                  <span>Choose from all 114...</span>
                </button>
              </div>
            </div>

            {/* Challenge Length Options */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                  Challenge Length:
                </span>
                <div className="flex gap-1">
                  {LENGTH_OPTIONS.map((len) => (
                    <button
                      key={len}
                      onClick={() => setQuestionCount(len)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        questionCount === len
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300'
                      }`}
                    >
                      {len} Ayahs
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {score} / {questions.length} Correct
                </span>
              </div>
            </div>

            {/* Quiz Recall Modes Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-xs">
              <button
                onClick={() => setActiveMode('fill_blank')}
                className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center ${
                  activeMode === 'fill_blank'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                Missing Word
              </button>
              <button
                onClick={() => setActiveMode('next_ayah')}
                className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center ${
                  activeMode === 'next_ayah'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                Next Ayah
              </button>
              <button
                onClick={() => setActiveMode('identify_surah')}
                className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center ${
                  activeMode === 'identify_surah'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                Identify Surah
              </button>
              <button
                onClick={() => setActiveMode('word_order')}
                className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center ${
                  activeMode === 'word_order'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                }`}
              >
                Word Arrangement
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoadingSurah && (
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
              <Loader2 className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
              <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
                Loading verses for {selectedSurahMeta.englishName}...
              </p>
            </div>
          )}

          {/* Main Question Card or Final Result */}
          {!isLoadingSurah && !isFinished && currentQ && (
            <div className="bg-[#faf8f5] dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="font-bold text-stone-700 dark:text-stone-300">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-600/20">
                  {currentQ.surahReference}
                </span>
              </div>

              {/* English Question Prompt Box (Separated cleanly by container/enter) */}
              <div className="p-3.5 bg-white dark:bg-stone-800/80 rounded-2xl border border-stone-200/90 dark:border-stone-700/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  Question Prompt
                </span>
                <h3 className="text-sm md:text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {currentQ.prompt}
                </h3>
              </div>

              {/* Prompt Holy Quran Verse Snippet */}
              {currentQ.arabicSnippet && (
                <div className="py-4 px-4 bg-emerald-50/60 dark:bg-stone-800/90 rounded-2xl border border-emerald-500/25 dark:border-stone-700 text-center shadow-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800/60 dark:text-emerald-300/60 block">
                    Noble Quranic Text (الآية الكريمة)
                  </span>
                  <p className="font-quran text-2xl md:text-3xl text-emerald-950 dark:text-emerald-100 leading-loose select-none" dir="rtl">
                    {currentQ.arabicSnippet.includes('________') ? (
                      <>
                        {currentQ.arabicSnippet.split('________').map((part, pIdx, arr) => (
                          <React.Fragment key={pIdx}>
                            <span>{part}</span>
                            {pIdx < arr.length - 1 && (
                              <span className="inline-flex items-center justify-center px-3 py-0.5 mx-1.5 rounded-lg border-2 border-dashed border-emerald-600 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-sans text-xs font-black align-middle tracking-wider select-none">
                                [ ؟ ]
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </>
                    ) : (
                      currentQ.arabicSnippet
                    )}
                  </p>
                  {currentQ.translation && (
                    <div className="pt-2 border-t border-emerald-900/10 dark:border-emerald-500/20">
                      <p className="text-xs text-stone-600 dark:text-stone-300 italic font-normal">
                        "{currentQ.translation}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Standard Multiple Choice (Fill in Blank, Next Ayah, Identify Surah) */}
              {currentQ.type !== 'word_order' ? (
                <div className="space-y-2 pt-1">
                  {currentQ.options.map((option, idx) => {
                    const isThisSelected = selectedAnswer === option;
                    const isCorrect = option === currentQ.correctAnswer;

                    let btnStyle = 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-emerald-600';

                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                      } else if (isThisSelected) {
                        btnStyle = 'bg-rose-600 text-white border-rose-600';
                      } else {
                        btnStyle = 'opacity-40 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(option)}
                        disabled={isAnswered}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all text-xs font-medium ${btnStyle}`}
                      >
                        <span className="flex-1 font-quran text-base sm:text-lg leading-normal" dir="rtl">
                          {option}
                        </span>
                        {isAnswered && (
                          <span className="ml-2 shrink-0">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : isThisSelected ? (
                              <X className="w-5 h-5 text-white" />
                            ) : null}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Word Order Scramble Mode UI */
                <div className="space-y-4 pt-1">
                  {/* Target Assembly Area */}
                  <div className="p-4 bg-white dark:bg-stone-800 rounded-2xl border-2 border-dashed border-emerald-500/30 dark:border-emerald-500/20 min-h-[80px] flex flex-wrap items-center justify-center gap-2" dir="rtl">
                    {constructedWords.length === 0 ? (
                      <span className="text-xs text-stone-400">
                        Tap the scrambled words below in the correct sequence...
                      </span>
                    ) : (
                      constructedWords.map((w, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRemoveWord(w, idx)}
                          disabled={isAnswered}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-quran text-base shadow-sm hover:bg-emerald-800 active:scale-95 transition-all"
                        >
                          {w}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Scrambled Word Pool */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2" dir="rtl">
                    {availableWords.map((w, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleWordTap(w, idx)}
                        disabled={isAnswered}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-quran text-base shadow-xs hover:border-emerald-500 active:scale-95 transition-all"
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation & Next Question Button */}
              {isAnswered && (
                <div className="pt-2 space-y-3 animate-in fade-in">
                  {currentQ.explanation && (
                    <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">💡 Insight: </span>
                      {currentQ.explanation}
                    </div>
                  )}

                  <button
                    onClick={handleNext}
                    className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                  >
                    <span>
                      {currentQIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quiz Complete Screen */}
          {!isLoadingSurah && isFinished && (
            <div className="bg-[#faf8f5] dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl">
                🏆
              </div>

              <div>
                <h3 className="text-xl font-black text-stone-900 dark:text-stone-100">
                  Solo Practice Completed!
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Surah: {selectedSurahMeta.englishName} • {questionCount} Verses
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 inline-block px-8 shadow-xs">
                <span className="text-xs uppercase font-bold text-stone-400 block">
                  Your Score
                </span>
                <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                  {score} / {questions.length}
                </span>
                <span className="text-xs font-semibold text-stone-500 block mt-1">
                  {questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}% Accuracy
                </span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <button
                  onClick={handleRestart}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Same Surah</span>
                </button>
                <button
                  onClick={() => setIsSurahPickerOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-2 transition-all hover:bg-stone-100"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Change Surah</span>
                </button>
              </div>
            </div>
          )}

          {/* Searchable 114 Surahs Modal Picker */}
          {isSurahPickerOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#faf8f5] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                      Select Surah for Recall
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsSurahPickerOpen(false)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={surahSearchQuery}
                    onChange={(e) => setSurahSearchQuery(e.target.value)}
                    placeholder="Search by name, number, or translation..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-600"
                  />
                  {surahSearchQuery && (
                    <button
                      onClick={() => setSurahSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Special Option: All 114 Surahs */}
                <div>
                  <button
                    onClick={() => {
                      setSelectedSurahNumber(0);
                      setIsSurahPickerOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedSurahNumber === 0
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-stone-800 border-emerald-600/30 text-emerald-800 dark:text-emerald-300 hover:border-emerald-600'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">✨ All 114 Surahs (Mixed Challenge)</div>
                      <div className="text-[11px] opacity-80">Test your mastery across the entire Quran</div>
                    </div>
                    <span className="font-quran text-base" dir="rtl">
                      جميع السور
                    </span>
                  </button>
                </div>

                {/* List of 114 Surahs */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredSurahs.map((surah) => {
                    const isSelected = selectedSurahNumber === surah.number;
                    return (
                      <button
                        key={surah.number}
                        onClick={() => {
                          setSelectedSurahNumber(surah.number);
                          setIsSurahPickerOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'hover:bg-white dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                          }`}>
                            {surah.number}
                          </span>
                          <div>
                            <p className="font-bold text-xs leading-tight">
                              {surah.englishName}
                            </p>
                            <p className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                              {surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs
                            </p>
                          </div>
                        </div>

                        <span className="font-quran text-base" dir="rtl">
                          {surah.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
