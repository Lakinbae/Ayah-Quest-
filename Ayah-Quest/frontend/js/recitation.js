/**
 * Ayah Quest - Recitation Speech Recognition & Mistake Detection
 */

import { ArabicUtils } from "./utils.js";
import { api } from "./api.js";

export class RecitationPractice {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.transcript = "";
    this.onResult = null;
    this.onError = null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = "ar-SA"; // Arabic Saudi Arabia
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + " ";
        }
        this.transcript = currentTranscript.trim();
        if (this.onResult) this.onResult(this.transcript);
      };

      this.recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        if (this.onError) this.onError(err);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  isSupported() {
    return Boolean(this.recognition);
  }

  start() {
    if (!this.recognition) return false;
    this.transcript = "";
    this.recognition.start();
    this.isListening = true;
    return true;
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  async evaluateRecitation(expectedAyahText, surahNumber, ayahNumber) {
    this.stop();
    const comparison = ArabicUtils.compareWords(expectedAyahText, this.transcript);

    // Call backend for persistence and deep mistake logging
    try {
      await api.analyzeRecitation({
        expected_text: expectedAyahText,
        recited_text: this.transcript,
        surah_number: surahNumber,
        ayah_number: ayahNumber
      });
    } catch (e) {
      console.warn("Backend evaluation logging offline:", e);
    }

    return {
      transcript: this.transcript,
      ...comparison
    };
  }
}

export const recitationPractice = new RecitationPractice();
