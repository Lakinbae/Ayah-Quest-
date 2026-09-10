import { Ayah, Surah } from '../types';
import { SURAHS_DATA } from './quranData';
import { SURAH_LIST } from './surahList';
import { cleanAyahText } from '../utils/quranUtils';

// In-memory caches
const surahCache: Record<number, Surah> = { ...SURAHS_DATA };
const pageCache: Record<number, { pageNumber: number; ayahs: Ayah[]; surahsOnPage: string[] }> = {};

/**
 * Loads a Surah either from memory, localStorage cache, or fetches from AlQuran Cloud API
 */
export async function fetchSurah(surahNumber: number): Promise<Surah> {
  // 1. Check in-memory cache
  if (surahCache[surahNumber] && surahCache[surahNumber].ayahs?.length > 0) {
    return surahCache[surahNumber];
  }

  // 2. Check localStorage cache
  const cacheKey = `ayah_quest_surah_v2_${surahNumber}`;
  try {
    const saved = localStorage.getItem(cacheKey);
    if (saved) {
      const parsed: Surah = JSON.parse(saved);
      if (parsed && parsed.ayahs && parsed.ayahs.length > 0) {
        surahCache[surahNumber] = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }

  const meta = SURAH_LIST.find((s) => s.number === surahNumber) || {
    number: surahNumber,
    name: `سورة ${surahNumber}`,
    englishName: `Surah ${surahNumber}`,
    englishNameTranslation: '',
    numberOfAyahs: 10,
    revelationType: 'Meccan',
    startPage: 1,
  };

  // 3. Fetch from AlQuran Cloud API (Uthmani Arabic + English Sahih Translation)
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`,
      { cache: 'force-cache' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
      const arData = json.data[0];
      const enData = json.data[1];

      const ayahs: Ayah[] = arData.ayahs.map((a: any, idx: number) => {
        const enAyah = enData.ayahs[idx] || {};
        return {
          number: a.numberInSurah,
          surahNumber: surahNumber,
          surahName: meta.englishName,
          text: cleanAyahText(a.text, surahNumber, a.numberInSurah),
          translation: enAyah.text || '',
        };
      });

      const loadedSurah: Surah = {
        number: surahNumber,
        name: meta.name || arData.name,
        englishName: meta.englishName || arData.englishName,
        numberOfAyahs: ayahs.length,
        ayahs,
      };

      surahCache[surahNumber] = loadedSurah;
      try {
        localStorage.setItem(cacheKey, JSON.stringify(loadedSurah));
      } catch (e) {
        // LocalStorage may be full, ignore
      }

      return loadedSurah;
    }
  } catch (err) {
    console.warn(`Could not fetch Surah ${surahNumber} live:`, err);
  }

  // 4. Offline fallback if not available
  if (SURAHS_DATA[surahNumber]) {
    return SURAHS_DATA[surahNumber];
  }

  // Return generated fallback structure
  const fallbackAyahs: Ayah[] = Array.from({ length: Math.min(meta.numberOfAyahs, 20) }, (_, i) => ({
    number: i + 1,
    surahNumber,
    surahName: meta.englishName,
    text: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ... (آية ${i + 1})`,
    translation: `Ayah ${i + 1} of ${meta.englishName} (Connect to internet to download full text).`,
  }));

  const fallbackSurah: Surah = {
    number: surahNumber,
    name: meta.name,
    englishName: meta.englishName,
    numberOfAyahs: meta.numberOfAyahs,
    ayahs: fallbackAyahs,
  };

  surahCache[surahNumber] = fallbackSurah;
  return fallbackSurah;
}

/**
 * Loads a Quran Page (1 to 604) from AlQuran Cloud
 */
export async function fetchPage(pageNumber: number): Promise<{ pageNumber: number; ayahs: Ayah[]; surahsOnPage: string[] }> {
  const safePage = Math.max(1, Math.min(604, pageNumber));

  if (pageCache[safePage]) {
    return pageCache[safePage];
  }

  const cacheKey = `ayah_quest_page_v2_${safePage}`;
  try {
    const saved = localStorage.getItem(cacheKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.ayahs && parsed.ayahs.length > 0) {
        pageCache[safePage] = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/page/${safePage}/editions/quran-uthmani,en.sahih`,
      { cache: 'force-cache' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
      const arData = json.data[0];
      const enData = json.data[1];

      const surahNamesSet = new Set<string>();
      const ayahs: Ayah[] = arData.ayahs.map((a: any, idx: number) => {
        const enAyah = enData.ayahs[idx] || {};
        const sNum = a.surah.number;
        const sMeta = SURAH_LIST.find((s) => s.number === sNum);
        const sName = sMeta ? sMeta.englishName : a.surah.englishName;
        surahNamesSet.add(`${sName} (${sNum})`);

        return {
          number: a.numberInSurah,
          surahNumber: sNum,
          surahName: sName,
          text: cleanAyahText(a.text, sNum, a.numberInSurah),
          translation: enAyah.text || '',
        };
      });

      const pageResult = {
        pageNumber: safePage,
        ayahs,
        surahsOnPage: Array.from(surahNamesSet),
      };

      pageCache[safePage] = pageResult;
      try {
        localStorage.setItem(cacheKey, JSON.stringify(pageResult));
      } catch (e) {}

      return pageResult;
    }
  } catch (err) {
    console.warn(`Could not fetch Page ${safePage}:`, err);
  }

  // Fallback for page 1
  return {
    pageNumber: safePage,
    ayahs: SURAHS_DATA[1].ayahs,
    surahsOnPage: ['Al-Fatihah (1)'],
  };
}
