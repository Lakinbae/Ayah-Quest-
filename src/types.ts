export interface MutashabihVerse {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  differenceNote: string;
}

export interface Ayah {
  number: number;
  surahNumber: number;
  surahName: string;
  text: string;
  translation: string;
  mutashabihat?: MutashabihVerse[];
}

export interface VoiceSearchResult {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  translation: string;
  confidence: number;
}

export interface HifzPlan {
  targetSurahNumber: number;
  targetDays: number;
  startDate: string;
  dailyNewAyahs: number;
  dailyRevisionAyahs: number;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export interface SurahMetadata {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  startPage: number;
}

export interface UserProfile {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username: string;
  bio?: string;
  is_pro: boolean;
  current_streak: number;
  best_streak: number;
  today_reviewed: number;
  daily_goal: number;
  target_surah: number;
  target_surah_name?: string;
  preferred_reciter: string;
  font_size: number;
  theme: 'light' | 'dark' | 'system';
}

export interface Reciter {
  id: string;
  name: string;
  style: string;
  cdnPath: string;
}

export interface TelebirrPaymentRequest {
  id: string;
  telegram_id: number;
  username: string;
  full_name: string;
  amount: number;
  reference_number: string;
  screenshot_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export type TabType = 'home' | 'hifz' | 'quran' | 'quiz' | 'progress' | 'profile';
