/**
 * Ayah Quest - Hifz Repetition Engine & Session State
 */

import { audioPlayer } from "./audio.js";
import { api } from "./api.js";

export class HifzEngine {
  constructor() {
    this.currentSurah = 67;
    this.ayahs = [];
    this.currentIndex = 0;
    this.targetRepetitions = 3; // 1, 2, 3, 5, 10, Infinity
    this.currentRepetition = 1;
    this.isRepeating = false;
    this.autoNext = true;
    this.totalSessionReps = 0;
    this.startTime = Date.now();

    // Hide & Reveal states
    this.isAyahHidden = false;
    this.revealedWordsCount = 0;

    audioPlayer.onEnded = () => this.handleAudioEnded();
  }

  setRange(ayahList, targetReps = 3) {
    this.ayahs = ayahList;
    this.currentIndex = 0;
    this.targetRepetitions = targetReps;
    this.currentRepetition = 1;
    this.isAyahHidden = false;
    this.revealedWordsCount = 0;
    this.startTime = Date.now();
  }

  getCurrentAyah() {
    return this.ayahs[this.currentIndex] || null;
  }

  handleAudioEnded() {
    if (this.currentRepetition < this.targetRepetitions) {
      this.currentRepetition++;
      this.totalSessionReps++;
      audioPlayer.replay();
    } else {
      // Finished repetition cycle for current ayah
      this.totalSessionReps++;
      if (this.autoNext && this.currentIndex < this.ayahs.length - 1) {
        this.nextAyah();
        this.playCurrent();
      }
    }
  }

  playCurrent() {
    const ayah = this.getCurrentAyah();
    if (ayah) {
      audioPlayer.playAyah(ayah.surahNumber, ayah.number);
    }
  }

  nextAyah() {
    if (this.currentIndex < this.ayahs.length - 1) {
      this.currentIndex++;
      this.currentRepetition = 1;
      this.isAyahHidden = false;
      this.revealedWordsCount = 0;
      return true;
    }
    return false;
  }

  prevAyah() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentRepetition = 1;
      this.isAyahHidden = false;
      this.revealedWordsCount = 0;
      return true;
    }
    return false;
  }

  toggleHide() {
    this.isAyahHidden = !this.isAyahHidden;
  }

  revealNextWord() {
    this.revealedWordsCount++;
  }

  async markRecallResult(result) {
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    try {
      await api.logAyahReview({
        surah_number: ayah.surahNumber,
        ayah_number: ayah.number,
        result,
        repetitions: this.currentRepetition
      });
    } catch (e) {
      console.warn("Log recall offline:", e);
    }
  }
}

export const hifzEngine = new HifzEngine();
