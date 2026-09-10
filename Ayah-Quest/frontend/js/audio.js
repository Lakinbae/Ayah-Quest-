/**
 * Ayah Quest - Quran Audio Player & Reciter Engine
 */

export const RECITERS = [
  {
    id: "ar.alafasy",
    name: "Mishary Rashid Alafasy",
    subtext: "Clear, emotional Murattal",
    cdnPath: "https://everyayah.com/data/Alafasy_128kbps"
  },
  {
    id: "ar.husary",
    name: "Mahmoud Khalil Al-Husary",
    subtext: "Master of Tajweed precision",
    cdnPath: "https://everyayah.com/data/Husary_128kbps"
  },
  {
    id: "ar.minshawi",
    name: "Mohamed Siddiq Al-Minshawi",
    subtext: "Deep, soulful Murattal",
    cdnPath: "https://everyayah.com/data/Minshawi_Murattal_128kbps"
  },
  {
    id: "ar.abdulbasit",
    name: "Abdul Basit Abdul Samad",
    subtext: "Classic revered Murattal",
    cdnPath: "https://everyayah.com/data/Abdul_Basit_Murattal_192kbps"
  }
];

export class QuranAudioPlayer {
  constructor() {
    this.audio = new Audio();
    this.currentReciter = RECITERS[0];
    this.isPlaying = false;
    this.playbackSpeed = 1.0;
    this.onProgress = null;
    this.onEnded = null;

    this.audio.addEventListener("timeupdate", () => {
      if (this.onProgress && this.audio.duration) {
        this.onProgress(this.audio.currentTime, this.audio.duration);
      }
    });

    this.audio.addEventListener("ended", () => {
      this.isPlaying = false;
      if (this.onEnded) this.onEnded();
    });

    this.audio.addEventListener("play", () => { this.isPlaying = true; });
    this.audio.addEventListener("pause", () => { this.isPlaying = false; });
  }

  setReciter(reciterId) {
    const found = RECITERS.find(r => r.id === reciterId);
    if (found) this.currentReciter = found;
  }

  setSpeed(speed) {
    this.playbackSpeed = speed;
    this.audio.playbackRate = speed;
  }

  getAudioUrl(surahNumber, ayahNumber) {
    const s = String(surahNumber).padStart(3, "0");
    const a = String(ayahNumber).padStart(3, "0");
    return `${this.currentReciter.cdnPath}/${s}${a}.mp3`;
  }

  async playAyah(surahNumber, ayahNumber) {
    const url = this.getAudioUrl(surahNumber, ayahNumber);
    if (this.audio.src !== url) {
      this.audio.src = url;
      this.audio.playbackRate = this.playbackSpeed;
    }
    try {
      await this.audio.play();
      this.isPlaying = true;
    } catch (e) {
      console.warn("Audio playback interrupted", e);
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
  }

  replay() {
    this.audio.currentTime = 0;
    this.audio.play().catch(() => {});
    this.isPlaying = true;
  }
}

export const audioPlayer = new QuranAudioPlayer();
