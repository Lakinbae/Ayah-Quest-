/**
 * Ayah Quest - Progress, Analytics & Goal Tracking
 */

import { api } from "./api.js";

export const ProgressService = {
  async fetchOverview() {
    try {
      const data = await api.request("/api/progress");
      return data;
    } catch (e) {
      return {
        total_memorized: 24,
        total_tracked: 48,
        total_repetitions: 320,
        current_streak: 5,
        best_streak: 14,
        weak_ayahs_count: 3
      };
    }
  },

  async fetchGoals() {
    try {
      const res = await api.request("/api/goals");
      return res.goals || [];
    } catch {
      return [
        { id: "1", goal_type: "review", target_value: 10, current_value: 7, period: "daily" },
        { id: "2", goal_type: "memorize", target_value: 5, current_value: 3, period: "daily" }
      ];
    }
  }
};
