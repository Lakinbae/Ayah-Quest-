import React, { useState } from 'react';
import { HelpCircle, Check, X, RotateCcw } from 'lucide-react';
import { SURAHS_DATA } from '../data/quranData';

export const QuizView: React.FC = () => {
  const mulkAyahs = SURAHS_DATA[67].ayahs;

  const [currentQ, setCurrentQ] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Generate 5 questions dynamically
  const questions = [
    {
      prompt: "Identify the missing word in this verse:",
      maskedVerse: "تَبَارَكَ الَّذِي بِيَدِهِ ________ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
      correct: "الْمُلْكُ",
      options: ["الْمُلْكُ", "الْحَمْدُ", "الْخَلْقُ", "الْعَرْشُ"]
    },
    {
      prompt: "Which word completes this verse?",
      maskedVerse: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ ________ عَمَلًا",
      correct: "أَحْسَنُ",
      options: ["أَكْثَرُ", "أَحْسَنُ", "أَعْظَمُ", "أَصْدَقُ"]
    },
    {
      prompt: "Complete the verse:",
      maskedVerse: "فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن ________",
      correct: "فُطُورٍ",
      options: ["سُرُورٍ", "قُصُورٍ", "فُطُورٍ", "نُورٍ"]
    },
    {
      prompt: "Which surah starts with 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا'?",
      maskedVerse: "Surah identification challenge",
      correct: "Surah Al-Mulk",
      options: ["Surah Al-Mulk", "Surah Ya-Sin", "Surah An-Naba", "Surah Al-Waqi'ah"]
    },
    {
      prompt: "Fill in the missing word:",
      maskedVerse: "ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ ________",
      correct: "حَسِيرٌ",
      options: ["بَصِيرٌ", "حَسِيرٌ", "كَسِيرٌ", "نَذِيرٌ"]
    }
  ];

  const q = questions[currentQ];

  const handleSelect = (opt: string) => {
    if (isAnswered) return;
    setSelectedAnswer(opt);
    setIsAnswered(true);

    if (opt === q.correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsFinished(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            Active Recall Quiz
          </span>
          <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            Reinforce Verse Retention
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          Question {currentQ + 1} / {questions.length}
        </span>
      </div>

      {!isFinished ? (
        <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
            {q.prompt}
          </p>

          <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl text-center">
            <p className="font-quran text-xl md:text-2xl text-stone-900 dark:text-stone-100 leading-relaxed" dir="rtl">
              {q.maskedVerse}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === q.correct;

              let btnStyle = "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700";
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                } else if (isSelected) {
                  btnStyle = "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300";
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={isAnswered}
                  className={`p-3 rounded-2xl border text-sm font-semibold transition-all ${btnStyle}`}
                  dir="rtl"
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                {selectedAnswer === q.correct ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Correct! Ma sha Allah
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center gap-1">
                    <X className="w-4 h-4" /> Correct answer: {q.correct}
                  </span>
                )}
              </div>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-all shadow-sm"
              >
                {currentQ < questions.length - 1 ? "Next Question" : "View Results"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
            🎉
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Quiz Completed!</h3>
            <p className="text-xs text-stone-400 mt-1">
              You scored <span className="font-bold text-emerald-600">{score}</span> out of {questions.length}
            </p>
          </div>

          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${(score / questions.length) * 100}%` }}
            />
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Practice</span>
          </button>
        </div>
      )}
    </div>
  );
};
