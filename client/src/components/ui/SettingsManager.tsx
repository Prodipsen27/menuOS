"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/features/settings/settingsStore";

export default function SettingsManager({ children }: { children: React.ReactNode }) {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return <>{children}</>;
}
