/**
 * Ayah Quest - Local Storage & Cache Manager
 */

const STORAGE_KEYS = {
  USER: "ayah_user",
  THEME: "ayah_theme",
  SETTINGS: "ayah_settings",
  ACTIVE_RANGE: "ayah_active_range",
  OFFLINE_PROGRESS: "ayah_offline_progress",
  CUSTOM_RANGES: "ayah_custom_ranges",
  BOOKMARKS: "ayah_bookmarks"
};

export const Storage = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  },

  getUser() {
    return this.get(STORAGE_KEYS.USER, null);
  },

  setUser(user) {
    this.set(STORAGE_KEYS.USER, user);
  },

  getTheme() {
    return this.get(STORAGE_KEYS.THEME, "system");
  },

  setTheme(theme) {
    this.set(STORAGE_KEYS.THEME, theme);
  },

  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS, {
      reciter: "ar.alafasy",
      playbackSpeed: 1.0,
      autoNext: true,
      repetitions: 3,
      fontSize: 26,
      showTranslation: true
    });
  },

  setSettings(settings) {
    this.set(STORAGE_KEYS.SETTINGS, settings);
  },

  getActiveRange() {
    return this.get(STORAGE_KEYS.ACTIVE_RANGE, {
      surahNumber: 67,
      surahName: "Al-Mulk",
      startAyah: 1,
      endAyah: 10
    });
  },

  setActiveRange(range) {
    this.set(STORAGE_KEYS.ACTIVE_RANGE, range);
  }
};
