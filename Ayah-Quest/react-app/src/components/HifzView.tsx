import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Eye, EyeOff, Mic, Layers, Settings2, Check, AlertTriangle, XCircle, Volume2 } from 'lucide-react';
import { Ayah, Reciter } from '../types';
import { SURAHS_DATA, RECITERS } from '../data/quranData';

interface HifzViewProps {
  onOpenRecitation: (ayah: Ayah) => void;
  onOpenRecallModes: (ayahs: Ayah[]) => void;
  currentReciterId: string;
  onReciterChange: (id: string) => void;
  onLogReview: (ayah: Ayah, result: 'perfect' | 'hesitant' | 'weak') => void;
}

export const HifzView: React.FC<HifzViewProps> = ({
  onOpenRecitation,
  onOpenRecallModes,
  currentReciterId,
  onReciterChange,
  onLogReview,
}) => {
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(67);
  const surah = SURAHS_DATA[selectedSurahNum] || SURAHS_DATA[67];
  const ayahs = surah.ayahs;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [targetReps, setTargetReps] = useState<number>(3);
  const [currentRep, setCurrentRep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [showRangeModal, setShowRangeModal] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentAyah = ayahs[currentIndex] || ayahs[0];
  const reciter = RECITERS.find(r => r.id === currentReciterId) || RECITERS[0];

  const getAudioUrl = (sNum: number, aNum: number) => {
    const s = String(sNum).padStart(3, '0');
    const a = String(aNum).padStart(3, '0');
    return `${reciter.cdnPath}/${s}${a}.mp3`;
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleEnded = () => {
      if (currentRep < targetReps) {
        setCurrentRep(prev => prev + 1);
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        if (currentIndex < ayahs.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setCurrentRep(1);
          setIsMasked(false);
        } else {
          setIsPlaying(false);
        }
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [currentRep, targetReps, currentIndex, ayahs.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const url = getAudioUrl(currentAyah.surahNumber, currentAyah.number);
      if (audioRef.current.src !== url) {
        audioRef.current.src = url;
      }
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.warn('Audio play error:', e);
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < ayahs.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentRep(1);
      setIsMasked(false);
      if (isPlaying && audioRef.current) {
        const nextAyah = ayahs[currentIndex + 1];
        audioRef.current.src = getAudioUrl(nextAyah.surahNumber, nextAyah.number);
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentRep(1);
      setIsMasked(false);
      if (isPlaying && audioRef.current) {
        const prevAyah = ayahs[currentIndex - 1];
        audioRef.current.src = getAudioUrl(prevAyah.surahNumber, prevAyah.number);
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleGrading = (result: 'perfect' | 'hesitant' | 'weak') => {
    onLogReview(currentAyah, result);
    handleNext();
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Range Selection */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            Hifz Studio
          </span>
          <h2 className="text-lg font-black text-stone-900 dark:text-stone-100">
            Surah {surah.englishName} ({surah.number})
          </h2>
        </div>
        <button
          onClick={() => setShowRangeModal(!showRangeModal)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-center gap-1"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Change Surah</span>
        </button>
      </div>

      {/* Quick Surah Picker Modal */}
      {showRangeModal && (
        <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md space-y-2">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Select Surah</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.values(SURAHS_DATA).map(s => (
              <button
                key={s.number}
                onClick={() => {
                  setSelectedSurahNum(s.number);
                  setCurrentIndex(0);
                  setCurrentRep(1);
                  setShowRangeModal(false);
                  if (audioRef.current) audioRef.current.pause();
                  setIsPlaying(false);
                }}
                className={`p-2.5 rounded-xl text-left border ${
                  selectedSurahNum === s.number
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <div>{s.number}. {s.englishName}</div>
                <div className="text-[10px] text-stone-400">{s.name} ({s.numberOfAyahs} ayahs)</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Repetition Cycle Controls & Ayah Index */}
      <div className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
            Rep {currentRep} / {targetReps >= 999 ? '∞' : targetReps}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            Ayah {currentIndex + 1} of {ayahs.length}
          </span>
        </div>

        {/* Repetition Chips (1x, 2x, 3x, 5x, 10x, ∞) */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 5, 10, 999].map(num => (
            <button
              key={num}
              onClick={() => {
                setTargetReps(num);
                setCurrentRep(1);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                targetReps === num
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              {num === 999 ? '∞' : `${num}x`}
            </button>
          ))}
        </div>
      </div>

      {/* Ayah Memorization Display Card */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm text-center min-h-[220px] flex flex-col justify-center items-center relative transition-all">
        <div className="flex items-center justify-between w-full mb-3">
          <span className="text-xs font-bold text-stone-400">
            {currentAyah.surahName} : Ayah {currentAyah.number}
          </span>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-medium">{reciter.name.split(' ')[0]}</span>
          </div>
        </div>

        {/* Masked vs Visible Quranic Text */}
        {!isMasked ? (
          <div className="w-full py-3">
            <p className="font-quran text-2xl md:text-3xl text-stone-900 dark:text-stone-100 leading-loose transition-all" dir="rtl">
              {currentAyah.text}
            </p>
          </div>
        ) : (
          <div className="my-4 py-8 px-6 bg-stone-100 dark:bg-stone-850 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 w-full text-center space-y-1">
            <p className="text-sm font-bold text-stone-600 dark:text-stone-300">
              Verse masked for active mental recall
            </p>
            <p className="text-xs text-stone-400">
              Recite from memory first, then tap Reveal to verify.
            </p>
          </div>
        )}

        {/* Translation */}
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 max-w-md leading-relaxed">
          {currentAyah.translation}
        </p>
      </div>

      {/* Primary Audio & Playback Control Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 flex items-center justify-between shadow-sm">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 disabled:opacity-40"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={handleReplay}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlayPause}
          className="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
        </button>

        <button
          onClick={() => setIsMasked(!isMasked)}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            isMasked
              ? 'bg-emerald-600 text-white'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}
        >
          {isMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{isMasked ? 'Reveal' : 'Hide'}</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === ayahs.length - 1}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 disabled:opacity-40"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Recall Evaluation & SRS Grading Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleGrading('perfect')}
          className="py-3 px-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
        >
          <div className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Known</span>
          </div>
          <span className="text-[10px] font-normal opacity-80">Smooth recall</span>
        </button>

        <button
          onClick={() => handleGrading('hesitant')}
          className="py-3 px-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
        >
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Hesitant</span>
          </div>
          <span className="text-[10px] font-normal opacity-80">Needed effort</span>
        </button>

        <button
          onClick={() => handleGrading('weak')}
          className="py-3 px-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
        >
          <div className="flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Weak</span>
          </div>
          <span className="text-[10px] font-normal opacity-80">Prioritize rep</span>
        </button>
      </div>

      {/* Secondary Interactive Modules: Speech Recitation & 7 Recall Modes */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onOpenRecitation(currentAyah)}
          className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Recitation Practice</span>
        </button>

        <button
          onClick={() => onOpenRecallModes(ayahs)}
          className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Layers className="w-4 h-4 text-amber-500" />
          <span>7 Recall Modes</span>
        </button>
      </div>
    </div>
  );
};
