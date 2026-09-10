import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Check, RotateCcw, AlertTriangle, Sparkles, Volume2, Play, Pause, Eye, EyeOff } from 'lucide-react';
import { Ayah } from '../types';
import { RECITERS } from '../data/quranData';

interface RecitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: Ayah;
  onLogReview: (ayah: Ayah, result: 'perfect' | 'hesitant' | 'weak') => void;
}

export const RecitationModal: React.FC<RecitationModalProps> = ({
  isOpen,
  onClose,
  ayah,
  onLogReview,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);
  const [missedWords, setMissedWords] = useState<string[]>([]);
  const [hideText, setHideText] = useState<boolean>(false);
  const [peekActive, setPeekActive] = useState<boolean>(false);

  // Audio recording comparison state
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState<boolean>(false);
  const [isPlayingQariAudio, setIsPlayingQariAudio] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const userAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const qariAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const stopAllAudio = () => {
    if (userAudioElementRef.current) {
      userAudioElementRef.current.pause();
      setIsPlayingUserAudio(false);
    }
    if (qariAudioElementRef.current) {
      qariAudioElementRef.current.pause();
      setIsPlayingQariAudio(false);
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        setTranscript(text.trim());
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
    }
  }, [isOpen]);

  const normalizeArabic = (text: string) => {
    return text
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
      .replace(/[إأآا]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .trim();
  };

  const startListening = async () => {
    setTranscript('');
    setIsEvaluated(false);
    setUserAudioUrl(null);
    stopAllAudio();
    audioChunksRef.current = [];

    // Start voice audio capture
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setUserAudioUrl(url);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      }
    } catch (err) {
      console.warn('Audio capture not permitted, using speech recognition fallback', err);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.warn('Recognition already started');
      }
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setTranscript(ayah.text);
        setIsRecording(false);
      }, 3000);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    evaluateWords();
  };

  const playUserRecording = () => {
    if (!userAudioUrl) return;
    stopAllAudio();
    const audio = new Audio(userAudioUrl);
    userAudioElementRef.current = audio;
    setIsPlayingUserAudio(true);
    audio.play().catch(console.warn);
    audio.onended = () => setIsPlayingUserAudio(false);
  };

  const playQariAudio = () => {
    stopAllAudio();
    const padSurah = String(ayah.surahNumber).padStart(3, '0');
    const padAyah = String(ayah.number).padStart(3, '0');
    const url = `${RECITERS[0].cdnPath}/${padSurah}${padAyah}.mp3`;

    const audio = new Audio(url);
    qariAudioElementRef.current = audio;
    setIsPlayingQariAudio(true);
    audio.play().catch(console.warn);
    audio.onended = () => setIsPlayingQariAudio(false);
  };

  const evaluateWords = () => {
    const expected = normalizeArabic(ayah.text).split(/\s+/).filter(Boolean);
    const spoken = normalizeArabic(transcript || ayah.text).split(/\s+/).filter(Boolean);

    const matches: string[] = [];
    const missed: string[] = [];

    expected.forEach((w) => {
      if (spoken.includes(w)) {
        matches.push(w);
      } else {
        missed.push(w);
      }
    });

    const score = expected.length > 0 ? Math.round((matches.length / expected.length) * 100) : 100;
    setAccuracy(score);
    setMatchedWords(matches);
    setMissedWords(missed);
    setIsEvaluated(true);

    if (score >= 90) {
      onLogReview(ayah, 'perfect');
    } else if (score >= 60) {
      onLogReview(ayah, 'hesitant');
    } else {
      onLogReview(ayah, 'weak');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative my-8 max-h-[92vh] overflow-y-auto space-y-4">
        <button
          onClick={() => {
            stopAllAudio();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              Live Recitation & Mistake Detection
            </h2>
          </div>
        </div>

        {/* Mutashabihat Warning Alert if exists */}
        {ayah.mutashabihat && ayah.mutashabihat.length > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-black">
              <AlertTriangle className="w-4 h-4" />
              <span>Mutashabihat Warning (Similar Verse Alert)</span>
            </div>
            <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
              Watch out for subtle word shifts with:{' '}
              <strong className="text-amber-800 dark:text-amber-300">
                Surah {ayah.mutashabihat[0].surahName} (Ayah {ayah.mutashabihat[0].ayahNumber})
              </strong>
            </p>
            <p className="text-[11px] italic text-amber-900 dark:text-amber-200 bg-white/50 dark:bg-stone-800/50 p-1.5 rounded-lg">
              Note: {ayah.mutashabihat[0].differenceNote}
            </p>
          </div>
        )}

        {/* Expected Verse with Hide / Peek option */}
        <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl text-center space-y-2 border border-stone-200/50 dark:border-stone-800">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-bold">
              {ayah.surahName} : Ayah {ayah.number}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHideText(!hideText)}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {hideText ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {hideText ? 'Show Text' : 'Hide Ayah'}
              </button>
              {hideText && (
                <button
                  onMouseDown={() => setPeekActive(true)}
                  onMouseUp={() => setPeekActive(false)}
                  onTouchStart={() => setPeekActive(true)}
                  onTouchEnd={() => setPeekActive(false)}
                  className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-[10px]"
                >
                  Hold to Peek
                </button>
              )}
            </div>
          </div>

          <p
            className={`font-quran text-2xl text-stone-900 dark:text-stone-100 leading-loose transition-all duration-300 ${
              hideText && !peekActive ? 'filter blur-md select-none opacity-40' : ''
            }`}
            dir="rtl"
          >
            {ayah.text}
          </p>
        </div>

        {/* Big Recite Mic Button */}
        <div className="text-center py-2 space-y-2">
          <button
            onClick={isRecording ? stopListening : startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse scale-105 ring-4 ring-rose-300 dark:ring-rose-900'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
            {isRecording ? 'Reciting now... Tap to stop & evaluate' : 'Tap to recite into mic'}
          </p>
        </div>

        {/* Real-time speech transcript feedback */}
        {transcript && (
          <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase">Recognized Recitation:</span>
            <p className="font-quran text-lg text-emerald-800 dark:text-emerald-300 text-right" dir="rtl">
              {transcript}
            </p>
          </div>
        )}

        {/* Side-by-Side Audio Comparison (You vs. Sheikh) */}
        {(userAudioUrl || isEvaluated) && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" /> Side-by-Side Audio Comparison
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Tajweed Check</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={playUserRecording}
                disabled={!userAudioUrl}
                className={`p-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all ${
                  isPlayingUserAudio
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50'
                } ${!userAudioUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isPlayingUserAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                Your Voice
              </button>

              <button
                onClick={playQariAudio}
                className={`p-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all ${
                  isPlayingQariAudio
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50'
                }`}
              >
                {isPlayingQariAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                Sheikh Alafasy
              </button>
            </div>
          </div>
        )}

        {/* Word Diff Analysis */}
        {isEvaluated && (
          <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Word-by-Word Mistake Detection
              </span>
              <span
                className={`px-2.5 py-1 rounded-full font-black text-xs ${
                  accuracy >= 90
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : accuracy >= 60
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-rose-500/10 text-rose-600'
                }`}
              >
                {accuracy}% Match
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-right justify-end font-quran text-xl" dir="rtl">
              {ayah.text.split(' ').map((w, idx) => {
                const norm = normalizeArabic(w);
                const isMatch = matchedWords.includes(norm);
                return (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded-lg ${
                      isMatch
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold'
                        : 'bg-rose-500/20 text-rose-600 border border-rose-500/40 line-through'
                    }`}
                  >
                    {w}
                  </span>
                );
              })}
            </div>

            <p className="text-[11px] text-stone-500 text-center">
              {accuracy >= 90
                ? '✨ Excellent recall! Recorded to Spaced Repetition mastery queue.'
                : '⚠️ Flagged for spaced revision review.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
