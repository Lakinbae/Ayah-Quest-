export interface Ayah {
  number: number;
  surahNumber: number;
  surahName: string;
  text: string;
  translation: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export interface UserProfile {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username: string;
  is_pro: boolean;
  current_streak: number;
  best_streak: number;
  today_reviewed: number;
  daily_goal: number;
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
