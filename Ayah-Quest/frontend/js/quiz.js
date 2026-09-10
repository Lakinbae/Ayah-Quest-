/**
 * Ayah Quest - Supporting Quiz Feature
 * Reinforcing recall without replacing primary Hifz repetition
 */

import { api } from "./api.js";

export class QuizEngine {
  constructor() {
    this.currentQuestion = 0;
    this.score = 0;
    this.questions = [];
  }

  generateQuestions(ayahs) {
    if (!ayahs || ayahs.length < 2) return [];

    this.questions = ayahs.slice(0, 5).map((ayah, i) => {
      const words = ayah.text.split(" ");
      const maskedWord = words[Math.floor(words.length / 2)] || words[0];
      const maskedAyah = words.map(w => w === maskedWord ? "________" : w).join(" ");

      const options = [
        maskedWord,
        words[0] !== maskedWord ? words[0] : "الرَّحْمَٰنِ",
        "الْعَظِيمِ",
        "الْكَرِيمِ"
      ].sort(() => Math.random() - 0.5);

      return {
        prompt: "Identify the missing word from this verse:",
        verse: maskedAyah,
        correctAnswer: maskedWord,
        options,
        surahNumber: ayah.surahNumber,
        ayahNumber: ayah.number
      };
    });

    this.currentQuestion = 0;
    this.score = 0;
    return this.questions;
  }

  submitAnswer(selected) {
    const q = this.questions[this.currentQuestion];
    const isCorrect = q && q.correctAnswer === selected;
    if (isCorrect) this.score++;
    this.currentQuestion++;
    return {
      isCorrect,
      correctAnswer: q ? q.correctAnswer : "",
      isFinished: this.currentQuestion >= this.questions.length
    };
  }

  async saveResults() {
    const total = this.questions.length;
    const percentage = total > 0 ? Math.round((this.score / total) * 100) : 0;
    try {
      await api.request("/api/quiz-result", {
        method: "POST",
        body: JSON.stringify({
          quiz_type: "missing_words",
          total_questions: total,
          correct_answers: this.score,
          score_percentage: percentage
        })
      });
    } catch (e) {
      console.warn("Quiz result save offline:", e);
    }
  }
}

export const quizEngine = new QuizEngine();
