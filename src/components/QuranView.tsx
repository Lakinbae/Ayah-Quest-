import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, Type, Eye, EyeOff, AlertTriangle, 
  Search, BookOpen, Layers, ChevronLeft, ChevronRight, Loader2, 
  Bookmark, Share2, SkipBack, SkipForward, X, Check, ArrowRight
} from 'lucide-react';
import { Surah, Ayah } from '../types';
import { RECITERS, SURAHS_DATA } from '../data/quranData';
import { SURAH_LIST } from '../data/surahList';
import { fetchSurah, fetchPage } from '../data/quranApi';
import { 
  toArabicDigits, 
  getAyahBookmark, 
  saveAyahBookmark, 
  removeAyahBookmark, 
  copyAyahToClipboard, 
  AyahBookmark 
} from '../utils/quranUtils';

interface QuranViewProps {
  currentReciterId: string;
  initialSurah?: number;
}

export const QuranView: React.FC<QuranViewProps> = ({ currentReciterId, initialSurah = 1 }) => {
  const [viewMode, setViewMode] = useState<'surah' | 'page'>('surah');
  const [selectedSurah, setSelectedSurah] = useState<number>(initialSurah);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [surahSearch, setSurahSearch] = useState<string>('');

  const [currentSurahData, setCurrentSurahData] = useState<Surah>(SURAHS_DATA[selectedSurah] || SURAHS_DATA[1]);
  const [pageAyahs, setPageAyahs] = useState<Ayah[]>([]);
  const [pageSurahNames, setPageSurahNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [fontSize, setFontSize] = useState<number>(28);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [hideMushaf, setHideMushaf] = useState<boolean>(false);
  const [revealedAyahs, setRevealedAyahs] = useState<Record<string, boolean>>({});

  const [bookmark, setBookmark] = useState<AyahBookmark | null>(() => getAyahBookmark());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoAdvanceRef = useRef<boolean>(true);
  const playingAyahRef = useRef<number | null>(null);
  const playingSurahRef = useRef<number | null>(null);
  const currentListRef = useRef<Ayah[]>([]);
  const selectedSurahRef = useRef<number>(selectedSurah);

  const reciter = RECITERS.find((r) => r.id === currentReciterId) || RECITERS[0];

  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);

  useEffect(() => {
    playingAyahRef.current = playingAyah;
  }, [playingAyah]);

  useEffect(() => {
    playingSurahRef.current = playingSurah;
  }, [playingSurah]);

  useEffect(() => {
    selectedSurahRef.current = selectedSurah;
  }, [selectedSurah]);

  useEffect(() => {
    currentListRef.current = viewMode === 'surah' ? currentSurahData.ayahs : pageAyahs;
  }, [viewMode, currentSurahData, pageAyahs]);

  // Load selected Surah whenever selectedSurah changes in 'surah' mode
  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchSurah(selectedSurah);
        if (!isCancelled) {
          setCurrentSurahData(data);
          const meta = SURAH_LIST.find((s) => s.number === selectedSurah);
          if (meta) {
            setCurrentPage(meta.startPage);
            setPageInput(String(meta.startPage));
          }
        }
      } catch (err) {
        console.error('Error loading surah:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }
    if (viewMode === 'surah') {
      load();
    }
    return () => {
      isCancelled = true;
    };
  }, [selectedSurah, viewMode]);

  // Load selected Page whenever currentPage changes in 'page' mode
  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const result = await fetchPage(currentPage);
        if (!isCancelled) {
          setPageAyahs(result.ayahs);
          setPageSurahNames(result.surahsOnPage);
        }
      } catch (err) {
        console.error('Error loading page:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }
    if (viewMode === 'page') {
      load();
    }
    return () => {
      isCancelled = true;
    };
  }, [currentPage, viewMode]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingAyah(null);
    setPlayingSurah(null);
    setIsAudioPaused(false);
    playingAyahRef.current = null;
    playingSurahRef.current = null;
  };

  const playAyahAudio = (surahNum: number, ayahNumber: number) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    // Toggle pause/play if already on this exact ayah
    if (playingAyahRef.current === ayahNumber && (playingSurahRef.current === surahNum || !playingSurahRef.current)) {
      if (!audio.paused) {
        audio.pause();
        setIsAudioPaused(true);
      } else {
        audio.play().then(() => setIsAudioPaused(false)).catch(() => {});
      }
      return;
    }

    const s = String(surahNum).padStart(3, '0');
    const a = String(ayahNumber).padStart(3, '0');
    audio.src = `${reciter.cdnPath}/${s}${a}.mp3`;
    audio
      .play()
      .then(() => {
        setPlayingAyah(ayahNumber);
        setPlayingSurah(surahNum);
        setIsAudioPaused(false);
        playingAyahRef.current = ayahNumber;
        playingSurahRef.current = surahNum;
      })
      .catch((e) => console.warn('Audio play error:', e));

    audio.onended = () => {
      if (!autoAdvanceRef.current) {
        stopAudio();
        return;
      }
      handlePlayNext();
    };
  };

  const handlePlayNext = () => {
    const list = currentListRef.current;
    const currentA = playingAyahRef.current;
    const currentS = playingSurahRef.current || selectedSurahRef.current;

    if (!currentA || list.length === 0) {
      stopAudio();
      return;
    }

    const currentIdx = list.findIndex(
      (item) => item.number === currentA && (item.surahNumber ? item.surahNumber === currentS : true)
    );

    if (currentIdx !== -1 && currentIdx < list.length - 1) {
      const nextAyah = list[currentIdx + 1];
      const nextS = nextAyah.surahNumber || selectedSurahRef.current;
      playAyahAudio(nextS, nextAyah.number);

      // Smoothly scroll next Ayah into view
      setTimeout(() => {
        const el = document.getElementById(`ayah-card-${nextS}-${nextAyah.number}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    } else {
      stopAudio();
    }
  };

  const handlePlayPrev = () => {
    const list = currentListRef.current;
    const currentA = playingAyahRef.current;
    const currentS = playingSurahRef.current || selectedSurahRef.current;

    if (!currentA || list.length === 0) return;

    const currentIdx = list.findIndex(
      (item) => item.number === currentA && (item.surahNumber ? item.surahNumber === currentS : true)
    );

    if (currentIdx > 0) {
      const prevAyah = list[currentIdx - 1];
      const prevS = prevAyah.surahNumber || selectedSurahRef.current;
      playAyahAudio(prevS, prevAyah.number);

      setTimeout(() => {
        const el = document.getElementById(`ayah-card-${prevS}-${prevAyah.number}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  const handleToggleBookmark = (ayah: Ayah) => {
    const aNum = ayah.number;
    const sNum = ayah.surahNumber || selectedSurah;
    const sMeta = SURAH_LIST.find((s) => s.number === sNum) || activeSurahMeta;

    if (bookmark && bookmark.surahNumber === sNum && bookmark.ayahNumber === aNum) {
      removeAyahBookmark();
      setBookmark(null);
      setToastMessage('Bookmark removed');
      setTimeout(() => setToastMessage(null), 2000);
    } else {
      const newBm: AyahBookmark = {
        surahNumber: sNum,
        ayahNumber: aNum,
        surahName: ayah.surahName || sMeta.englishName,
        text: ayah.text,
        timestamp: new Date().toISOString(),
      };
      saveAyahBookmark(newBm);
      setBookmark(newBm);
      setToastMessage(`📌 Bookmarked Surah ${newBm.surahName}:${newBm.ayahNumber}`);
      setTimeout(() => setToastMessage(null), 2200);
    }
  };

  const handleShareAyah = async (ayah: Ayah) => {
    const sNum = ayah.surahNumber || selectedSurah;
    const sMeta = SURAH_LIST.find((s) => s.number === sNum) || activeSurahMeta;
    const success = await copyAyahToClipboard({
      text: ayah.text,
      translation: ayah.translation,
      surahNumber: sNum,
      ayahNumber: ayah.number,
      surahName: ayah.surahName || sMeta.englishName,
    });
    if (success) {
      setToastMessage('📋 Ayah quote & translation copied! Ready to share');
      setTimeout(() => setToastMessage(null), 2200);
    }
  };

  const handleJumpToBookmark = (bm: AyahBookmark) => {
    if (viewMode !== 'surah') {
      setViewMode('surah');
    }
    if (selectedSurah !== bm.surahNumber) {
      setSelectedSurah(bm.surahNumber);
    }
    setTimeout(() => {
      const el = document.getElementById(`ayah-card-${bm.surahNumber}-${bm.ayahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  const toggleAyahReveal = (key: string) => {
    setRevealedAyahs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filtered surahs for the dropdown / search
  const filteredSurahs = SURAH_LIST.filter(
    (s) =>
      s.englishName.toLowerCase().includes(surahSearch.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(surahSearch.toLowerCase()) ||
      s.name.includes(surahSearch) ||
      String(s.number) === surahSearch.trim()
  );

  const activeSurahMeta = SURAH_LIST.find((s) => s.number === selectedSurah) || SURAH_LIST[0];

  return (
    <div className="space-y-4 relative">
      {/* Dynamic Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-stone-700 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Bookmark Reading Banner */}
      {bookmark && (
        <div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-3xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </div>
            <div className="truncate">
              <span className="font-bold text-stone-800 dark:text-stone-200">
                Bookmarked Spot: Surah {bookmark.surahName}
              </span>
              <span className="text-stone-500 dark:text-stone-400 ml-1.5 text-[11px]">
                (Ayah {bookmark.ayahNumber})
              </span>
            </div>
          </div>
          <button
            onClick={() => handleJumpToBookmark(bookmark)}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs active:scale-95 transition-all"
          >
            <span>Resume</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Navigation Mode Switcher: Surah vs Page */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200 dark:border-stone-800">
            <button
              onClick={() => {
                stopAudio();
                setViewMode('surah');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'surah'
                  ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>By Surah (1–114)</span>
            </button>
            <button
              onClick={() => {
                stopAudio();
                setViewMode('page');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'page'
                  ? 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>By Page (1–604)</span>
            </button>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400">Reciter</span>
            <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate max-w-[130px]">
              {reciter.name.split(' ')[0]} {reciter.name.split(' ')[1] || ''}
            </p>
          </div>
        </div>

        {/* Mode: Surah Selector & Fast Filter */}
        {viewMode === 'surah' ? (
          <div className="space-y-2 pt-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter 114 Surahs (e.g. Kahf, 36, Yasin)..."
                  value={surahSearch}
                  onChange={(e) => setSurahSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <select
                value={selectedSurah}
                onChange={(e) => {
                  stopAudio();
                  setSelectedSurah(Number(e.target.value));
                }}
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600 max-w-[160px]"
              >
                {filteredSurahs.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.englishName} ({s.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {activeSurahMeta.number}. {activeSurahMeta.englishName} ({activeSurahMeta.englishNameTranslation})
              </span>
              <span>{activeSurahMeta.numberOfAyahs} Ayahs • {activeSurahMeta.revelationType}</span>
            </div>
          </div>
        ) : (
          /* Mode: Page Navigator (1 to 604) */
          <div className="flex items-center justify-between pt-1 gap-2">
            <button
              onClick={() => {
                stopAudio();
                setCurrentPage((p) => Math.max(1, p - 1));
                setPageInput(String(Math.max(1, currentPage - 1)));
              }}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 disabled:opacity-30 hover:bg-stone-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-stone-700 dark:text-stone-300">Page:</span>
              <input
                type="number"
                min="1"
                max="604"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    stopAudio();
                    const num = parseInt(pageInput, 10);
                    if (!isNaN(num) && num >= 1 && num <= 604) {
                      setCurrentPage(num);
                    }
                  }
                }}
                className="w-14 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              />
              <span className="text-stone-400">/ 604</span>
              <button
                onClick={() => {
                  stopAudio();
                  const num = parseInt(pageInput, 10);
                  if (!isNaN(num) && num >= 1 && num <= 604) {
                    setCurrentPage(num);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px]"
              >
                Go
              </button>
            </div>

            <button
              onClick={() => {
                stopAudio();
                setCurrentPage((p) => Math.min(604, p + 1));
                setPageInput(String(Math.min(604, currentPage + 1)));
              }}
              disabled={currentPage >= 604}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 disabled:opacity-30 hover:bg-stone-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Font Size, Auto-Advance & Adaptive Hide Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500">
          <div className="flex items-center gap-1.5 flex-1 min-w-[150px]">
            <Type className="w-3.5 h-3.5" />
            <span>Size:</span>
            <input
              type="range"
              min="20"
              max="38"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1 accent-emerald-600 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-[11px] font-bold">{fontSize}px</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !autoAdvance;
                setAutoAdvance(next);
                setToastMessage(next ? '⏩ Auto-advance enabled: Continuous recitation' : '⏸ Auto-advance turned off');
                setTimeout(() => setToastMessage(null), 2000);
              }}
              title="Automatically advance to the next ayah when current ayah finishes"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                autoAdvance
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Auto-Next: {autoAdvance ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                setHideMushaf(!hideMushaf);
                setRevealedAyahs({});
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                hideMushaf
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {hideMushaf ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {hideMushaf ? 'Adaptive: Hidden (Tap to Peek)' : 'Hide Verses'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="py-12 text-center text-stone-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs font-semibold">Loading holy verses from Quran catalog...</span>
        </div>
      )}

      {/* Page Header info when in page mode */}
      {!isLoading && viewMode === 'page' && pageSurahNames.length > 0 && (
        <div className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs text-center text-stone-600 dark:text-stone-300 font-bold border border-stone-200 dark:border-stone-800">
          Page {currentPage} • Surah: {pageSurahNames.join(', ')}
        </div>
      )}

      {/* Ayahs Stream */}
      {!isLoading && (
        <div className="space-y-3">
          {(viewMode === 'surah' ? currentSurahData.ayahs : pageAyahs).map((ayah) => {
            const ayahKey = `${ayah.surahNumber || selectedSurah}_${ayah.number}`;
            const ayahSurahNum = ayah.surahNumber || selectedSurah;
            const isThisPlaying = playingAyah === ayah.number && (playingSurah === ayahSurahNum || !playingSurah);
            const isHidden = hideMushaf && !revealedAyahs[ayahKey];
            const isBookmarked = bookmark?.surahNumber === ayahSurahNum && bookmark?.ayahNumber === ayah.number;

            return (
              <div
                key={ayahKey}
                id={`ayah-card-${ayahSurahNum}-${ayah.number}`}
                className={`p-4 rounded-3xl border transition-all ${
                  isThisPlaying
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-md'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[11px]">
                      {ayahSurahNum}:{ayah.number}
                    </span>
                    {ayah.surahName && viewMode === 'page' && (
                      <span className="text-[11px] font-semibold text-stone-500">
                        {ayah.surahName}
                      </span>
                    )}
                    {ayah.mutashabihat && ayah.mutashabihat.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Mutashabih</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hideMushaf && (
                      <button
                        onClick={() => toggleAyahReveal(ayahKey)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                      >
                        {isHidden ? 'Peek' : 'Hide'}
                      </button>
                    )}

                    {/* Bookmark Spot */}
                    <button
                      onClick={() => handleToggleBookmark(ayah)}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this reading spot'}
                      className={`p-2 rounded-xl border transition-all ${
                        isBookmarked
                          ? 'bg-emerald-600/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-emerald-600 hover:bg-stone-100'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    {/* Share / Copy Ayah Quote */}
                    <button
                      onClick={() => handleShareAyah(ayah)}
                      title="Copy formatted verse quote to share"
                      className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-emerald-600 hover:bg-stone-100 transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Play Audio Button */}
                    <button
                      onClick={() => playAyahAudio(ayahSurahNum, ayah.number)}
                      title={isThisPlaying && !isAudioPaused ? 'Pause recitation' : 'Play recitation'}
                      className={`p-2 rounded-xl border transition-all ${
                        isThisPlaying && !isAudioPaused
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                      }`}
                    >
                      {isThisPlaying && !isAudioPaused ? (
                        <Pause className="w-3.5 h-3.5 fill-white" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Arabic Text with Active Recall Blur */}
                <div className="py-2 text-right relative">
                  <p
                    className={`font-quran leading-loose text-stone-900 dark:text-stone-100 transition-all ${
                      isHidden ? 'blur-md select-none opacity-40' : ''
                    }`}
                    style={{ fontSize: `${fontSize}px` }}
                    dir="rtl"
                  >
                    {ayah.text}{' '}
                    <span className="inline-flex items-center justify-center relative mx-1 align-middle text-emerald-700 dark:text-emerald-400 select-none">
                      <span className="text-[1.3em] font-serif leading-none">۝</span>
                      <span className="absolute inset-0 flex items-center justify-center text-[0.46em] font-sans font-bold leading-none text-emerald-800 dark:text-emerald-300 pointer-events-none mt-[-1px]">
                        {toArabicDigits(ayah.number)}
                      </span>
                    </span>
                  </p>
                  {isHidden && (
                    <div
                      onClick={() => toggleAyahReveal(ayahKey)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    >
                      <span className="px-3 py-1.5 rounded-xl bg-stone-900/80 text-white text-xs font-bold backdrop-blur-sm shadow-md">
                        Tap to reveal verse
                      </span>
                    </div>
                  )}
                </div>

                {/* English Sahih Translation */}
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-2">
                  {ayah.translation}
                </p>

                {/* Mutashabihat Twin Verse Details if present */}
                {ayah.mutashabihat && ayah.mutashabihat.length > 0 && (
                  <div className="mt-3 p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                    <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Twin Verse Alert (المتشابهات):</span>
                    </span>
                    {ayah.mutashabihat.map((m, idx) => (
                      <div key={idx} className="pl-2 border-l-2 border-amber-500/40">
                        <p className="font-bold text-stone-800 dark:text-stone-200">
                          {m.surahName} : {m.ayahNumber}
                        </p>
                        <p className="font-quran text-stone-700 dark:text-stone-300 text-sm mt-0.5" dir="rtl">
                          {m.text}
                        </p>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300/90 mt-0.5">
                          💡 {m.differenceNote}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Mini Player for Continuous Recitation */}
      {playingAyah !== null && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-3 flex justify-center pointer-events-none">
          <div className="max-w-md w-full bg-stone-900/95 text-white p-3 rounded-2xl shadow-2xl border border-stone-700 backdrop-blur-md flex items-center justify-between gap-2 pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-emerald-300 truncate">
                  Surah {SURAH_LIST.find((s) => s.number === (playingSurah || selectedSurah))?.englishName || activeSurahMeta.englishName}
                </p>
                <p className="text-[10px] text-stone-300">
                  Ayah {playingAyah} of {currentSurahData.numberOfAyahs || currentListRef.current.length}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handlePlayPrev}
                title="Previous Ayah"
                className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const s = playingSurah || selectedSurah;
                  if (s && playingAyah) {
                    playAyahAudio(s, playingAyah);
                  }
                }}
                title={isAudioPaused ? 'Resume' : 'Pause'}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-95 transition-all"
              >
                {isAudioPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={handlePlayNext}
                title="Next Ayah"
                className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const next = !autoAdvance;
                  setAutoAdvance(next);
                  setToastMessage(next ? '⏩ Auto-advance enabled' : '⏸ Auto-advance turned off');
                  setTimeout(() => setToastMessage(null), 2000);
                }}
                title={autoAdvance ? 'Auto-advance is ON' : 'Auto-advance is OFF'}
                className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                  autoAdvance
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}
              >
                <span>Auto</span>
                <span className="text-[9px]">{autoAdvance ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={stopAudio}
                title="Stop & close player"
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 ml-0.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
