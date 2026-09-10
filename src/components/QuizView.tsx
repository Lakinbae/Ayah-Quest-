import React, { useState } from 'react';
import { 
  HelpCircle, Check, X, RotateCcw, Award, Sparkles, 
  ArrowRight, Shuffle, Eye, Volume2, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { SURAHS_DATA } from '../data/quranData';
import { SURAH_LIST } from '../data/surahList';

type QuizMode = 'fill_blank' | 'next_ayah' | 'identify_surah' | 'word_order';

interface Question {
  type: QuizMode;
  prompt: string;
  arabicSnippet?: string;
  translation?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  words?: string[]; // for word_order
}

export const QuizView: React.FC = () => {
  const [activeMode, setActiveMode] = useState<QuizMode>('fill_blank');
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Word order mode state
  const [constructedWords, setConstructedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  // 1. Fill In The Blank Questions
  const fillInBlankQuestions: Question[] = [
    {
      type: 'fill_blank',
      prompt: 'Identify the missing word in this verse from Surah Al-Mulk (67:1):',
      arabicSnippet: 'تَبَارَكَ الَّذِي بِيَدِهِ ________ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      translation: 'Blessed is He in whose hand is the dominion, and He is over all things competent.',
      correctAnswer: 'الْمُلْكُ',
      options: ['الْمُلْكُ', 'الْحَمْدُ', 'الْخَلْقُ', 'الْعَرْشُ'],
      explanation: 'Ayah 1 of Al-Mulk begins with: تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ',
    },
    {
      type: 'fill_blank',
      prompt: 'Complete the verse from Surah Al-Fatihah (1:5):',
      arabicSnippet: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ ________',
      translation: 'It is You we worship and You we ask for help.',
      correctAnswer: 'نَسْتَعِينُ',
      options: ['نَسْتَعِينُ', 'نَرْجُو', 'نَسْتَغْفِرُ', 'نَخْشَىٰ'],
      explanation: 'The famous verse 5 of Al-Fatihah is: إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    },
    {
      type: 'fill_blank',
      prompt: 'Complete the verse from Surah Al-Mulk (67:2):',
      arabicSnippet: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ ________ عَمَلًا',
      translation: '[He] who created death and life to test you as to which of you is best in deed.',
      correctAnswer: 'أَحْسَنُ',
      options: ['أَكْثَرُ', 'أَحْسَنُ', 'أَعْظَمُ', 'أَصْدَقُ'],
      explanation: 'Ayah 2 emphasizes which of you is "أَحْسَنُ عَمَلًا" (best in deeds).',
    },
    {
      type: 'fill_blank',
      prompt: 'Complete the final verse of Surah Al-Ikhlas (112:4):',
      arabicSnippet: 'وَلَمْ يَكُن لَّهُ ________ أَحَدٌ',
      translation: 'Nor is there to Him any equivalent.',
      correctAnswer: 'كُفُوًا',
      options: ['شَبِيهًا', 'كُفُوًا', 'مِثْلًا', 'نِدًّا'],
      explanation: 'Surah Al-Ikhlas 4: وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    },
    {
      type: 'fill_blank',
      prompt: 'Fill in the missing word from Surah Al-Mulk (67:4):',
      arabicSnippet: 'ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ ________',
      translation: 'Then return [your] vision twice again. [Your] vision will return to you humbled while it is fatigued.',
      correctAnswer: 'حَسِيرٌ',
      options: ['بَصِيرٌ', 'حَسِيرٌ', 'كَسِيرٌ', 'نَذِيرٌ'],
      explanation: 'Ayah 4 ends with: خَاسِئًا وَهُوَ حَسِيرٌ',
    },
  ];

  // 2. Next Ayah Questions
  const nextAyahQuestions: Question[] = [
    {
      type: 'next_ayah',
      prompt: 'Which Ayah comes immediately NEXT after this verse?',
      arabicSnippet: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (الفاتحة: 6)',
      translation: 'Guide us to the straight path.',
      correctAnswer: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      options: [
        'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        'مَالِكِ يَوْمِ الدِّينِ',
        'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      ],
      explanation: 'Ayah 7 is the final ayah of Al-Fatihah, following ayah 6.',
    },
    {
      type: 'next_ayah',
      prompt: 'What is the NEXT verse after:',
      arabicSnippet: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ (الملك: 1)',
      translation: 'Blessed is He in whose hand is the dominion...',
      correctAnswer: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا',
      options: [
        'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا',
        'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا',
        'وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ',
        'إِنَّ الَّذِينَ يَخْشَوْنَ رَبَّهُم بِالْغَيْبِ',
      ],
      explanation: 'Ayah 2 of Surah Al-Mulk begins with: الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ',
    },
    {
      type: 'next_ayah',
      prompt: 'Which verse comes immediately AFTER:',
      arabicSnippet: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ (الفلق: 1)',
      translation: 'Say, "I seek refuge in the Lord of daybreak..."',
      correctAnswer: 'مِن شَرِّ مَا خَلَقَ',
      options: [
        'مِن شَرِّ مَا خَلَقَ',
        'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
        'مَلِكِ النَّاسِ',
      ],
      explanation: 'Ayah 2 of Surah Al-Falaq is: مِن شَرِّ مَا خَلَقَ',
    },
    {
      type: 'next_ayah',
      prompt: 'What follows:',
      arabicSnippet: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ (الناس: 1)',
      translation: 'Say, "I seek refuge in the Lord of mankind..."',
      correctAnswer: 'مَلِكِ النَّاسِ',
      options: [
        'مَلِكِ النَّاسِ',
        'إِلَٰهِ النَّاسِ',
        'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        'مِن شَرِّ مَا خَلَقَ',
      ],
      explanation: 'Ayah 2 of Surah An-Nas is: مَلِكِ النَّاسِ',
    },
  ];

  // 3. Identify Surah Questions
  const identifySurahQuestions: Question[] = [
    {
      type: 'identify_surah',
      prompt: 'Which Surah contains this noble verse?',
      arabicSnippet: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ',
      translation: '[And] who created seven heavens in layers. You see not in the creation of the Most Merciful any inconsistency.',
      correctAnswer: 'Al-Mulk (67)',
      options: ['Al-Mulk (67)', 'Ya-Sin (36)', 'Al-Kahf (18)', 'Ar-Rahman (55)'],
      explanation: 'This is Ayah 3 of Surah Al-Mulk.',
    },
    {
      type: 'identify_surah',
      prompt: 'Which Surah contains this verse?',
      arabicSnippet: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
      translation: 'Indeed, We have granted you, [O Muhammad], al-Kawthar.',
      correctAnswer: 'Al-Kawthar (108)',
      options: ['Al-Kawthar (108)', 'Al-Ikhlas (112)', 'An-Nasr (110)', 'Al-Fil (105)'],
      explanation: 'Ayah 1 of Surah 108: Al-Kawthar.',
    },
    {
      type: 'identify_surah',
      prompt: 'Which Surah is this verse from?',
      arabicSnippet: 'قُلْ هُوَ الرَّحْمَٰنُ آمَنَّا بِهِ وَعَلَيْهِ تَوَكَّلْنَا',
      translation: 'Say, "He is the Most Merciful; we have believed in Him, and upon Him we have relied."',
      correctAnswer: 'Al-Mulk (67)',
      options: ['Al-Mulk (67)', 'Al-Baqarah (2)', 'Al-Imran (3)', 'An-Nisa (4)'],
      explanation: 'Ayah 29 of Surah Al-Mulk.',
    },
    {
      type: 'identify_surah',
      prompt: 'Which Surah opens with:',
      arabicSnippet: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      translation: '[All] praise is [due] to Allah, Lord of the worlds.',
      correctAnswer: 'Al-Fatihah (1)',
      options: ['Al-Fatihah (1)', 'Al-Baqarah (2)', 'Al-Anam (6)', 'Al-Kahf (18)'],
      explanation: 'Al-Fatihah ("The Opening") begins with this foundational declaration.',
    },
  ];

  // 4. Word Order Scramble Questions
  const wordOrderQuestions: Question[] = [
    {
      type: 'word_order',
      prompt: 'Tap the words in the exact sequence to assemble this verse:',
      arabicSnippet: 'Surah Al-Ikhlas (112:1)',
      translation: 'Say, "He is Allah, [who is] One"',
      correctAnswer: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      options: [],
      words: ['اللَّهُ', 'قُلْ', 'أَحَدٌ', 'هُوَ'],
      explanation: 'Correct order: قُلْ هُوَ اللَّهُ أَحَدٌ',
    },
    {
      type: 'word_order',
      prompt: 'Reconstruct the holy verse by tapping the words in correct order:',
      arabicSnippet: 'Surah Al-Fatihah (1:2)',
      translation: '[All] praise is [due] to Allah, Lord of the worlds',
      correctAnswer: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      options: [],
      words: ['الْعَالَمِينَ', 'الْحَمْدُ', 'رَبِّ', 'لِلَّهِ'],
      explanation: 'Correct order: الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    },
    {
      type: 'word_order',
      prompt: 'Assemble the verse in order:',
      arabicSnippet: 'Surah Al-Mulk (67:14)',
      translation: 'Does He who created not know, while He is the Subtle, the Acquainted?',
      correctAnswer: 'أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ',
      options: [],
      words: ['اللَّطِيفُ', 'أَلَا', 'الْخَبِيرُ', 'يَعْلَمُ', 'وَهُوَ', 'مَنْ', 'خَلَقَ'],
      explanation: 'Correct order: أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ',
    },
  ];

  // Select questions according to active mode
  const getQuestionsForMode = (): Question[] => {
    switch (activeMode) {
      case 'fill_blank':
        return fillInBlankQuestions;
      case 'next_ayah':
        return nextAyahQuestions;
      case 'identify_surah':
        return identifySurahQuestions;
      case 'word_order':
        return wordOrderQuestions;
    }
  };

  const currentQuestions = getQuestionsForMode();
  const q = currentQuestions[currentQIndex] || currentQuestions[0];

  // Initialize word scramble when entering a word_order question
  React.useEffect(() => {
    if (q.type === 'word_order' && q.words) {
      // Shuffle words copy
      const shuffled = [...q.words].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      setConstructedWords([]);
    }
  }, [currentQIndex, activeMode]);

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedAnswer(opt);
    setIsAnswered(true);

    if (opt === q.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleWordTap = (word: string, index: number) => {
    if (isAnswered) return;
    const newConstructed = [...constructedWords, word];
    const newAvailable = availableWords.filter((_, i) => i !== index);
    setConstructedWords(newConstructed);
    setAvailableWords(newAvailable);

    // If all words placed, check answer!
    if (newAvailable.length === 0) {
      const finalSentence = newConstructed.join(' ');
      setSelectedAnswer(finalSentence);
      setIsAnswered(true);
      if (finalSentence === q.correctAnswer) {
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
    if (currentQIndex < currentQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setConstructedWords([]);
    } else {
      setIsFinished(true);
    }
  };

  const handleSwitchMode = (mode: QuizMode) => {
    setActiveMode(mode);
    setCurrentQIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsFinished(false);
    setConstructedWords([]);
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsFinished(false);
    setConstructedWords([]);
  };

  return (
    <div className="space-y-4">
      {/* Quiz Modes Selector */}
      <div className="bg-white dark:bg-stone-900 p-3 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Quran Recall & Quiz Arena
          </span>
          <span className="text-[11px] font-semibold text-stone-500">
            {score} Correct
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs">
          <button
            onClick={() => handleSwitchMode('fill_blank')}
            className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center ${
              activeMode === 'fill_blank'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            Fill in Blank
          </button>
          <button
            onClick={() => handleSwitchMode('next_ayah')}
            className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center ${
              activeMode === 'next_ayah'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            Next Ayah
          </button>
          <button
            onClick={() => handleSwitchMode('identify_surah')}
            className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center ${
              activeMode === 'identify_surah'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            Identify Surah
          </button>
          <button
            onClick={() => handleSwitchMode('word_order')}
            className={`py-2 px-2.5 rounded-xl font-bold transition-all text-center ${
              activeMode === 'word_order'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            Word Scramble
          </button>
        </div>
      </div>

      {/* Main Question Card or Final Result */}
      {!isFinished ? (
        <div className="bg-[#faf8f5] dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-bold text-stone-700 dark:text-stone-300">
              Question {currentQIndex + 1} of {currentQuestions.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-600/20">
              {activeMode === 'fill_blank' && 'Missing Word'}
              {activeMode === 'next_ayah' && 'Sequence Recall'}
              {activeMode === 'identify_surah' && 'Surah Identification'}
              {activeMode === 'word_order' && 'Word Arrangement'}
            </span>
          </div>

          <p className="text-xs font-bold text-stone-800 dark:text-stone-200 leading-relaxed">
            {q.prompt}
          </p>

          {/* Prompt Verse Snippet */}
          {q.arabicSnippet && (
            <div className="p-4 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200/90 dark:border-stone-750 text-center shadow-xs">
              <p className="font-quran text-2xl md:text-3xl text-emerald-950 dark:text-emerald-50 leading-loose" dir="rtl">
                {q.arabicSnippet}
              </p>
              {q.translation && (
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 italic">
                  "{q.translation}"
                </p>
              )}
            </div>
          )}

          {/* Standard Multiple Choice (Fill in Blank, Next Ayah, Identify Surah) */}
          {q.type !== 'word_order' ? (
            <div className="space-y-2">
              {q.options.map((option, idx) => {
                const isThisSelected = selectedAnswer === option;
                const isCorrect = option === q.correctAnswer;

                let btnStyle = 'border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-850';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold';
                  } else if (isThisSelected) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-300 font-bold';
                  } else {
                    btnStyle = 'opacity-40 border-stone-200 dark:border-stone-800';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(option)}
                    disabled={isAnswered}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all text-xs font-medium ${btnStyle}`}
                  >
                    <span className="flex-1 font-quran text-base leading-normal" dir="rtl">
                      {option}
                    </span>
                    {isAnswered && (
                      <span className="ml-2 shrink-0">
                        {isCorrect ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : isThisSelected ? (
                          <X className="w-4 h-4 text-rose-600" />
                        ) : null}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Word Order Scramble Mode UI */
            <div className="space-y-4">
              {/* Target Assembly Area */}
              <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-700 min-h-[70px] flex flex-wrap items-center justify-center gap-2" dir="rtl">
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
                    className="px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-quran text-base shadow-xs hover:border-emerald-500 active:scale-95 transition-all"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explanation & Next Question Button */}
          {isAnswered && (
            <div className="pt-2 space-y-3">
              {q.explanation && (
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300">
                  <span className="font-bold text-emerald-600">💡 Insight: </span>
                  {q.explanation}
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>{currentQIndex < currentQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Complete Screen */
        <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
            🏆
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
              Quiz Completed!
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              May Allah bless your dedication to the Noble Quran.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 inline-block px-8">
            <span className="text-xs uppercase font-bold text-stone-400 block">Your Score</span>
            <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
              {score} / {currentQuestions.length}
            </span>
            <span className="text-xs font-semibold text-stone-500 block mt-1">
              {Math.round((score / currentQuestions.length) * 100)}% Accuracy
            </span>
          </div>

          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Mode</span>
            </button>
            <button
              onClick={() => {
                const nextModeMap: Record<QuizMode, QuizMode> = {
                  fill_blank: 'next_ayah',
                  next_ayah: 'identify_surah',
                  identify_surah: 'word_order',
                  word_order: 'fill_blank',
                };
                handleSwitchMode(nextModeMap[activeMode]);
              }}
              className="px-5 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-2 transition-all hover:bg-stone-200"
            >
              <span>Try Next Mode</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
