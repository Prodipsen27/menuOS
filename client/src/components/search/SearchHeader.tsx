"use client";

import { motion } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface SearchHeaderProps {
  query: string;
  setQuery: (q: string) => void;
}

export default function SearchHeader({ query, setQuery }: SearchHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="sticky top-[72px] z-30 -mx-6 px-6 py-6 pb-2 transition-all">
      <div className="relative group">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "flex items-center gap-4 bg-surface-container-low/80 backdrop-blur-xl border border-white/5 rounded-3xl px-5 py-4 editorial-shadow transition-all duration-300",
            "focus-within:border-primary/30 focus-within:bg-surface-container-high/90 focus-within:shadow-[0_0_30px_rgba(229,196,135,0.05)]"
          )}
        >
          <SearchIcon className={cn(
            "transition-colors duration-300",
            query ? "text-primary" : "text-on-surface-variant/40"
          )} size={22} />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none text-base font-body tracking-tight"
            autoFocus
            aria-label={t('search')}
          />

          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setQuery("")}
              className="p-1.5 bg-surface-container-highest rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label={t('clear')}
            >
              <X size={16} />
            </motion.button>
          )}
        </motion.div>
        
        {/* Subtle Bottom Accent */}
        <div className="absolute -bottom-1 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-[1px] opacity-0 group-focus-within:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
