/**
 * Ayah Quest - Centralized API Service Layer
 * Connects to Cloudflare Worker backend and Quran APIs
 */

export const API_BASE = "https://ayah-backend1.lakin-awel.workers.dev";

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
    this.initData = window.Telegram?.WebApp?.initData || "";
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": this.initData,
      "Authorization": `Bearer ${this.initData}`
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.getHeaders(), ...options.headers };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`API call ${endpoint} fallback:`, err.message);
      // Allow graceful offline/fallback handling
      throw err;
    }
  }

  // Auth
  async authenticate(initData) {
    this.initData = initData;
    return this.request("/api/auth", {
      method: "POST",
      body: JSON.stringify({ initData })
    });
  }

  // Profile
  async getProfile() {
    return this.request("/api/profile");
  }

  async updateProfile(data) {
    return this.request("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  }

  // Hifz & SRS
  async getHifzProgress(surahNumber) {
    const param = surahNumber ? `?surah=${surahNumber}` : "";
    return this.request(`/api/hifz${param}`);
  }

  async logAyahReview(payload) {
    return this.request("/api/hifz/review", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async logRevisionSession(payload) {
    return this.request("/api/hifz/session", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async getTodayReviewQueue() {
    return this.request("/api/review/today");
  }

  // Recitation
  async analyzeRecitation(payload) {
    return this.request("/api/recitation/session", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  // Payments
  async getProStatus() {
    return this.request("/api/pro/status");
  }

  async createStarsInvoice() {
    return this.request("/api/create-invoice", {
      method: "POST",
      body: JSON.stringify({})
    });
  }

  async submitTelebirrPayment(referenceNumber, screenshotUrl) {
    return this.request("/api/pro/telebirr", {
      method: "POST",
      body: JSON.stringify({
        reference_number: referenceNumber,
        screenshot_url: screenshotUrl
      })
    });
  }

  // External Verified Quran API (Alquran Cloud / Quran.com API)
  async fetchSurahAyahs(surahNumber) {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`);
    const json = await res.json();
    if (json.code === 200 && json.data.length >= 2) {
      const arabic = json.data[0].ayahs;
      const translation = json.data[1].ayahs;
      return arabic.map((a, i) => ({
        number: a.numberInSurah,
        text: a.text,
        translation: translation[i]?.text || ""
      }));
    }
    throw new Error("Failed to fetch surah data");
  }
}

export const api = new ApiService();
