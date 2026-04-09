"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { menuData } from "@/features/menu/data";
import MenuItemCard from "@/components/menu/MenuItemCard";
import SearchHeader from "@/components/search/SearchHeader";
import CartPanel from "@/components/cart/CartPanel";
import { Sparkles, Trophy, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    return menuData.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description?.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  const recommendedItems = useMemo(() => {
    return menuData.filter(i => i.isFeatured).slice(0, 2);
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <main className="relative z-10 max-w-[450px] mx-auto pt-24 pb-40 px-6">
        {/* Title */}
        <header className="mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-headline italic font-bold text-on-surface"
          >
            Find your Aura
          </motion.h1>
          <p className="text-on-surface-variant/60 text-xs font-body mt-1">
            Discover artisan dishes and signature botanical blends.
          </p>
        </header>

        {/* Search Input Bar */}
        <SearchHeader query={query} setQuery={setQuery} />

        {/* Results / Empty State */}
        <div className="mt-8">
          <AnimatePresence mode="popLayout">
            {query.trim() === "" ? (
              /* Discovery / Recommended State */
              <motion.div
                key="discovery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-10"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-primary" size={16} />
                    <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-on-surface-variant/80">
                      Recommended for You
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {recommendedItems.map((item) => (
                      <MenuItemCard key={item.id} item={item} variant="grid" />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="text-primary" size={16} />
                    <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-on-surface-variant/80">
                      Popular Collections
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Botanical Drinks", "Vintage Wines", "Small Plates", "Chef's Signatures"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag.split(' ')[0])}
                        className="bg-surface-container-low border border-white/5 py-3 px-5 rounded-2xl text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : filteredItems.length > 0 ? (
              /* Search Results */
              <motion.div
                key="results"
                layout
                className="grid grid-cols-2 gap-4"
              >
                {filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} variant="grid" />
                ))}
              </motion.div>
            ) : (
              /* No Results State */
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <div className="bg-surface-container-high w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <Flame className="text-on-surface-variant/20" size={32} />
                </div>
                <h3 className="text-on-surface font-headline italic text-xl mb-2">No matches found</h3>
                <p className="text-on-surface-variant/50 text-xs px-10 leading-relaxed font-body">
                  Our Sommelier couldn't find "{query}". Try searching for categories like "Mains" or "Drinks".
                </p>
                <button
                  onClick={() => setQuery("")}
                  className="mt-8 text-primary font-bold text-xs underline underline-offset-8 decoration-primary/30"
                >
                  Clear search and try again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Cart Panel Overlay - Persistent across public routes */}
      <CartPanel />
    </div>
  );
}
