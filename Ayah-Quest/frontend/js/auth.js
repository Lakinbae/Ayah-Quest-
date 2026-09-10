/**
 * Ayah Quest - Telegram Authentication & User State
 */

import { api } from "./api.js";
import { Storage } from "./storage.js";

export class AuthManager {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.currentUser = null;
  }

  init() {
    if (this.tg) {
      this.tg.ready();
      this.tg.expand();
      
      // Notify Telegram viewport
      if (this.tg.setHeaderColor) {
        this.tg.setHeaderColor("#064e3b"); // Deep emerald
      }
      if (this.tg.setBackgroundColor) {
        this.tg.setBackgroundColor("#0c0a09");
      }
    }

    const cachedUser = Storage.getUser();
    if (cachedUser) {
      this.currentUser = cachedUser;
    }

    return this.authenticate();
  }

  async authenticate() {
    const initData = this.tg?.initData || "";
    
    if (!initData) {
      // Running in browser testing mode: create mock guest user
      const guestUser = {
        id: "demo-local-id",
        telegram_id: 123456789,
        first_name: "Tariq",
        username: "quran_seeker",
        is_pro: false,
        current_streak: 4,
        best_streak: 12
      };
      this.currentUser = guestUser;
      Storage.setUser(guestUser);
      return guestUser;
    }

    try {
      const authRes = await api.authenticate(initData);
      if (authRes.user) {
        this.currentUser = authRes.user;
        Storage.setUser(authRes.user);
        return authRes.user;
      }
    } catch (e) {
      console.warn("Auth check failed, using local user", e);
    }
    return this.currentUser;
  }

  getUser() {
    return this.currentUser || {
      first_name: "Beloved Reciter",
      username: "seeker",
      is_pro: false,
      current_streak: 1,
      best_streak: 1
    };
  }

  isPro() {
    return Boolean(this.currentUser?.is_pro);
  }
}

export const auth = new AuthManager();
