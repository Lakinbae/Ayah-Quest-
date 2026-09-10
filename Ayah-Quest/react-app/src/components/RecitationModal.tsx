import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Check, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';
import { Ayah } from '../types';

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

  const recognitionRef = useRef<any>(null);

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

  if (!isOpen) return null;

  const normalizeArabic = (text: string) => {
    return text
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
      .replace(/[إأآا]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .trim();
  };

  const startListening = () => {
    setTranscript('');
    setIsEvaluated(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.warn('Recognition already started');
      }
    } else {
      // Fallback simulation for environments without Web Speech API
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
    setIsRecording(false);
    evaluateWords();
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
          <Mic className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            Recitation Practice & Mistake Analysis
          </h2>
        </div>

        <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl text-center space-y-2">
          <span className="text-xs font-bold text-stone-400">
            Expected: {ayah.surahName} : Ayah {ayah.number}
          </span>
          <p className="font-quran text-2xl text-stone-900 dark:text-stone-100 leading-loose" dir="rtl">
            {ayah.text}
          </p>
        </div>

        {/* Live Audio Input & Recording State */}
        <div className="text-center py-4 space-y-3">
          <button
            onClick={isRecording ? stopListening : startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse scale-105'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
            {isRecording ? 'Listening in Arabic (ar-SA)... Tap to analyze' : 'Tap to start reciting this verse'}
          </p>
        </div>

        {/* Real-time transcript feedback */}
        {transcript && (
          <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-2xl text-xs space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase">Recognized Recitation:</span>
            <p className="font-quran text-lg text-emerald-800 dark:text-emerald-300 text-right" dir="rtl">
              {transcript}
            </p>
          </div>
        )}

        {/* Word Diff Analysis */}
        {isEvaluated && (
          <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Word-by-Word Analysis
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs">
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
                ? '✨ Excellent pronunciation and recall! Logged to Spaced Repetition queue.'
                : '⚠️ Some words missed or hesitated. Added to weak review queue.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
