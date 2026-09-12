import { Ayah, Surah, SurahMetadata } from '../types';
import { SURAH_LIST } from '../data/surahList';
import { SURAHS_DATA } from '../data/quranData';
import { cleanAyahText } from './quranUtils';
import { DUEL_QUESTIONS_POOL } from '../data/duelData';

export type SoloQuizMode = 'fill_blank' | 'next_ayah' | 'identify_surah' | 'word_order';

export interface SoloQuestion {
  id: string;
  type: SoloQuizMode;
  prompt: string;
  surahReference: string;
  arabicSnippet?: string;
  translation?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  words?: string[]; // for word_order
  surahNumber?: number;
  ayahNumber?: number;
}

// Common Quranic distractor words to ensure realistic options if Surah is short
const COMMON_QURANIC_WORDS = [
  'الْعَلِيمُ', 'الْحَكِيمُ', 'الْغَفُورُ', 'الرَّحِيمُ', 'الْقَدِيرُ', 
  'الْكَرِيمُ', 'السَّمِيعُ', 'الْبَصِيرُ', 'الْخَبِيرُ', 'الْمُبِينُ',
  'الْمُؤْمِنُونَ', 'الْمُتَّقِينَ', 'الصَّالِحَاتِ', 'الْحَقُّ', 'الْهُدَىٰ',
  'النُّورُ', 'الْكِتَابُ', 'الْجَنَّةُ', 'النَّارُ', 'الْعَذَابُ'
];

/**
 * Shuffles an array immutably
 */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Extracts distinct words from a set of ayahs
 */
function extractDistinctWords(ayahs: Ayah[], minLen = 3): string[] {
  const wordSet = new Set<string>();
  ayahs.forEach((a) => {
    const tokens = cleanAyahText(a.text, a.surahNumber, a.number)
      .split(/\s+/)
      .map((w) => w.trim().replace(/[.,;،؟"«»()]/g, ''))
      .filter((w) => w.length >= minLen);
    tokens.forEach((w) => wordSet.add(w));
  });
  return Array.from(wordSet);
}

/**
 * Generates questions for a single specific Surah
 */
export function generateQuestionsForSurah(
  surah: Surah,
  mode: SoloQuizMode,
  count: number = 5
): SoloQuestion[] {
  const ayahs = surah.ayahs || [];
  if (ayahs.length === 0) return [];

  const meta: SurahMetadata = SURAH_LIST.find((s) => s.number === surah.number) || {
    number: surah.number,
    name: surah.name,
    englishName: surah.englishName,
    englishNameTranslation: '',
    numberOfAyahs: ayahs.length,
    revelationType: 'Meccan',
    startPage: 1,
  };

  const questions: SoloQuestion[] = [];
  const distinctSurahWords = extractDistinctWords(ayahs, 3);
  const shuffledAyahs = shuffle(ayahs);

  switch (mode) {
    case 'fill_blank': {
      for (const ayah of shuffledAyahs) {
        if (questions.length >= count) break;
        const cleaned = cleanAyahText(ayah.text, surah.number, ayah.number);
        const words = cleaned.split(/\s+/).filter((w) => w.length >= 2);
        if (words.length < 3) continue;

        // Find candidate words with length >= 3
        const candidateIndices: number[] = [];
        words.forEach((w, idx) => {
          if (w.length >= 3) candidateIndices.push(idx);
        });

        const targetIdx =
          candidateIndices.length > 0
            ? candidateIndices[Math.floor(Math.random() * candidateIndices.length)]
            : Math.floor(Math.random() * words.length);

        const targetWord = words[targetIdx];
        const maskedAyah = words.map((w, idx) => (idx === targetIdx ? '________' : w)).join(' ');

        // Gather 3 distractors
        const distractorPool = shuffle(
          distinctSurahWords.filter((w) => w !== targetWord)
        );
        const distractors: string[] = distractorPool.slice(0, 3);

        let fallbackIdx = 0;
        while (distractors.length < 3 && fallbackIdx < COMMON_QURANIC_WORDS.length) {
          const fallback = COMMON_QURANIC_WORDS[fallbackIdx++];
          if (fallback !== targetWord && !distractors.includes(fallback)) {
            distractors.push(fallback);
          }
        }

        const options = shuffle([targetWord, ...distractors.slice(0, 3)]);

        questions.push({
          id: `solo-fb-${surah.number}-${ayah.number}-${Date.now()}-${Math.random()}`,
          type: 'fill_blank',
          prompt: `Identify the missing word in this verse from Surah ${meta.englishName} (${surah.number}:${ayah.number}):`,
          surahReference: `Surah ${meta.englishName} (${surah.number}:${ayah.number})`,
          arabicSnippet: maskedAyah,
          translation: ayah.translation,
          correctAnswer: targetWord,
          options,
          explanation: `The missing word in ${meta.englishName} (${surah.number}:${ayah.number}) is «${targetWord}».`,
          surahNumber: surah.number,
          ayahNumber: ayah.number,
        });
      }
      break;
    }

    case 'next_ayah': {
      if (ayahs.length < 2) {
        // Fallback to fill_blank if surah only has 1 ayah
        return generateQuestionsForSurah(surah, 'fill_blank', count);
      }

      // We need verses from index 0 to ayahs.length - 2
      const validIndices: number[] = [];
      for (let i = 0; i < ayahs.length - 1; i++) {
        validIndices.push(i);
      }
      const chosenIndices = shuffle(validIndices).slice(0, count * 2);

      for (const idx of chosenIndices) {
        if (questions.length >= count) break;
        const currentAyah = ayahs[idx];
        const nextAyah = ayahs[idx + 1];

        const cleanedCurrent = cleanAyahText(currentAyah.text, surah.number, currentAyah.number);
        const cleanedNext = cleanAyahText(nextAyah.text, surah.number, nextAyah.number);

        // Distractors: other verses from this Surah or other wellknown verses
        const distractorAyahs = shuffle(
          ayahs.filter((_, aIdx) => aIdx !== idx + 1 && aIdx !== idx)
        )
          .slice(0, 3)
          .map((a) => cleanAyahText(a.text, surah.number, a.number));

        while (distractorAyahs.length < 3) {
          distractorAyahs.push('إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ');
        }

        const options = shuffle([cleanedNext, ...distractorAyahs.slice(0, 3)]);

        questions.push({
          id: `solo-na-${surah.number}-${currentAyah.number}-${Date.now()}-${Math.random()}`,
          type: 'next_ayah',
          prompt: `Which Ayah comes immediately NEXT in Surah ${meta.englishName} (${surah.number})?`,
          surahReference: `Surah ${meta.englishName} (${surah.number}:${currentAyah.number})`,
          arabicSnippet: `${cleanedCurrent} (${meta.name}: ${currentAyah.number})`,
          translation: currentAyah.translation,
          correctAnswer: cleanedNext,
          options,
          explanation: `Ayah ${nextAyah.number} immediately follows ayah ${currentAyah.number} in ${meta.englishName}: «${cleanedNext}»`,
          surahNumber: surah.number,
          ayahNumber: currentAyah.number,
        });
      }
      break;
    }

    case 'identify_surah': {
      for (const ayah of shuffledAyahs) {
        if (questions.length >= count) break;
        const cleaned = cleanAyahText(ayah.text, surah.number, ayah.number);
        const correctLabel = `${meta.englishName} (${surah.number})`;

        // 3 distractor Surahs from SURAH_LIST
        const otherSurahs = shuffle(SURAH_LIST.filter((s) => s.number !== surah.number)).slice(0, 3);
        const options = shuffle([
          correctLabel,
          ...otherSurahs.map((s) => `${s.englishName} (${s.number})`),
        ]);

        questions.push({
          id: `solo-is-${surah.number}-${ayah.number}-${Date.now()}-${Math.random()}`,
          type: 'identify_surah',
          prompt: `Which Surah contains this noble verse?`,
          surahReference: `Noble Quranic Verse`,
          arabicSnippet: cleaned,
          translation: ayah.translation,
          correctAnswer: correctLabel,
          options,
          explanation: `This is Ayah ${ayah.number} of Surah ${meta.englishName} (${meta.name}).`,
          surahNumber: surah.number,
          ayahNumber: ayah.number,
        });
      }
      break;
    }

    case 'word_order': {
      // Find ayahs with manageable length: 4 to 12 words
      const suitableAyahs = shuffledAyahs.filter((a) => {
        const words = cleanAyahText(a.text, surah.number, a.number).split(/\s+/);
        return words.length >= 3 && words.length <= 12;
      });

      const pool = suitableAyahs.length > 0 ? suitableAyahs : shuffledAyahs;

      for (const ayah of pool) {
        if (questions.length >= count) break;
        const cleaned = cleanAyahText(ayah.text, surah.number, ayah.number);
        const words = cleaned.split(/\s+/).map((w) => w.trim()).filter(Boolean);

        if (words.length < 2) continue;

        questions.push({
          id: `solo-wo-${surah.number}-${ayah.number}-${Date.now()}-${Math.random()}`,
          type: 'word_order',
          prompt: `Assemble the words in the exact sequence to complete this verse from Surah ${meta.englishName} (${surah.number}:${ayah.number}):`,
          surahReference: `Surah ${meta.englishName} (${surah.number}:${ayah.number})`,
          arabicSnippet: `Surah ${meta.englishName} (${surah.number}:${ayah.number})`,
          translation: ayah.translation,
          correctAnswer: cleaned,
          options: [],
          words,
          explanation: `Accurate order: «${cleaned}»`,
          surahNumber: surah.number,
          ayahNumber: ayah.number,
        });
      }
      break;
    }
  }

  return questions.slice(0, count);
}

/**
 * Generates questions across all 114 Surahs (Mixed Challenge)
 */
export function generateMixedQuranQuestions(
  mode: SoloQuizMode,
  count: number = 5,
  loadedSurahs: Record<number, Surah> = SURAHS_DATA
): SoloQuestion[] {
  // Check if we can pull from DUEL_QUESTIONS_POOL for curated richness
  if (mode === 'identify_surah') {
    const identifyQuestions: SoloQuestion[] = shuffle(
      DUEL_QUESTIONS_POOL.filter((q) => q.category === 'Identify Surah')
    ).map((q) => ({
      id: q.id,
      type: 'identify_surah',
      prompt: q.prompt,
      surahReference: q.surahReference || 'Quranic Verse',
      arabicSnippet: q.arabicSnippet,
      translation: q.translation,
      options: q.options,
      correctAnswer: q.options[q.correctIndex],
      explanation: q.explanation,
    }));

    if (identifyQuestions.length >= count) {
      return identifyQuestions.slice(0, count);
    }
  }

  // Combine questions from available preloaded Surahs
  const surahList = Object.values(loadedSurahs);
  const perSurahCount = Math.max(2, Math.ceil(count / Math.max(1, surahList.length)));
  const allGenerated: SoloQuestion[] = [];

  for (const s of surahList) {
    const qs = generateQuestionsForSurah(s, mode, perSurahCount);
    allGenerated.push(...qs);
  }

  // Also supplement with questions from DUEL_QUESTIONS_POOL if applicable
  if (mode === 'next_ayah') {
    const nextAyahFromPool: SoloQuestion[] = DUEL_QUESTIONS_POOL.filter(
      (q) => q.category === 'Next Ayah'
    ).map((q) => ({
      id: q.id,
      type: 'next_ayah',
      prompt: q.prompt,
      surahReference: q.surahReference || 'Noble Quran',
      arabicSnippet: q.arabicSnippet,
      translation: q.translation,
      options: q.options,
      correctAnswer: q.options[q.correctIndex],
      explanation: q.explanation,
    }));
    allGenerated.push(...nextAyahFromPool);
  } else if (mode === 'fill_blank') {
    const missingWordFromPool: SoloQuestion[] = DUEL_QUESTIONS_POOL.filter(
      (q) => q.category === 'Missing Word'
    ).map((q) => ({
      id: q.id,
      type: 'fill_blank',
      prompt: q.prompt,
      surahReference: q.surahReference || 'Noble Quran',
      arabicSnippet: q.arabicSnippet.replace(/\[\.\.\.\]/g, '________'),
      translation: q.translation,
      options: q.options,
      correctAnswer: q.options[q.correctIndex],
      explanation: q.explanation,
    }));
    allGenerated.push(...missingWordFromPool);
  }

  return shuffle(allGenerated).slice(0, count);
}
