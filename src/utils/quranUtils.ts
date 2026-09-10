/**
 * Quran text and formatting utilities
 */

// Converts numbers to Arabic-Indic digits (e.g. 1 -> ١, 25 -> ٢٥)
export function toArabicDigits(num: number): string {
  const id = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => id[+w]);
}

/**
 * Strips leading Bismillah from an ayah text if it's verse 1 of any surah other than Al-Fatihah (Surah 1).
 * AlQuran Cloud API embeds 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' at the start of verse 1 for all surahs.
 */
export function cleanAyahText(text: string, surahNumber: number, ayahNumber: number): string {
  if (!text) return '';

  // In Surah 1 (Al-Fatihah), Bismillah is actually verse 1, so keep it!
  if (surahNumber === 1) {
    return text.trim();
  }

  // If this is verse 1 of any other surah, remove the prepended Bismillah so it doesn't repeat
  if (ayahNumber === 1) {
    // Standard Uthmani Bismillah forms
    const cleaned = text
      .replace(/^بِسْمِ\s+اللَّهِ\s+الرَّحْمَٰنِ\s+الرَّحِيمِ\s*/u, '')
      .replace(/^بِسْمِ\s+اللَّهِ\s+الرَّحْمَنِ\s+الرَّحِيمِ\s*/u, '')
      .replace(/^بِسمِ\s+اللَّهِ\s+الرَّحمَٰنِ\s+الرَّحِيمِ\s*/u, '')
      .replace(/^بِسْمِ\s+اللهِ\s+الرَّحْمٰنِ\s+الرَّحِيْمِ\s*/u, '');
    return cleaned.trim() || text.trim();
  }

  return text.trim();
}
