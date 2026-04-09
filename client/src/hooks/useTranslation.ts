"use client";

import { useSettingsStore } from "@/features/settings/settingsStore";
import { translations, TranslationKey } from "@/lib/translations";

export function useTranslation() {
  const language = useSettingsStore((state) => state.language);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return { t, language };
}
