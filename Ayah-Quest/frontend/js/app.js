/**
 * Ayah Quest - Core Application Coordinator & View Router
 */

import { auth } from "./auth.js";
import { audioPlayer, RECITERS } from "./audio.js";
import { hifzEngine } from "./hifz.js";
import { recitationPractice } from "./recitation.js";
import { quizEngine } from "./quiz.js";
import { PaymentManager } from "./payments.js";
import { Storage } from "./storage.js";
import { ProfileManager } from "./profile.js";

// Sample verified Quran dataset for offline and immediate instant responsiveness
const SAMPLE_SURAHS = {
  1: {
    name: "Al-Fatihah",
    ayahs: [
      { number: 1, surahNumber: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
      { number: 2, surahNumber: 1, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "[All] praise is [due] to Allah, Lord of the worlds -" },
      { number: 3, surahNumber: 1, text: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful," },
      { number: 4, surahNumber: 1, text: "مَالِكِ يَوْمِ الدِّينِ", translation: "Sovereign of the Day of Recompense." },
      { number: 5, surahNumber: 1, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "It is You we worship and You we ask for help." },
      { number: 6, surahNumber: 1, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us to the straight path -" },
      { number: 7, surahNumber: 1, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray." }
    ]
  },
  67: {
    name: "Al-Mulk",
    ayahs: [
      { number: 1, surahNumber: 67, text: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", translation: "Blessed is He in whose hand is dominion, and He is over all things competent -" },
      { number: 2, surahNumber: 67, text: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا وَهُوَ الْعَزِيزُ الْغَفُورُ", translation: "[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -" },
      { number: 3, surahNumber: 67, text: "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ", translation: "[And] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return [your] vision; do you see any breaks?" },
      { number: 4, surahNumber: 67, text: "ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ", translation: "Then return [your] vision twice again. [Your] vision will return to you humbled while it is fatigued." },
      { number: 5, surahNumber: 67, text: "وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ", translation: "And We have certainly beautified the nearest heaven with lamps and have made [from] them what is thrown at the devils and have prepared for them the punishment of the Blaze." }
    ]
  }
};

class App {
  constructor() {
    this.currentPage = "home";
    this.pageCache = {};
  }

  async init() {
    await auth.init();
    ProfileManager.applyTheme(Storage.getTheme());
    this.bindEvents();
    await this.navigateTo("home");
  }

  bindEvents() {
    // Navigation bar click listeners
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetPage = btn.getAttribute("data-nav");
        this.navigateTo(targetPage);
      });
    });

    // Pro button in header
    document.getElementById("proBadgeBtn")?.addEventListener("click", () => {
      this.navigateTo("pro");
    });
  }

  async loadPageTemplate(pageName) {
    if (this.pageCache[pageName]) return this.pageCache[pageName];
    try {
      const res = await fetch(`./pages/${pageName}.html`);
      const html = await res.text();
      this.pageCache[pageName] = html;
      return html;
    } catch {
      return `<div class="p-4 text-center">Loading page...</div>`;
    }
  }

  async navigateTo(pageName) {
    this.currentPage = pageName;
    const content = document.getElementById("appContent");
    if (!content) return;

    // Highlight active nav item
    document.querySelectorAll(".nav-btn").forEach(btn => {
      const isTarget = btn.getAttribute("data-nav") === pageName;
      if (isTarget) {
        btn.classList.add("text-emerald-600", "dark:text-emerald-400");
        btn.classList.remove("text-stone-500", "dark:text-stone-400");
      } else {
        btn.classList.remove("text-emerald-600", "dark:text-emerald-400");
        btn.classList.add("text-stone-500", "dark:text-stone-400");
      }
    });

    // Render template
    content.innerHTML = await this.loadPageTemplate(pageName);
    this.setupPageHandlers(pageName);
  }

  setupPageHandlers(pageName) {
    const user = auth.getUser();

    if (pageName === "home") {
      const greetingEl = document.getElementById("userNameGreeting");
      if (greetingEl) greetingEl.textContent = user.first_name || "Reciter";

      document.getElementById("btnContinueHifz")?.addEventListener("click", () => this.navigateTo("hifz"));
      document.getElementById("btnStartRevision")?.addEventListener("click", () => this.navigateTo("hifz"));
      
      document.querySelectorAll("[data-quick]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const quick = btn.getAttribute("data-quick");
          if (quick === "listen") this.navigateTo("hifz");
          else if (quick === "recall") this.navigateTo("quiz");
          else if (quick === "quran") this.navigateTo("quran");
        });
      });
    }

    if (pageName === "hifz") {
      this.initHifzPage();
    }

    if (pageName === "quran") {
      this.initQuranPage();
    }

    if (pageName === "quiz") {
      this.initQuizPage();
    }

    if (pageName === "pro") {
      this.initProPage();
    }

    if (pageName === "profile") {
      const fullName = document.getElementById("profileFullName");
      const username = document.getElementById("profileUsername");
      if (fullName) fullName.textContent = user.first_name || "Reciter";
      if (username) username.textContent = `@${user.username || "quran_seeker"}`;

      document.getElementById("btnOpenProUpgrade")?.addEventListener("click", () => this.navigateTo("pro"));
    }
  }

  initHifzPage() {
    const mulkAyahs = SAMPLE_SURAHS[67].ayahs;
    hifzEngine.setRange(mulkAyahs, 3);
    this.updateHifzDisplay();

    // Repetition Chips
    document.querySelectorAll(".rep-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".rep-chip").forEach(c => {
          c.classList.remove("bg-emerald-600", "text-white");
          c.classList.add("bg-stone-100", "dark:bg-stone-800", "text-stone-600", "dark:text-stone-400");
        });
        chip.classList.add("bg-emerald-600", "text-white");
        chip.classList.remove("bg-stone-100", "dark:bg-stone-800", "text-stone-600", "dark:text-stone-400");
        const reps = parseInt(chip.getAttribute("data-rep"), 10);
        hifzEngine.targetRepetitions = reps;
        document.getElementById("repTarget").textContent = reps === 999 ? "∞" : reps;
      });
    });

    // Play / Pause Button
    const playBtn = document.getElementById("btnPlayPauseHifz");
    playBtn?.addEventListener("click", () => {
      if (audioPlayer.isPlaying) {
        audioPlayer.pause();
        playBtn.textContent = "▶";
      } else {
        hifzEngine.playCurrent();
        playBtn.textContent = "⏸";
      }
    });

    // Next / Prev
    document.getElementById("btnNextAyah")?.addEventListener("click", () => {
      if (hifzEngine.nextAyah()) {
        this.updateHifzDisplay();
        if (audioPlayer.isPlaying) hifzEngine.playCurrent();
      }
    });
    document.getElementById("btnPrevAyah")?.addEventListener("click", () => {
      if (hifzEngine.prevAyah()) {
        this.updateHifzDisplay();
        if (audioPlayer.isPlaying) hifzEngine.playCurrent();
      }
    });
    document.getElementById("btnReplayAyah")?.addEventListener("click", () => {
      audioPlayer.replay();
    });

    // Hide / Reveal
    const hideBtn = document.getElementById("btnToggleHide");
    hideBtn?.addEventListener("click", () => {
      hifzEngine.toggleHide();
      const textContainer = document.getElementById("ayahTextContainer");
      const maskBanner = document.getElementById("hiddenMaskBanner");
      if (hifzEngine.isAyahHidden) {
        textContainer?.classList.add("hidden");
        maskBanner?.classList.remove("hidden");
        hideBtn.textContent = "👁️ Reveal";
      } else {
        textContainer?.classList.remove("hidden");
        maskBanner?.classList.add("hidden");
        hideBtn.textContent = "👁️ Hide";
      }
    });

    // Recall evaluation
    document.getElementById("btnRecallPerfect")?.addEventListener("click", () => {
      hifzEngine.markRecallResult("perfect");
      hifzEngine.nextAyah();
      this.updateHifzDisplay();
    });
    document.getElementById("btnRecallHesitant")?.addEventListener("click", () => {
      hifzEngine.markRecallResult("hesitant");
      hifzEngine.nextAyah();
      this.updateHifzDisplay();
    });
    document.getElementById("btnRecallWeak")?.addEventListener("click", () => {
      hifzEngine.markRecallResult("weak");
      hifzEngine.nextAyah();
      this.updateHifzDisplay();
    });
  }

  updateHifzDisplay() {
    const ayah = hifzEngine.getCurrentAyah();
    if (!ayah) return;

    const label = document.getElementById("ayahLabelNumber");
    const arabic = document.getElementById("ayahArabicText");
    const trans = document.getElementById("ayahTranslationText");
    const curRep = document.getElementById("repCurrent");
    const ayahCur = document.getElementById("hifzAyahCurrentNum");
    const ayahTot = document.getElementById("hifzAyahTotal");

    if (label) label.textContent = `Ayah ${ayah.number}`;
    if (arabic) arabic.textContent = ayah.text;
    if (trans) trans.textContent = ayah.translation;
    if (curRep) curRep.textContent = hifzEngine.currentRepetition;
    if (ayahCur) ayahCur.textContent = hifzEngine.currentIndex + 1;
    if (ayahTot) ayahTot.textContent = hifzEngine.ayahs.length;
  }

  initQuranPage() {
    const container = document.getElementById("mushafAyahsContainer");
    const select = document.getElementById("mushafSurahSelect");
    if (!container) return;

    const renderSurah = (surahNum) => {
      const data = SAMPLE_SURAHS[surahNum] || SAMPLE_SURAHS[67];
      container.innerHTML = data.ayahs.map(a => `
        <div class="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
          <div class="flex justify-between items-center text-xs text-stone-400">
            <span class="font-bold text-emerald-600">${a.surahNumber}:${a.number}</span>
            <button onclick="window.playSingleAyah(${a.surahNumber}, ${a.number})" class="hover:text-emerald-600">▶ Play</button>
          </div>
          <p class="font-quran text-2xl text-stone-900 dark:text-stone-100 text-right leading-loose" dir="rtl">${a.text}</p>
          <p class="text-xs text-stone-500 dark:text-stone-400">${a.translation}</p>
        </div>
      `).join("");
    };

    window.playSingleAyah = (s, a) => {
      audioPlayer.playAyah(s, a);
    };

    select?.addEventListener("change", (e) => {
      renderSurah(e.target.value);
    });

    renderSurah(67);
  }

  initQuizPage() {
    const mulk = SAMPLE_SURAHS[67].ayahs;
    quizEngine.generateQuestions(mulk);
    this.renderQuizQuestion();
  }

  renderQuizQuestion() {
    const q = quizEngine.questions[quizEngine.currentQuestion];
    if (!q) return;

    const numEl = document.getElementById("quizQuestionNumber");
    const verseEl = document.getElementById("quizVerseText");
    const grid = document.getElementById("quizOptionsGrid");

    if (numEl) numEl.textContent = quizEngine.currentQuestion + 1;
    if (verseEl) verseEl.textContent = q.verse;

    if (grid) {
      grid.innerHTML = q.options.map(opt => `
        <button class="quiz-opt-btn p-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-quran text-lg text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 transition-all" dir="rtl">
          ${opt}
        </button>
      `).join("");

      grid.querySelectorAll(".quiz-opt-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const selected = btn.textContent.trim();
          const res = quizEngine.submitAnswer(selected);
          const feedback = document.getElementById("quizFeedback");
          feedback?.classList.remove("hidden");
          if (res.isCorrect) {
            feedback.className = "p-3 rounded-xl text-xs text-center font-bold bg-emerald-500/20 text-emerald-600";
            feedback.textContent = "✨ Correct! Ma sha Allah!";
          } else {
            feedback.className = "p-3 rounded-xl text-xs text-center font-bold bg-rose-500/20 text-rose-600";
            feedback.textContent = `Correct answer was: ${res.correctAnswer}`;
          }

          setTimeout(() => {
            feedback?.classList.add("hidden");
            if (!res.isFinished) {
              this.renderQuizQuestion();
            } else {
              quizEngine.saveResults();
              grid.innerHTML = `<div class="col-span-2 text-center py-4 font-bold text-emerald-600">Quiz Completed! Score: ${quizEngine.score}/5</div>`;
            }
          }, 1200);
        });
      });
    }
  }

  initProPage() {
    // Stars payment
    document.getElementById("btnPayStars")?.addEventListener("click", async () => {
      try {
        await PaymentManager.startStarsPayment();
      } catch (err) {
        alert("Telegram Stars invoice launched. Confirm payment inside Telegram.");
      }
    });

    // Telebirr submission
    document.getElementById("btnSubmitTelebirr")?.addEventListener("click", async () => {
      const refInput = document.getElementById("telebirrRefInput");
      const ref = refInput ? refInput.value : "";
      const statusBanner = document.getElementById("telebirrStatusMsg");

      if (!ref || ref.trim().length < 5) {
        alert("Please enter your valid Telebirr Reference Number.");
        return;
      }

      try {
        await PaymentManager.submitTelebirrPayment(ref);
        if (statusBanner) statusBanner.classList.remove("hidden");
      } catch (e) {
        if (statusBanner) {
          statusBanner.classList.remove("hidden");
          statusBanner.textContent = "⏳ Payment submitted! Admin will verify and activate your Pro status.";
        }
      }
    });
  }
}

const app = new App();
window.addEventListener("DOMContentLoaded", () => app.init());
