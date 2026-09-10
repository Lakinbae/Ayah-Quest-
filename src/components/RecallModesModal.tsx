import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Layers, Shuffle, ArrowLeft, ArrowRight, Eye, 
  EyeOff, Volume2, Play, Pause, RotateCcw, CheckCircle2, HelpCircle 
} from 'lucide-react';
import { Ayah } from '../types';
import { RECITERS } from '../data/quranData';

interface RecallModesModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayahs: Ayah[];
  currentReciterId?: string;
}

export const RecallModesModal: React.FC<RecallModesModalProps> = ({
  isOpen,
  onClose,
  ayahs,
  currentReciterId = 'ar.alafasy',
}) => {
  const [activeMode, setActiveMode] = useState<string>('first_words');
  const [ayahIndex, setAyahIndex] = useState<number>(0);
  const [revealedIndices, setRevealedIndices] = useState<Record<number, boolean>>({});
  const [revealedWordCount, setRevealedWordCount] = useState<number>(0);
  const [customOrder, setCustomOrder] = useState<Ayah[]>([...ayahs]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showAllWords, setShowAllWords] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (ayahs.length > 0) {
      setCustomOrder([...ayahs]);
      setAyahIndex(0);
      setRevealedIndices({});
      setRevealedWordCount(0);
      setShowAllWords(false);
    }
  }, [ayahs]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  const currentAyah = customOrder[ayahIndex] || customOrder[0] || ayahs[0];
  const words = currentAyah ? currentAyah.text.split(/\s+/).filter(Boolean) : [];

  const reciter = RECITERS.find((r) => r.id === currentReciterId) || RECITERS[0];

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    setAyahIndex(0);
    setRevealedIndices({});
    setRevealedWordCount(0);
    setShowAllWords(false);
    if (audioRef.current) audioRef.current.pause();
    setIsPlayingAudio(false);

    if (mode === 'random_order') {
      const shuffled = [...ayahs].sort(() => Math.random() - 0.5);
      setCustomOrder(shuffled);
    } else if (mode === 'reverse_order') {
      setCustomOrder([...ayahs].reverse());
    } else {
      setCustomOrder([...ayahs]);
    }
  };

  const toggleWordReveal = (idx: number) => {
    setRevealedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleAudio = () => {
    if (!currentAyah) return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    if (isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      const s = String(currentAyah.surahNumber || 1).padStart(3, '0');
      const a = String(currentAyah.number).padStart(3, '0');
      audio.src = `${reciter.cdnPath}/${s}${a}.mp3`;
      audio
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch((e) => console.warn('Audio play error:', e));
      audio.onended = () => setIsPlayingAudio(false);
    }
  };

  const modes = [
    { 
      id: 'first_words', 
      name: 'First Words', 
      desc: 'First 2 words shown as memory anchor; test the rest' 
    },
    { 
      id: 'hidden_ayah', 
      name: 'Hidden Ayah', 
      desc: 'Complete verse masked; recite purely from memory' 
    },
    { 
      id: 'missing_words', 
      name: 'Missing Words', 
      desc: 'Periodic gaps across verse test key vocabulary' 
    },
    { 
      id: 'continue_ayah', 
      name: 'Continue Verse', 
      desc: 'Opening half shown; complete the second half' 
    },
    { 
      id: 'word_reveal', 
      name: 'Word-by-Word', 
      desc: 'Reveal one word at a time in sequence' 
    },
    { 
      id: 'random_order', 
      name: 'Random Recall', 
      desc: 'Tests ayahs out of sequential context' 
    },
    { 
      id: 'reverse_order', 
      name: 'Reverse Order', 
      desc: 'Recite from bottom to top to anchor strong endings' 
    },
  ];

  const currentModeObj = modes.find((m) => m.id === activeMode) || modes[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#faf8f5] dark:bg-stone-900 w-full max-w-lg rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative my-8 max-h-[92vh] overflow-y-auto space-y-4">
        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.pause();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pr-8">
          <Layers className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              7 Active Recall Modes
            </h2>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
              100% Free Cognitive Memory Training
            </p>
          </div>
        </div>

        {/* Mode Selector Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeMode === m.id
                  ? 'bg-emerald-700 text-white shadow-xs scale-102'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Mode Instruction Banner */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-emerald-900 dark:text-emerald-200">
              {currentModeObj.name}:
            </span>{' '}
            <span className="text-stone-700 dark:text-stone-300 text-[11px]">
              {currentModeObj.desc}
            </span>
          </div>
          <button
            onClick={() => setShowAllWords(!showAllWords)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-[11px] font-bold flex items-center gap-1 shrink-0 ml-2"
          >
            {showAllWords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showAllWords ? 'Mask' : 'Reveal All'}</span>
          </button>
        </div>

        {/* Current Verse Active Recall Display */}
        <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200/90 dark:border-stone-700 text-center min-h-[200px] flex flex-col justify-center items-center relative shadow-xs">
          <div className="flex items-center justify-between w-full mb-3 text-xs text-stone-500 dark:text-stone-400">
            <span className="font-bold">
              {currentAyah.surahName} : Ayah {currentAyah.number} ({ayahIndex + 1} of {customOrder.length})
            </span>

            <button
              onClick={toggleAudio}
              className="px-2 py-1 rounded-lg bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 border border-emerald-600/20 text-[11px] font-bold flex items-center gap-1"
            >
              {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span>Listen</span>
            </button>
          </div>

          {/* Interactive Words Flow */}
          <div className="w-full flex flex-wrap justify-center items-center gap-2 font-quran text-2xl md:text-3xl leading-loose my-2 select-none" dir="rtl">
            {words.map((w, idx) => {
              let isMaskedByDefault = false;

              if (activeMode === 'first_words') {
                isMaskedByDefault = idx >= 2;
              } else if (activeMode === 'hidden_ayah') {
                isMaskedByDefault = true;
              } else if (activeMode === 'missing_words') {
                isMaskedByDefault = idx % 3 === 1;
              } else if (activeMode === 'continue_ayah') {
                isMaskedByDefault = idx >= Math.floor(words.length / 2);
              } else if (activeMode === 'word_reveal') {
                isMaskedByDefault = idx >= revealedWordCount;
              }

              const isManuallyRevealed = revealedIndices[idx] || showAllWords;
              const isMasked = isMaskedByDefault && !isManuallyRevealed;

              if (isMasked) {
                return (
                  <button
                    key={idx}
                    onClick={() => toggleWordReveal(idx)}
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold tracking-wider transition-all active:scale-95 shadow-xs"
                    title="Tap to reveal word"
                  >
                    <span>[ • • • ]</span>
                  </button>
                );
              }

              return (
                <span
                  key={idx}
                  onClick={() => toggleWordReveal(idx)}
                  className="cursor-pointer text-emerald-950 dark:text-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  {w}
                </span>
              );
            })}
          </div>

          {activeMode === 'word_reveal' && (
            <button
              onClick={() => setRevealedWordCount((prev) => Math.min(prev + 1, words.length))}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Tap to Reveal Next Word ({revealedWordCount}/{words.length})</span>
            </button>
          )}

          <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 italic max-w-sm">
            "{currentAyah.translation}"
          </p>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              setIsPlayingAudio(false);
              setAyahIndex((prev) => Math.max(0, prev - 1));
              setRevealedIndices({});
              setRevealedWordCount(0);
              setShowAllWords(false);
            }}
            disabled={ayahIndex <= 0}
            className="flex-1 py-2.5 rounded-2xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Ayah</span>
          </button>

          <button
            onClick={() => {
              setRevealedIndices({});
              setRevealedWordCount(0);
              setShowAllWords(false);
            }}
            className="p-2.5 rounded-2xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:bg-stone-100"
            title="Reset Masking"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              setIsPlayingAudio(false);
              setAyahIndex((prev) => Math.min(customOrder.length - 1, prev + 1));
              setRevealedIndices({});
              setRevealedWordCount(0);
              setShowAllWords(false);
            }}
            disabled={ayahIndex >= customOrder.length - 1}
            className="flex-1 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-xs"
          >
            <span>Next Ayah</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
