import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Mic, MicOff, Check, RotateCcw, AlertTriangle, 
  Sparkles, Volume2, Play, Pause, Eye, EyeOff, CheckCircle2, XCircle
} from 'lucide-react';
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
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // strip tashkeel & tatweel
      .replace(/[إأآا]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^\u0621-\u064A\s]/g, '') // keep only arabic letters and spaces
      .trim();
  };

  const startListening = async () => {
    setTranscript('');
    setIsEvaluated(false);
    setUserAudioUrl(null);
    stopAllAudio();
    audioChunksRef.current = [];

    // Capture microphone audio
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
      console.warn('Microphone permission not granted:', err);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.warn('Recognition start error:', e);
        setIsRecording(true);
      }
    } else {
      setIsRecording(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
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

  // True word-by-word diff calculation
  const evaluateWords = () => {
    const rawExpectedWords = ayah.text.split(/\s+/).filter(Boolean);
    const normalizedExpected = rawExpectedWords.map(normalizeArabic);
    const spokenText = transcript.trim();

    if (!spokenText) {
      // User didn't speak or mic didn't capture Arabic words
      setAccuracy(0);
      setMatchedWords([]);
      setMissedWords(rawExpectedWords);
      setIsEvaluated(true);
      return;
    }

    const spokenWords = normalizeArabic(spokenText).split(/\s+/).filter(Boolean);

    const matches: string[] = [];
    const missed: string[] = [];

    rawExpectedWords.forEach((origWord, i) => {
      const normWord = normalizedExpected[i];
      // Check if spoken text contains this exact normalized word or a close match
      const found = spokenWords.some((spk) => spk === normWord || (spk.length > 3 && (spk.includes(normWord) || normWord.includes(spk))));
      if (found) {
        matches.push(origWord);
      } else {
        missed.push(origWord);
      }
    });

    const score = rawExpectedWords.length > 0 
      ? Math.round((matches.length / rawExpectedWords.length) * 100) 
      : 0;

    setAccuracy(score);
    setMatchedWords(matches);
    setMissedWords(missed);
    setIsEvaluated(true);

    if (score >= 85) {
      onLogReview(ayah, 'perfect');
    } else if (score >= 50) {
      onLogReview(ayah, 'hesitant');
    } else {
      onLogReview(ayah, 'weak');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#fcfaf7] dark:bg-stone-900 w-full max-w-lg rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative my-8 max-h-[92vh] overflow-y-auto space-y-4">
        <button
          onClick={() => {
            stopAllAudio();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              Recitation Practice & Feedback
            </h2>
          </div>
        </div>

        {/* Mutashabihat Warning Alert if exists */}
        {ayah.mutashabihat && ayah.mutashabihat.length > 0 && (
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Twin Verse Warning (تشابه آيات)</span>
            </div>
            <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
              Watch out for similar wording in <strong>{ayah.mutashabihat[0].surahName}</strong> (Ayah {ayah.mutashabihat[0].ayahNumber}):
              <br />
              <span className="font-semibold">{ayah.mutashabihat[0].differenceNote}</span>
            </p>
          </div>
        )}

        {/* High-Contrast Sacred Ayah Canvas */}
        <div className="p-5 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200/90 dark:border-stone-750 text-center shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
            <span className="font-bold">
              {ayah.surahName} : Ayah {ayah.number}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setHideText(!hideText)}
                className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-semibold border border-stone-200 dark:border-stone-700"
              >
                {hideText ? 'Show Text' : 'Blind Test'}
              </button>
              {hideText && (
                <button
                  onMouseDown={() => setPeekActive(true)}
                  onMouseUp={() => setPeekActive(false)}
                  onTouchStart={() => setPeekActive(true)}
                  onTouchEnd={() => setPeekActive(false)}
                  className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-[10px]"
                >
                  Hold to Peek
                </button>
              )}
            </div>
          </div>

          <p
            className={`font-quran text-2xl md:text-3xl text-emerald-950 dark:text-emerald-50 leading-loose transition-all duration-200 select-none ${
              hideText && !peekActive ? 'filter blur-md opacity-30' : ''
            }`}
            dir="rtl"
          >
            {ayah.text}
          </p>

          <p className="text-xs text-stone-600 dark:text-stone-400 italic">
            "{ayah.translation}"
          </p>
        </div>

        {/* Big Recite Mic Button */}
        <div className="text-center py-2 space-y-2">
          <button
            onClick={isRecording ? stopListening : startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg transition-all active:scale-95 ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse scale-105 ring-4 ring-rose-400/40'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
            {isRecording ? 'Listening to your recitation... Tap to finish' : 'Tap to start reciting into microphone'}
          </p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Recite in Arabic Tajweed or normal cadence.
          </p>
        </div>

        {/* Real-time speech transcript feedback */}
        {transcript && (
          <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs space-y-1">
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase">Heard Recitation:</span>
            <p className="font-quran text-base text-stone-900 dark:text-stone-100" dir="rtl">
              {transcript}
            </p>
          </div>
        )}

        {/* Word Diff Result & Audio Comparison */}
        {isEvaluated && (
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Accuracy Assessment</span>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  accuracy >= 85
                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                    : accuracy >= 50
                    ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30'
                }`}
              >
                {accuracy}% Match
              </span>
            </div>

            {accuracy === 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold">No clear Arabic recitation detected.</p>
                <p className="text-[11px]">
                  Please allow microphone access and recite the verse clearly in Arabic.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-1.5">
                  Word Analysis (Green = Recalled, Red = Missed or Stumbled):
                </p>
                <div className="flex flex-wrap gap-1.5" dir="rtl">
                  {ayah.text.split(/\s+/).map((word, idx) => {
                    const isMatched = matchedWords.includes(word);
                    return (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded-lg text-sm font-quran ${
                          isMatched
                            ? 'bg-emerald-600/15 text-emerald-900 dark:text-emerald-300 border border-emerald-600/25 font-bold'
                            : 'bg-rose-600/15 text-rose-900 dark:text-rose-300 border border-rose-600/25 line-through'
                        }`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Audio Playback Comparison: User Voice vs Qari Reference */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
              {userAudioUrl && (
                <button
                  onClick={playUserRecording}
                  className="flex-1 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-stone-200 transition-all"
                >
                  {isPlayingUserAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Hear Your Voice</span>
                </button>
              )}

              <button
                onClick={playQariAudio}
                className="flex-1 py-2 rounded-xl bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 border border-emerald-600/20 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-600/20 transition-all"
              >
                {isPlayingQariAudio ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>Hear Qari Recitation</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
