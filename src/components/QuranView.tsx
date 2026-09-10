import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, Type, Eye, EyeOff, AlertTriangle, 
  Search, BookOpen, Layers, ChevronLeft, ChevronRight, Loader2, Bookmark 
} from 'lucide-react';
import { Surah, Ayah } from '../types';
import { RECITERS, SURAHS_DATA } from '../data/quranData';
import { SURAH_LIST } from '../data/surahList';
import { fetchSurah, fetchPage } from '../data/quranApi';

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
  const [hideMushaf, setHideMushaf] = useState<boolean>(false);
  const [revealedAyahs, setRevealedAyahs] = useState<Record<string, boolean>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reciter = RECITERS.find((r) => r.id === currentReciterId) || RECITERS[0];

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
  };

  const playAyahAudio = (surahNum: number, ayahNumber: number) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    if (playingAyah === ayahNumber) {
      audio.pause();
      setPlayingAyah(null);
      return;
    }

    const s = String(surahNum).padStart(3, '0');
    const a = String(ayahNumber).padStart(3, '0');
    audio.src = `${reciter.cdnPath}/${s}${a}.mp3`;
    audio
      .play()
      .then(() => {
        setPlayingAyah(ayahNumber);
      })
      .catch((e) => console.warn('Audio play error:', e));

    audio.onended = () => {
      setPlayingAyah(null);
    };
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
    <div className="space-y-4">
      {/* Navigation Mode Switcher: Surah vs Page */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex bg-stone-100 dark:bg-stone-850 p-1 rounded-2xl border border-stone-200 dark:border-stone-800">
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
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <select
                value={selectedSurah}
                onChange={(e) => {
                  stopAudio();
                  setSelectedSurah(Number(e.target.value));
                }}
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600 max-w-[160px]"
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
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 disabled:opacity-30 hover:bg-stone-100"
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
                className="w-14 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700"
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
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850 disabled:opacity-30 hover:bg-stone-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Font Size & Adaptive Hide Controls */}
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

      {/* Loading Indicator */}
      {isLoading && (
        <div className="py-12 text-center text-stone-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs font-semibold">Loading holy verses from Quran catalog...</span>
        </div>
      )}

      {/* Bismillah Banner (Except Surah 9 At-Tawbah) */}
      {!isLoading && viewMode === 'surah' && selectedSurah !== 9 && (
        <div className="text-center py-4 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/10 shadow-sm">
          <p className="font-quran text-2xl text-emerald-900 dark:text-emerald-300" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Page Header info when in page mode */}
      {!isLoading && viewMode === 'page' && pageSurahNames.length > 0 && (
        <div className="px-4 py-2 bg-stone-100 dark:bg-stone-850 rounded-2xl text-xs text-center text-stone-600 dark:text-stone-300 font-bold border border-stone-200 dark:border-stone-800">
          Page {currentPage} • Surah: {pageSurahNames.join(', ')}
        </div>
      )}

      {/* Ayahs Stream */}
      {!isLoading && (
        <div className="space-y-3">
          {(viewMode === 'surah' ? currentSurahData.ayahs : pageAyahs).map((ayah) => {
            const ayahKey = `${ayah.surahNumber || selectedSurah}_${ayah.number}`;
            const isThisPlaying = playingAyah === ayah.number;
            const isHidden = hideMushaf && !revealedAyahs[ayahKey];

            return (
              <div
                key={ayahKey}
                className={`p-4 rounded-3xl border transition-all ${
                  isThisPlaying
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/40 shadow-sm'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[11px]">
                      {ayah.surahNumber || selectedSurah}:{ayah.number}
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
                    <button
                      onClick={() => playAyahAudio(ayah.surahNumber || selectedSurah, ayah.number)}
                      className={`p-2 rounded-xl border transition-all ${
                        isThisPlaying
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-emerald-50'
                      }`}
                    >
                      {isThisPlaying ? (
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
                    <span className="inline-block text-xs font-serif text-emerald-600 dark:text-emerald-400 mx-1 border border-emerald-500/30 rounded-full w-6 h-6 leading-6 text-center">
                      ۝{ayah.number}
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
    </div>
  );
};
