"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MenuItemCard from "@/components/menu/MenuItemCard";
import FeaturedCarousel from "@/components/menu/FeaturedCarousel";
import ViewToggle from "@/components/menu/ViewToggle";
import CartPanel from "@/components/cart/CartPanel";
import { ThreeCanvas } from "@/components/canvas/ThreeCanvas";
import { DynamicScene } from "@/components/canvas/DynamicScene";
import { Sparkles, Loader2, Utensils, Coffee, Beer, IceCream } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/features/settings/settingsStore";
import { API_URL, API_BASE_URL } from "@/lib/apiConfig";
import { useTranslation } from "@/hooks/useTranslation";
import { useLiveMenu } from "@/hooks/useLiveMenu";
import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/features/cart/cartStore";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

export default function MenuPage() {
  const searchParams = useSearchParams();
  const setTableNumber = useCartStore(state => state.setTableNumber);
  
  const { t } = useTranslation();
  const { restaurantName, cuisineStyle } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const table = searchParams.get("table");
    if (table) {
      setTableNumber(table);
    }
  }, [searchParams, setTableNumber]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/menu`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch menu items", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  useLiveMenu(fetchMenuItems);

  const categories = ["All", ...new Set(items.map((item) => item.category))];
  
  // Only available items can be featured
  const availableItems = items.filter(i => i.isAvailable);
  const featuredItems = availableItems.filter(i => i.isFeatured);
  const carouselItems = featuredItems.length > 0 ? featuredItems : (availableItems.length > 0 ? [availableItems[0]] : []);

  // Show all items, sorted by availability
  const filteredItems = items
    .filter(item => {
      // Keep items in the list even if they are in the carousel, for catalog completeness
      return selectedCategory === "All" || item.category === selectedCategory;
    })
    .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));
  return (
    <div className="relative min-h-screen bg-neutral-950 overflow-x-hidden">
      <main className="relative z-10 max-w-[450px] mx-auto pb-40 px-6">
        {/* Landscape Hero Section with 3D Background */}
        <section className="relative -mx-6 mb-12 h-[35vh] min-h-[280px] overflow-hidden rounded-b-[4rem] shadow-2xl bg-neutral-900">
          <div className="absolute inset-0 z-0">
            <ThreeCanvas stage={false} camera={{ position: [0, 0, 8], fov: 40 }}>
              <DynamicScene />
            </ThreeCanvas>
            {/* Reduced vignette for better 3D visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/20 opacity-40" />
          </div>

          <header className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8 pt-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center"
            >
              {/* Ultra small, high-tracking top label */}
              <motion.span
                initial={{ letterSpacing: "0.2em", opacity: 0 }}
                animate={{ letterSpacing: "0.6em", opacity: 0.6 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-[7px] font-black uppercase text-on-surface-variant mb-6"
              >
                {cuisineStyle} {t('experience_suffix')}
              </motion.span>

              {/* Minimalist Restaurant Icon/Name */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mb-3"
              >
                <h2 className="text-2xl font-headline italic font-light text-on-surface tracking-[0.2em]">
                  {restaurantName.split(' ')[0]}
                </h2>
              </motion.div>

              {/* The "Menu" text - Small, premium, animated */}
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 24 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-[1px] bg-primary/40" 
                />
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-[10px] font-black uppercase tracking-[0.8em] text-primary drop-shadow-glow"
                >
                  {t('menu')}
                </motion.h1>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 24 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-[1px] bg-primary/40" 
                />
              </div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1, duration: 1 }}
                className="text-[8px] uppercase tracking-[0.4em] font-medium text-on-surface leading-loose max-w-[180px]"
              >
                {t('hand_crafted')}
              </motion.p>
            </motion.div>
          </header>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">{t('awakening')}</p>
          </div>
        ) : (
          <>
            {/* Chef's Signature Carousel */}
            {carouselItems.length > 0 && <FeaturedCarousel items={carouselItems} />}

            {/* Empty State */}
            {items.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-surface-container rounded-[2rem] flex items-center justify-center mx-auto text-on-surface-variant/20">
                  <Utensils size={32} />
                </div>
                <p className="text-sm font-medium text-on-surface-variant">{t('kitchen_prep')}</p>
              </div>
            )}

            {items.length > 0 && (
              <>
                {/* Categories Navigation & View Controls (Solid Background) */}
                <div className="sticky top-[72px] z-30 mb-8 bg-neutral-950 border-b border-white/5 -mx-6 px-6 py-4 flex items-center justify-between gap-4 shadow-2xl">
                  <nav className="flex overflow-x-auto no-scrollbar gap-2 flex-grow scroll-smooth">
                    {categories.map((cat, idx) => (
                      <motion.button
                        key={cat}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border flex-shrink-0",
                          selectedCategory === cat
                            ? "bg-primary text-on-primary border-primary shadow-glow shadow-primary/20"
                            : "bg-surface-container/60 text-on-surface-variant/60 border-white/5 hover:bg-white/10 hover:text-on-surface"
                        )}
                      >
                        {cat === "All" ? t('all') : cat}
                      </motion.button>
                    ))}
                  </nav>
                  
                  <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                </div>

                {/* Menu Items Logic: List or Grid */}
                <div className={cn(
                  "grid gap-4 transition-all duration-500",
                  viewMode === "grid" ? "grid-cols-2" : "grid-cols-1"
                )}>
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                      <MenuItemCard 
                        key={item.id} 
                        item={item} 
                        variant={viewMode} 
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </>
        )}

        {/* AI Prompting Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-[3rem] bg-neutral-900 border border-primary/20 text-center relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-50 group-hover:opacity-80 transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
              <Sparkles className="text-primary" size={24} />
            </div>
            <p className="text-on-surface-variant text-sm font-headline italic mb-6 leading-relaxed">
              "{t('bold_aromatic')}"
            </p>
            <button className="bg-primary text-on-primary px-8 py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] hover:scale-105 active:scale-95 transition-all font-body uppercase shadow-lg shadow-primary/20">
              {t('ask_sommelier')}
            </button>
          </div>
        </motion.div>
      </main>

      {/* Persistent Components */}
      <CartPanel />
    </div>
  );
}