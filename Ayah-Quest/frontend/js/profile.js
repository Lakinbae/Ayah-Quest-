/**
 * Ayah Quest - User Profile & Display Preferences
 */

import { auth } from "./auth.js";
import { api } from "./api.js";
import { Storage } from "./storage.js";

export const ProfileManager = {
  getUser() {
    return auth.getUser();
  },

  async updateSettings(settings) {
    Storage.setSettings(settings);
    try {
      await api.updateProfile(settings);
    } catch (e) {
      console.warn("Profile update saved locally only", e);
    }
  },

  applyTheme(theme) {
    Storage.setTheme(theme);
    const root = document.documentElement;
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
};
