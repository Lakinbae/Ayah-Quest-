import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, 
  Eye, EyeOff, AlertTriangle, Check, XCircle, Mic, Layers, 
  HelpCircle, Settings2, Sparkles, Search, ChevronDown, 
  Bookmark, Award, Info, Lock
} from 'lucide-react';
import { Ayah, Surah, UserProfile } from '../types';
import { RECITERS, SURAHS_DATA } from '../data/quranData';
import { SURAH_LIST } from '../data/surahList';
import { fetchSurah } from '../data/quranApi';

interface HifzViewProps {
  user?: UserProfile;
  currentReciterId: string;
  initialSurah?: number;
  targetSurahNum?: number;
  onSurahChange?: (surahNum: number) => void;
  onReciterChange?: (id: string) => void;
  onLogReview: (ayah: Ayah, result: 'perfect' | 'hesitant' | 'weak') => void;
  onOpenRecitation: (ayah: Ayah) => void;
  onOpenRecallModes: (ayahs: Ayah[]) => void;
  onOpenPro?: () => void;
}

export const HifzView: React.FC<HifzViewProps> = ({
  user,
  currentReciterId,
  initialSurah,
  targetSurahNum,
  onSurahChange,
  onReciterChange,
  onLogReview,
  onOpenRecitation,
  onOpenRecallModes,
  onOpenPro,
}) => {
  const initialSurahNum = initialSurah || targetSurahNum || user?.target_surah || 1;
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(initialSurahNum);
  const [surahData, setSurahData] = useState<Surah>(SURAHS_DATA[initialSurahNum] || SURAHS_DATA[1]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [targetReps, setTargetReps] = useState<number>(3);
  const [currentRep, setCurrentRep] = useState<number>(1);
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showRangeModal, setShowRangeModal] = useState<boolean>(false);
  const [surahSearch, setSurahSearch] = useState<string>('');
  const [showSrsGuide, setShowSrsGuide] = useState<boolean>(false);
  const [showProWordNotice, setShowProWordNotice] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentRepRef = useRef<number>(1);
  const targetRepsRef = useRef<number>(targetReps);
  const currentIndexRef = useRef<number>(currentIndex);
  const ayahsRef = useRef<Ayah[]>([]);
  const selectedSurahNumRef = useRef<number>(selectedSurahNum);
  const isPlayingRef = useRef<boolean>(isPlaying);

  // Sync refs with state
  useEffect(() => {
    targetRepsRef.current = targetReps;
  }, [targetReps]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    currentRepRef.current = currentRep;
  }, [currentRep]);

  useEffect(() => {
    selectedSurahNumRef.current = selectedSurahNum;
  }, [selectedSurahNum]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Load surah data whenever selectedSurahNum changes
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchSurah(selectedSurahNum);
        if (isMounted) {
          setSurahData(data);
          ayahsRef.current = data.ayahs || [];
        }
      } catch (err) {
        console.error('Error fetching surah:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [selectedSurahNum]);

  const ayahs = surahData.ayahs || [];
  ayahsRef.current = ayahs;

  const currentAyah: Ayah = ayahs[currentIndex] || {
    number: 1,
    surahNumber: selectedSurahNum,
    surahName: surahData.englishName,
    text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
  };

  const reciter = RECITERS.find((r) => r.id === currentReciterId) || RECITERS[0];

  const getAudioUrl = (sNum: number, aNum: number) => {
    const s = String(sNum).padStart(3, '0');
    const a = String(aNum).padStart(3, '0');
    return `${reciter.cdnPath}/${s}${a}.mp3`;
  };

  // Persistent Audio element & robust loop listener
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleEnded = () => {
      const target = targetRepsRef.current;
      const current = currentRepRef.current;
      const cIdx = currentIndexRef.current;
      const allAyahs = ayahsRef.current;
      const sNum = selectedSurahNumRef.current;

      // Repeat current Ayah if repetition target not yet reached
      if (current < target || target === 999) {
        const nextRep = current + 1;
        currentRepRef.current = nextRep;
        setCurrentRep(nextRep);
        audio.currentTime = 0;
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((e) => {
          console.warn('Audio repetition error:', e);
        });
      } else {
        // Target repetitions reached! Auto advance to next ayah in the Surah
        if (cIdx < allAyahs.length - 1) {
          const nextIdx = cIdx + 1;
          currentIndexRef.current = nextIdx;
          currentRepRef.current = 1;
          setCurrentIndex(nextIdx);
          setCurrentRep(1);
          setIsMasked(false);

          const nextAyah = allAyahs[nextIdx];
          const s = String(nextAyah.surahNumber || sNum).padStart(3, '0');
          const a = String(nextAyah.number).padStart(3, '0');
          audio.src = `${reciter.cdnPath}/${s}${a}.mp3`;
          audio.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {});
        } else {
          // Reached end of Surah
          setIsPlaying(false);
          currentRepRef.current = 1;
          setCurrentRep(1);
        }
      }
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [reciter.cdnPath]);

  // Adjust audio playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlayPause = () => {
    if (!audioRef.current || ayahs.length === 0) return;
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const expectedUrl = getAudioUrl(currentAyah.surahNumber || selectedSurahNum, currentAyah.number);
      if (!audio.src || !audio.src.includes(expectedUrl.slice(-10))) {
        audio.src = expectedUrl;
      }
      audio.playbackRate = playbackSpeed;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.warn('Audio play error:', e));
    }
  };

  const handleNextAyah = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    if (currentIndex < ayahs.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      currentIndexRef.current = nextIdx;
      setCurrentRep(1);
      currentRepRef.current = 1;
      setIsMasked(false);
    }
  };

  const handlePrevAyah = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      currentIndexRef.current = prevIdx;
      setCurrentRep(1);
      currentRepRef.current = 1;
      setIsMasked(false);
    }
  };

  const handleRestartRep = () => {
    setCurrentRep(1);
    currentRepRef.current = 1;
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleSelectSurah = (surahNum: number) => {
    setSelectedSurahNum(surahNum);
    selectedSurahNumRef.current = surahNum;
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setCurrentRep(1);
    currentRepRef.current = 1;
    setShowRangeModal(false);
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    if (onSurahChange) {
      onSurahChange(surahNum);
    }
  };

  const handleGrading = (result: 'perfect' | 'hesitant' | 'weak') => {
    onLogReview(currentAyah, result);
    handleNextAyah();
  };

  const filteredSurahs = SURAH_LIST.filter(
    (s) =>
      s.englishName.toLowerCase().includes(surahSearch.toLowerCase()) ||
      s.name.includes(surahSearch) ||
      String(s.number) === surahSearch.trim()
  );

  return (
    <div className="space-y-4">
      {/* Header & Change Surah Button */}
      <div className="flex items-center justify-between bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
            {selectedSurahNum}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>{surahData.englishName}</span>
              <span className="text-stone-500 dark:text-stone-400 text-xs font-normal">({surahData.name})</span>
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {ayahs.length} Ayahs • {reciter.name.split(' ')[0]} {reciter.name.split(' ')[1] || ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRangeModal(!showRangeModal)}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 flex items-center gap-1.5 hover:border-emerald-600 shadow-xs transition-all"
        >
          <Settings2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Change Surah</span>
        </button>
      </div>

      {/* 114 Surahs Picker Dropdown / Modal */}
      {showRangeModal && (
        <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-emerald-600/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Choose from all 114 Surahs
              </h3>
            </div>
            <button
              onClick={() => setShowRangeModal(false)}
              className="text-xs font-semibold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              Close
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by name, number, meaning..."
            value={surahSearch}
            onChange={(e) => setSurahSearch(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
          />

          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {filteredSurahs.map((s) => (
              <button
                key={s.number}
                onClick={() => handleSelectSurah(s.number)}
                className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                  selectedSurahNum === s.number
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 text-[11px] opacity-70 font-mono">#{s.number}</span>
                  <span>{s.englishName}</span>
                  <span className="text-[10px] opacity-60">({s.englishNameTranslation})</span>
                </div>
                <span className="font-amiri font-bold text-sm">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Repetition Cycle Selector & Masking */}
      <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Repetition Loop: {targetReps === 999 ? '∞' : `${currentRep} of ${targetReps}`}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMasked(!isMasked)}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isMasked
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700'
              }`}
            >
              {isMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isMasked ? 'Masked' : 'Visible'}</span>
            </button>
          </div>
        </div>

        {/* Repetition Targets */}
        <div className="flex items-center justify-between gap-1.5">
          {[1, 2, 3, 5, 10, 999].map((reps) => (
            <button
              key={reps}
              onClick={() => {
                setTargetReps(reps);
                targetRepsRef.current = reps;
                setCurrentRep(1);
                currentRepRef.current = 1;
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                targetReps === reps
                  ? 'bg-emerald-700 text-white shadow-xs scale-102'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750 hover:bg-stone-100'
              }`}
            >
              {reps === 999 ? '∞' : `${reps}x`}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-16 text-center text-stone-500 flex flex-col items-center justify-center gap-2 bg-[#faf8f5] dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading Surah ayahs...</span>
        </div>
      ) : (
        /* Ayah Memorization Display Card */
        <div className="bg-[#faf8f5] dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm text-center min-h-[220px] flex flex-col justify-center items-center relative transition-all">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
              {currentAyah.surahName || surahData.englishName} : Ayah {currentAyah.number}
            </span>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-medium">{reciter.name.split(' ')[0]}</span>
            </div>
          </div>

          {/* Masked vs Visible Quranic Text */}
          {!isMasked ? (
            <div className="w-full py-3">
              <p
                className="font-quran text-2xl md:text-3xl text-stone-900 dark:text-stone-100 leading-loose transition-all select-none"
                dir="rtl"
              >
                {currentAyah.text}
              </p>
            </div>
          ) : (
            <div className="my-4 py-6 px-6 bg-stone-100 dark:bg-stone-850 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 w-full text-center space-y-2">
              <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                Verse masked for active mental recall
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Recite from memory first, then tap Reveal or hold Peek below.
              </p>
              <button
                onMouseDown={() => setIsMasked(false)}
                onMouseUp={() => setIsMasked(true)}
                onTouchStart={() => setIsMasked(false)}
                onTouchEnd={() => setIsMasked(true)}
                className="px-3 py-1 bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold active:scale-95"
              >
                Hold to Peek
              </button>
            </div>
          )}

          {/* Translation */}
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 max-w-md leading-relaxed">
            {currentAyah.translation}
          </p>

          {/* Mutashabihat Warning Badge if Present */}
          {currentAyah.mutashabihat && currentAyah.mutashabihat.length > 0 && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-[11px] text-left">
                <strong>Twin Verse alert:</strong> Similar wording exists in {currentAyah.mutashabihat[0].surahName}.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Audio Playback Controls */}
      <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm flex items-center justify-between">
        {/* Speed Selector */}
        <div className="flex items-center gap-1">
          {[0.75, 1.0, 1.25].map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                playbackSpeed === speed
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Previous Ayah */}
        <button
          onClick={handlePrevAyah}
          disabled={currentIndex <= 0}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 disabled:opacity-40"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="w-14 h-14 rounded-3xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-white" />
          ) : (
            <Play className="w-6 h-6 fill-white ml-0.5" />
          )}
        </button>

        {/* Restart Repetition */}
        <button
          onClick={handleRestartRep}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700"
          title="Restart repetition loop"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Next Ayah */}
        <button
          onClick={handleNextAyah}
          disabled={currentIndex >= ayahs.length - 1}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 disabled:opacity-40"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Recall Evaluation & SRS Grading Buttons with Explanation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400">
            How was your recall of this Ayah?
          </span>
          <button
            onClick={() => setShowSrsGuide(!showSrsGuide)}
            className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
          >
            <Info className="w-3 h-3" />
            <span>What do these buttons do?</span>
          </button>
        </div>

        {/* Explanatory banner if opened */}
        {showSrsGuide && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs space-y-1.5 text-stone-700 dark:text-stone-300 animate-in fade-in">
            <p className="font-bold text-emerald-800 dark:text-emerald-300">
              💡 Spaced Repetition (SRS) Grading System:
            </p>
            <p>
              • <strong>Known (متقن):</strong> Ayah recalled fluently with zero doubt. Schedules next review in <strong>7 to 14 days</strong>.
            </p>
            <p>
              • <strong>Hesitant (متردد):</strong> Recalled but with pauses or slight doubt. Schedules next review in <strong>3 days</strong>.
            </p>
            <p>
              • <strong>Weak (ضعيف):</strong> Forgot words or stumbled. Immediately queued in <strong>Today's Review Queue</strong> for tomorrow.
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              All your ratings are saved in your personal Hifz ledger so you never forget a memorized verse.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleGrading('perfect')}
            className="py-3 px-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
          >
            <div className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Known</span>
            </div>
            <span className="text-[10px] font-normal opacity-85">Reviews in 7d</span>
          </button>

          <button
            onClick={() => handleGrading('hesitant')}
            className="py-3 px-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
          >
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Hesitant</span>
            </div>
            <span className="text-[10px] font-normal opacity-85">Reviews in 3d</span>
          </button>

          <button
            onClick={() => handleGrading('weak')}
            className="py-3 px-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-800 dark:text-rose-300 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
          >
            <div className="flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Weak</span>
            </div>
            <span className="text-[10px] font-normal opacity-85">Daily queue</span>
          </button>
        </div>
      </div>

      {/* Free 100% Feature Access: Live Recitation & 7 Recall Modes */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onOpenRecitation(currentAyah)}
          className="p-3.5 rounded-2xl bg-[#faf8f5] dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-emerald-600 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
        >
          <Mic className="w-4 h-4 text-emerald-600" />
          <span>Recitation Mic Test</span>
        </button>

        <button
          onClick={() => onOpenRecallModes(ayahs)}
          className="p-3.5 rounded-2xl bg-[#faf8f5] dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 hover:border-amber-500 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
        >
          <Layers className="w-4 h-4 text-amber-600" />
          <span>7 Active Recall Modes</span>
        </button>
      </div>

      {/* Pro Extreme Feature Teaser */}
      <div className="p-3 bg-gradient-to-r from-emerald-900/10 to-amber-900/10 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <div>
            <span className="font-bold text-stone-900 dark:text-stone-100">Word-by-Word Grammatical Analysis</span>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">Deep Arabic root & I'rab linguistic breakdown</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (user?.is_pro) {
              alert('✨ Ayah Quest Pro Active: Word-by-word linguistic morphology unlocked for this verse.');
            } else if (onOpenPro) {
              onOpenPro();
            } else {
              setShowProWordNotice(true);
            }
          }}
          className="px-2.5 py-1.5 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 font-black text-[11px] border border-amber-400/30 flex items-center gap-1"
        >
          {!user?.is_pro && <Lock className="w-3 h-3" />}
          <span>{user?.is_pro ? 'Explore' : 'PRO'}</span>
        </button>
      </div>

      {/* Pro Modal Notice if Clicked */}
      {showProWordNotice && (
        <div className="p-4 bg-white dark:bg-stone-900 rounded-3xl border border-amber-500/30 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-amber-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Ayah Quest Pro Feature
            </span>
            <button
              onClick={() => setShowProWordNotice(false)}
              className="text-stone-400 hover:text-stone-600 text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-stone-700 dark:text-stone-300">
            Word-by-Word Grammatical I'rab & Root Analysis is part of <strong>Ayah Quest Pro</strong>.
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            All core memorization, 114 Surahs, audio repetitions, and all 7 Active Recall modes remain <strong>100% free</strong> for everyone.
          </p>
          <button
            onClick={() => {
              setShowProWordNotice(false);
              onOpenPro();
            }}
            className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-xs"
          >
            Upgrade to Pro (50 ETB / 20 Stars)
          </button>
        </div>
      )}
    </div>
  );
};
