"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/features/settings/settingsStore";

export default function SettingsManager({ children }: { children: React.ReactNode }) {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const language = useSettingsStore((state) => state.language);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <>{children}</>;
}
