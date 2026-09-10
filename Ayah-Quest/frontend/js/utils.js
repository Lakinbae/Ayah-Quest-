/**
 * Ayah Quest - Utility Helpers
 * Arabic text normalization, formatting, and DOM helpers.
 */

export const ArabicUtils = {
  // Normalize Arabic string for speech recognition comparison
  normalize(text) {
    if (!text) return "";
    return text
      .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // remove tashkeel and tatweel
      .replace(/[إأآا]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[^\u0600-\u06FF\s]/g, "") // remove non-arabic punctuation
      .trim();
  },

  // Tokenize text into words
  words(text) {
    return this.normalize(text).split(/\s+/).filter(Boolean);
  },

  // Compare recited words against expected words
  compareWords(expectedText, recitedText) {
    const expected = this.words(expectedText);
    const recited = this.words(recitedText);

    const matches = [];
    const missed = [];
    const extra = [];

    expected.forEach((word, idx) => {
      if (recited.includes(word)) {
        matches.push({ word, index: idx });
      } else {
        missed.push({ word, index: idx });
      }
    });

    recited.forEach((word, idx) => {
      if (!expected.includes(word)) {
        extra.push({ word, index: idx });
      }
    });

    const accuracy = expected.length > 0 
      ? Math.round((matches.length / expected.length) * 100) 
      : 100;

    return {
      accuracy,
      totalExpected: expected.length,
      matches,
      missed,
      extra
    };
  },

  // Format Ayah number with decorative eastern Arabic numbers or parenthesis
  formatAyahNum(num) {
    const arabicDigits = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
    return String(num).split("").map(d => arabicDigits[d] || d).join("");
  }
};

export const Formatters = {
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  formatDate(dateStr) {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
};
