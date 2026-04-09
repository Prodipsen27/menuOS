import { create } from "zustand";
import { API_URL } from "@/lib/apiConfig";

interface SettingsState {
  restaurantName: string;
  cuisineStyle: string;
  currencySymbol: string;
  timezone: string;
  adminEmail: string;
  isLoaded: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  restaurantName: "Zx Cafe",
  cuisineStyle: "Contemporary Fusion",
  currencySymbol: "₹",
  timezone: "IST (Asia/Kolkata)",
  adminEmail: "admin@aura.lux",
  isLoaded: false,
  fetchSettings: async () => {
    try {
      const res = await fetch(`${API_URL}/admin/settings`);

      // Actually, public menu shouldn't need admin token for basic settings
      // Let's create a public settings route or just allow getSettings to be public
      if (res.ok) {
        const data = await res.json();
        set({ ...data, isLoaded: true });
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  },
}));
