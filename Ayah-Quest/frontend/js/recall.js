/**
 * Ayah Quest - Active Recall Engine (7 Modes)
 */

export const RECALL_MODES = [
  { id: "first_words", name: "First Words", description: "Read the opening words and recite the rest from memory." },
  { id: "hidden_ayah", name: "Hidden Ayah", description: "The full verse is masked. Recall completely before checking." },
  { id: "missing_words", name: "Missing Words", description: "Key words are obscured. Fill the gaps mentally or aloud." },
  { id: "continue_ayah", name: "Continue Verse", description: "Recognize the start and recite the connected conclusion." },
  { id: "word_reveal", name: "Word by Word", description: "Tap to unmask one word at a time as you recite." },
  { id: "random_order", name: "Random Recall", description: "Jumps between ayahs in random order to prevent mechanical sequencing." },
  { id: "reverse_order", name: "Reverse Recall", description: "Tests the passage in reverse order to lock anchor verses." }
];

export class RecallEngine {
  constructor(ayahs = []) {
    this.ayahs = [...ayahs];
    this.mode = "first_words";
    this.currentIndex = 0;
    this.revealedWords = 0;
    this.stats = { correct: 0, hesitant: 0, missed: 0 };
  }

  setMode(modeId, ayahs) {
    this.mode = modeId;
    this.ayahs = [...ayahs];
    this.currentIndex = 0;
    this.revealedWords = 0;

    if (modeId === "random_order") {
      this.ayahs.sort(() => Math.random() - 0.5);
    } else if (modeId === "reverse_order") {
      this.ayahs.reverse();
    }
  }

  getCurrentAyah() {
    return this.ayahs[this.currentIndex] || null;
  }

  getMaskedWords() {
    const ayah = this.getCurrentAyah();
    if (!ayah) return [];
    const words = ayah.text.split(" ");

    switch (this.mode) {
      case "first_words":
        // Show first 2 words, mask the rest
        return words.map((w, idx) => ({
          word: w,
          hidden: idx >= 2
        }));

      case "hidden_ayah":
        // Mask all
        return words.map(w => ({ word: w, hidden: true }));

      case "missing_words":
        // Mask every 2nd or 3rd word
        return words.map((w, idx) => ({
          word: w,
          hidden: idx % 3 === 1
        }));

      case "continue_ayah":
        // Mask the second half
        const midpoint = Math.floor(words.length / 2);
        return words.map((w, idx) => ({
          word: w,
          hidden: idx >= midpoint
        }));

      case "word_reveal":
        // Mask all except up to revealedWords
        return words.map((w, idx) => ({
          word: w,
          hidden: idx >= this.revealedWords
        }));

      default:
        return words.map(w => ({ word: w, hidden: false }));
    }
  }

  revealNextWord() {
    this.revealedWords++;
  }

  submitRecall(result) { // 'perfect', 'hesitant', 'missed'
    if (result === "perfect") this.stats.correct++;
    else if (result === "hesitant") this.stats.hesitant++;
    else this.stats.missed++;

    if (this.currentIndex < this.ayahs.length - 1) {
      this.currentIndex++;
      this.revealedWords = 0;
      return true;
    }
    return false; // Completed range
  }
}
