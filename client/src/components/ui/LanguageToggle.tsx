"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore, Language } from "@/features/settings/settingsStore";
import { Globe } from "lucide-react";
import { useState } from "react";

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "hi", label: "हि" },
  { id: "bn", label: "বং" },
];

export default function LanguageToggle() {
  const { language, setLanguage } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 transition-colors group"
      >
        <Globe size={14} className="text-primary group-hover:rotate-12 transition-transform" />
        <span className="text-[10px] font-bold tracking-widest text-on-surface">
          {currentLang.label}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div 
              className="fixed inset-0 z-[-1]" 
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute right-0 mt-2 bg-[#1C1917] border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-w-[100px] z-50"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-xs font-bold transition-colors hover:bg-white/5 flex items-center justify-between ${
                    language === lang.id ? "text-primary bg-primary/5" : "text-on-surface-variant"
                  }`}
                >
                  {lang.label === "EN" ? "English" : lang.label === "हि" ? "हिन्दी" : "বাংলা"}
                  {language === lang.id && (
                    <motion.div 
                      layoutId="active-lang"
                      className="w-1.5 h-1.5 bg-primary rounded-full" 
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
