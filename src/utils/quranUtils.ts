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

export interface AyahBookmark {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  text?: string;
  timestamp: string;
}

const BOOKMARK_KEY = 'ayah_quest_current_bookmark';

export function getAyahBookmark(): AyahBookmark | null {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAyahBookmark(bookmark: AyahBookmark): void {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmark));
  } catch (e) {
    console.warn('Failed to save bookmark:', e);
  }
}

export function removeAyahBookmark(): void {
  try {
    localStorage.removeItem(BOOKMARK_KEY);
  } catch {}
}

export async function copyAyahToClipboard(params: {
  text: string;
  translation?: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
}): Promise<boolean> {
  const shareText = `﷽\n\n« ${params.text} »\n\n"${params.translation || ''}"\n\n— Surah ${params.surahName} [${params.surahNumber}:${params.ayahNumber}]\n📖 Recite & Memorize on Ayah Quest`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch {
      // fallback below
    }
  }

  // Fallback for environments where writeText is restricted
  try {
    const textArea = document.createElement('textarea');
    textArea.value = shareText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch (e) {
    console.warn('Clipboard copy failed:', e);
    return false;
  }
}
