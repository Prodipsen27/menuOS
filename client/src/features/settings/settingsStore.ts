import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_URL } from "@/lib/apiConfig";

export type Language = "en" | "hi" | "bn";

interface SettingsState {
  restaurantName: string;
  cuisineStyle: string;
  currencySymbol: string;
  timezone: string;
  adminEmail: string;
  language: Language;
  isLoaded: boolean;
  fetchSettings: () => Promise<void>;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      restaurantName: "Zx Cafe",
      cuisineStyle: "Contemporary Fusion",
      currencySymbol: "₹",
      timezone: "IST (Asia/Kolkata)",
      adminEmail: "admin@aura.lux",
      language: "en",
      isLoaded: false,
      fetchSettings: async () => {
        try {
          const res = await fetch(`${API_URL}/admin/settings`);
          if (res.ok) {
            const data = await res.json();
            set({ ...data, isLoaded: true });
          }
        } catch (err) {
          console.error("Failed to load settings", err);
        }
      },
      setLanguage: (language: Language) => set({ language }),
    }),
    {
      name: "settings-storage",
      partialize: (state) => ({ language: state.language }),
    }
  )
);
