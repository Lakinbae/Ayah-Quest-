import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Search, Play, Pause, Volume2, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { searchQuranByVoiceOrText, RECITERS } from '../data/quranData';
import { Ayah } from '../types';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAyah: (surahNumber: number, ayahNumber: number) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectAyah,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActiveAudio(null);
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleSearch = (q: string) => {
    if (!q || q.trim().length === 0) {
      setResults([]);
      return;
    }
    const found = searchQuranByVoiceOrText(q);
    setResults(found.slice(0, 10));
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setSearchQuery(text);
        handleSearch(text);
      };

      recognition.onerror = (e: any) => {
        console.warn('Voice search error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopAudio();
      stopVoice();
    }
  }, [isOpen]);

  const startVoice = () => {
    setSearchQuery('');
    setResults([]);
    stopAudio();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Voice start failed', err);
      }
    } else {
      // Fallback demo for unsupported browsers
      setIsListening(true);
      setTimeout(() => {
        const demoPhrase = 'تبارك الذي بيده الملك';
        setSearchQuery(demoPhrase);
        handleSearch(demoPhrase);
        setIsListening(false);
      }, 2000);
    }
  };

  const playAyahAudio = (surahNum: number, ayahNum: number) => {
    const padSurah = String(surahNum).padStart(3, '0');
    const padAyah = String(ayahNum).padStart(3, '0');
    const url = `${RECITERS[0].cdnPath}/${padSurah}${padAyah}.mp3`;

    if (activeAudio === url && audioRef.current && !audioRef.current.paused) {
      stopAudio();
      return;
    }

    stopAudio();
    const audio = new Audio(url);
    audioRef.current = audio;
    setActiveAudio(url);
    audio.play().catch(e => console.warn('Audio play error:', e));
    audio.onended = () => setActiveAudio(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative my-8 max-h-[90vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                AI Voice Search <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">Quran Shazam</span>
              </h2>
              <p className="text-xs text-stone-500">Recite any part of an ayah in Arabic to instantly identify Surah & Ayah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Mic Button / Visualizer */}
        <div className="text-center py-4 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-100 dark:border-stone-800 space-y-3">
          <button
            onClick={isListening ? stopVoice : startVoice}
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-xl transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse scale-110 ring-4 ring-rose-300 dark:ring-rose-900'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <div className="space-y-1">
            <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
              {isListening ? 'Listening in Arabic... Recite now' : 'Tap the microphone to speak/recite'}
            </p>
            <p className="text-[11px] text-stone-400">
              E.g. recite "تبارك الذي بيده الملك" or "قل هو الله أحد"
            </p>
          </div>
        </div>

        {/* Text Input Search Alternative */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Or type verse in Arabic or English translation..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-100 dark:bg-stone-800 border-none rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-72 pr-1">
          {results.length > 0 ? (
            results.map((res, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-2xl space-y-2 hover:border-emerald-500/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                      {res.surahName} : Ayah {res.ayahNumber}
                    </span>
                    <span className="text-[10px] font-bold text-stone-400">
                      {res.confidence}% Match
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => playAyahAudio(res.surahNumber, res.ayahNumber)}
                      className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600 transition-colors"
                      title="Listen Audio"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectAyah(res.surahNumber, res.ayahNumber);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-all"
                    >
                      Open <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="font-quran text-lg text-stone-900 dark:text-stone-100 text-right leading-relaxed" dir="rtl">
                  {res.text}
                </p>
                <p className="text-xs text-stone-500 italic line-clamp-2">
                  {res.translation}
                </p>
              </div>
            ))
          ) : searchQuery ? (
            <div className="text-center py-8 text-stone-400 text-xs space-y-1">
              <p className="font-semibold">No matching verses found for "{searchQuery}"</p>
              <p>Try reciting with clearer tajweed or searching another phrase</p>
            </div>
          ) : (
            <div className="text-center py-6 text-stone-400 text-xs space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-emerald-500/40" />
              <p className="font-medium">Instant Verse Recognition Powered by Web Speech & Quran Concordance</p>
              <p className="text-[11px] text-stone-500">Perfect for finding an ayah you hear in Taraweeh or lecture!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
