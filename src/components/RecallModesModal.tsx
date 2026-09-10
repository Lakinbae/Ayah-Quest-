import React, { useState } from 'react';
import { X, Layers, Shuffle, ArrowLeft, ArrowRight, Eye, RefreshCw, CheckCircle } from 'lucide-react';
import { Ayah } from '../types';

interface RecallModesModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayahs: Ayah[];
}

export const RecallModesModal: React.FC<RecallModesModalProps> = ({
  isOpen,
  onClose,
  ayahs,
}) => {
  const [activeMode, setActiveMode] = useState<string>('first_words');
  const [ayahIndex, setAyahIndex] = useState<number>(0);
  const [revealedWordCount, setRevealedWordCount] = useState<number>(0);
  const [customOrder, setCustomOrder] = useState<Ayah[]>([...ayahs]);

  if (!isOpen) return null;

  const currentAyah = customOrder[ayahIndex] || customOrder[0];
  const words = currentAyah ? currentAyah.text.split(' ') : [];

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    setAyahIndex(0);
    setRevealedWordCount(0);

    if (mode === 'random_order') {
      const shuffled = [...ayahs].sort(() => Math.random() - 0.5);
      setCustomOrder(shuffled);
    } else if (mode === 'reverse_order') {
      setCustomOrder([...ayahs].reverse());
    } else {
      setCustomOrder([...ayahs]);
    }
  };

  const modes = [
    { id: 'first_words', name: 'First Words', desc: 'Opening words shown' },
    { id: 'hidden_ayah', name: 'Hidden Ayah', desc: 'Full verse masked' },
    { id: 'missing_words', name: 'Missing Words', desc: 'Gaps across verse' },
    { id: 'continue_ayah', name: 'Continue Verse', desc: 'First half revealed' },
    { id: 'word_reveal', name: 'Word Reveal', desc: 'Tap to unmask words' },
    { id: 'random_order', name: 'Random Recall', desc: 'Non-sequential testing' },
    { id: 'reverse_order', name: 'Reverse Order', desc: 'Anchor backwards' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            7 Active Recall Modes
          </h2>
        </div>

        {/* Mode Selector Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeMode === m.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Current Verse Active Recall Display */}
        <div className="bg-stone-50 dark:bg-stone-850 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 text-center min-h-[180px] flex flex-col justify-center items-center relative">
          <div className="text-xs font-bold text-stone-400 mb-2">
            {currentAyah.surahName} : Ayah {currentAyah.number} ({ayahIndex + 1}/{customOrder.length})
          </div>

          <div className="w-full flex flex-wrap justify-center gap-2 font-quran text-2xl leading-loose" dir="rtl">
            {words.map((w, idx) => {
              let isMasked = false;

              if (activeMode === 'first_words') {
                isMasked = idx >= 2;
              } else if (activeMode === 'hidden_ayah') {
                isMasked = true;
              } else if (activeMode === 'missing_words') {
                isMasked = idx % 3 === 1;
              } else if (activeMode === 'continue_ayah') {
                isMasked = idx >= Math.floor(words.length / 2);
              } else if (activeMode === 'word_reveal') {
                isMasked = idx >= revealedWordCount;
              }

              if (isMasked) {
                return (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1 bg-stone-200 dark:bg-stone-700 rounded-lg text-transparent select-none cursor-pointer border border-dashed border-stone-400"
                    onClick={() => {
                      if (activeMode === 'word_reveal') setRevealedWordCount(prev => prev + 1);
                    }}
                  >
                    {w}
                  </span>
                );
              }

              return (
                <span key={idx} className="text-stone-900 dark:text-stone-100">
                  {w}
                </span>
              );
            })}
          </div>

          {activeMode === 'word_reveal' && (
            <button
              onClick={() => setRevealedWordCount(prev => prev + 1)}
              className="mt-4 px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Tap to Reveal Next Word ({revealedWordCount}/{words.length})</span>
            </button>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              if (ayahIndex > 0) {
                setAyahIndex(prev => prev - 1);
                setRevealedWordCount(0);
              }
            }}
            disabled={ayahIndex === 0}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold disabled:opacity-40 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => {
              if (ayahIndex < customOrder.length - 1) {
                setAyahIndex(prev => prev + 1);
                setRevealedWordCount(0);
              }
            }}
            disabled={ayahIndex === customOrder.length - 1}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold disabled:opacity-40 flex items-center gap-1 shadow-sm"
          >
            <span>Next Verse</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
