/**
 * Supabase Cloud Sync Integration for Ayah Quest
 * 
 * Provides optional cloud persistence for user streaks, target surah,
 * and SRS records based on Telegram User ID.
 * Falls back gracefully to localStorage when Supabase is not configured.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, SrsReviewRecord } from '../types';

// Safely access Vite environment variables
const getEnvVar = (key: string): string => {
  try {
    const meta = import.meta as any;
    return (meta.env && meta.env[key]) || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL Schema for Supabase (run in Supabase SQL editor):
 * 
 * CREATE TABLE IF NOT EXISTS user_profiles (
 *   telegram_id BIGINT PRIMARY KEY,
 *   first_name TEXT,
 *   last_name TEXT,
 *   username TEXT,
 *   bio TEXT,
 *   current_streak INT DEFAULT 0,
 *   best_streak INT DEFAULT 0,
 *   today_reviewed INT DEFAULT 0,
 *   daily_goal INT DEFAULT 5,
 *   target_surah INT DEFAULT 1,
 *   target_surah_name TEXT DEFAULT 'Al-Fatihah',
 *   preferred_reciter TEXT DEFAULT 'ar.alafasy',
 *   font_size INT DEFAULT 28,
 *   theme TEXT DEFAULT 'dark',
 *   last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE TABLE IF NOT EXISTS srs_records (
 *   id TEXT PRIMARY KEY,
 *   telegram_id BIGINT REFERENCES user_profiles(telegram_id) ON DELETE CASCADE,
 *   surah_number INT,
 *   ayah_number INT,
 *   surah_name TEXT,
 *   text TEXT,
 *   translation TEXT,
 *   rating TEXT,
 *   repetition_count INT,
 *   reviewed_at TIMESTAMP WITH TIME ZONE,
 *   next_review_at TIMESTAMP WITH TIME ZONE
 * );
 */

export async function syncUserProfileToCloud(profile: UserProfile): Promise<void> {
  if (!supabase || !profile.telegram_id) return;

  try {
    await supabase.from('user_profiles').upsert(
      {
        telegram_id: profile.telegram_id,
        first_name: profile.first_name,
        last_name: profile.last_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        current_streak: profile.current_streak,
        best_streak: profile.best_streak,
        today_reviewed: profile.today_reviewed,
        daily_goal: profile.daily_goal,
        target_surah: profile.target_surah,
        target_surah_name: profile.target_surah_name,
        preferred_reciter: profile.preferred_reciter,
        font_size: profile.font_size,
        theme: profile.theme,
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'telegram_id' }
    );
  } catch (error) {
    console.warn('Failed to sync user profile to Supabase:', error);
  }
}

export async function fetchUserProfileFromCloud(telegramId: number): Promise<Partial<UserProfile> | null> {
  if (!supabase || !telegramId) return null;

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      telegram_id: data.telegram_id,
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      bio: data.bio,
      current_streak: data.current_streak,
      best_streak: data.best_streak,
      today_reviewed: data.today_reviewed,
      daily_goal: data.daily_goal,
      target_surah: data.target_surah,
      target_surah_name: data.target_surah_name,
      preferred_reciter: data.preferred_reciter,
      font_size: data.font_size,
      theme: data.theme,
    };
  } catch (error) {
    console.warn('Failed to fetch user profile from Supabase:', error);
    return null;
  }
}

export async function syncSrsRecordsToCloud(telegramId: number, records: SrsReviewRecord[]): Promise<void> {
  if (!supabase || !telegramId || records.length === 0) return;

  try {
    const rows = records.map((rec) => ({
      id: `${telegramId}_${rec.surahNumber}_${rec.ayahNumber}`,
      telegram_id: telegramId,
      surah_number: rec.surahNumber,
      ayah_number: rec.ayahNumber,
      surah_name: rec.surahName,
      text: rec.text,
      translation: rec.translation || '',
      rating: rec.rating,
      repetition_count: rec.repetitionCount,
      reviewed_at: rec.reviewedAt,
      next_review_at: rec.nextReviewAt,
    }));

    await supabase.from('srs_records').upsert(rows, { onConflict: 'id' });
  } catch (error) {
    console.warn('Failed to sync SRS records to Supabase:', error);
  }
}

export async function fetchSrsRecordsFromCloud(telegramId: number): Promise<SrsReviewRecord[] | null> {
  if (!supabase || !telegramId) return null;

  try {
    const { data, error } = await supabase
      .from('srs_records')
      .select('*')
      .eq('telegram_id', telegramId);

    if (error || !data) return null;

    return data.map((d) => ({
      id: `${d.surah_number}_${d.ayah_number}`,
      surahNumber: d.surah_number,
      ayahNumber: d.ayah_number,
      surahName: d.surah_name || `Surah ${d.surah_number}`,
      text: d.text || '',
      translation: d.translation || '',
      rating: (d.rating as 'perfect' | 'hesitant' | 'weak') || 'perfect',
      reviewedAt: d.reviewed_at || new Date().toISOString(),
      nextReviewAt: d.next_review_at || new Date().toISOString(),
      repetitionCount: d.repetition_count || 1,
    }));
  } catch (error) {
    console.warn('Failed to fetch SRS records from Supabase:', error);
    return null;
  }
}
