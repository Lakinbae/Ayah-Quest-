import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, Type } from 'lucide-react';
import { SURAHS_DATA, RECITERS } from '../data/quranData';

interface QuranViewProps {
  currentReciterId: string;
}

export const QuranView: React.FC<QuranViewProps> = ({ currentReciterId }) => {
  const [selectedSurah, setSelectedSurah] = useState<number>(67);
  const [fontSize, setFontSize] = useState<number>(28);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const surah = SURAHS_DATA[selectedSurah] || SURAHS_DATA[67];
  const reciter = RECITERS.find(r => r.id === currentReciterId) || RECITERS[0];

  const playAyahAudio = (ayahNumber: number) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    if (playingAyah === ayahNumber) {
      audio.pause();
      setPlayingAyah(null);
      return;
    }

    const s = String(selectedSurah).padStart(3, '0');
    const a = String(ayahNumber).padStart(3, '0');
    audio.src = `${reciter.cdnPath}/${s}${a}.mp3`;
    audio.play().then(() => {
      setPlayingAyah(ayahNumber);
    }).catch(e => console.warn('Audio play error:', e));

    audio.onended = () => {
      setPlayingAyah(null);
    };
  };

  return (
    <div className="space-y-4">
      {/* Surah Selector & Font Size Control */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Mushaf Reader
            </span>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              {surah.englishName} ({surah.name})
            </h2>
          </div>
          <select
            value={selectedSurah}
            onChange={(e) => {
              setSelectedSurah(Number(e.target.value));
              if (audioRef.current) audioRef.current.pause();
              setPlayingAyah(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200"
          >
            {Object.values(SURAHS_DATA).map(s => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.englishName} ({s.name})
              </option>
            ))}
          </select>
        </div>

        {/* Font Size Slider */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            <span>Font Size:</span>
          </div>
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
      </div>

      {/* Bismillah Banner */}
      {selectedSurah !== 9 && (
        <div className="text-center py-4 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-2xl border border-emerald-500/10">
          <p className="font-quran text-2xl text-emerald-900 dark:text-emerald-300" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Ayahs Stream */}
      <div className="space-y-3">
        {surah.ayahs.map((ayah) => {
          const isThisPlaying = playingAyah === ayah.number;
          return (
            <div
              key={ayah.number}
              className={`p-4 rounded-3xl border transition-all ${
                isThisPlaying
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/40 shadow-sm'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[11px]">
                  {selectedSurah}:{ayah.number}
                </span>
                <button
                  onClick={() => playAyahAudio(ayah.number)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isThisPlaying
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-500/10'
                  }`}
                >
                  {isThisPlaying ? (
                    <>
                      <Pause className="w-3 h-3 fill-white" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>Recite</span>
                    </>
                  )}
                </button>
              </div>

              {/* Arabic Verse */}
              <p
                className="font-quran text-stone-900 dark:text-stone-100 text-right leading-loose mb-3"
                style={{ fontSize: `${fontSize}px` }}
                dir="rtl"
              >
                {ayah.text}
              </p>

              {/* Translation */}
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {ayah.translation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
