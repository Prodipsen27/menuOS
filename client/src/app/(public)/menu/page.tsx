"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MenuItemCard from "@/components/menu/MenuItemCard";
import FeaturedCarousel from "@/components/menu/FeaturedCarousel";
import ViewToggle from "@/components/menu/ViewToggle";
import CartPanel from "@/components/cart/CartPanel";
import { ThreeCanvas } from "@/components/canvas/ThreeCanvas";
import { HeroModel } from "@/components/canvas/HeroModel";
import { Sparkles, Loader2, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/features/settings/settingsStore";
import { API_URL } from "@/lib/apiConfig";


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
  const { restaurantName, cuisineStyle } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
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
  };

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
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* 3D Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <ThreeCanvas>
          <HeroModel />
        </ThreeCanvas>
      </div>

      <main className="relative z-10 max-w-[450px] mx-auto pt-24 pb-40 px-6">
        {/* Header Section */}
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="bg-primary/20 p-2 rounded-xl">
              <Sparkles className="text-primary" size={20} />
            </div>
            <span className="text-on-surface-variant text-[10px] uppercase tracking-[0.3em] font-bold">
              {cuisineStyle} Experience
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-headline italic font-bold text-on-surface leading-tight tracking-tight mb-2"
          >
            The {restaurantName.split(' ')[0]} Menu
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-on-surface-variant font-body text-sm max-w-[280px]"
          >
            Hand-crafted culinary experiences designed for the gourmet soul.
          </motion.p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Loader2 className="animate-spin text-primary" size={24} />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Awakening the Catalog...</p>
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
                <p className="text-sm font-medium text-on-surface-variant">The kitchen is currently in preparation.</p>
              </div>
            )}

            {items.length > 0 && (
              <>
                {/* Categories Navigation & View Controls */}
                <div className="sticky top-[72px] z-30 mb-8 bg-background/80 backdrop-blur-md -mx-6 px-6 py-4 flex items-center justify-between gap-4">
                  <nav className="flex overflow-x-auto no-scrollbar gap-3 flex-grow">
                    {categories.map((cat, idx) => (
                      <motion.button
                        key={cat}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                          selectedCategory === cat
                            ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/25"
                            : "bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-high"
                        )}
                      >
                        {cat}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 p-6 rounded-[2.5rem] bg-surface-container-high/40 backdrop-blur-md border border-primary/10 text-center"
        >
          <p className="text-on-surface-variant text-xs italic font-body mb-4">
            "I'm looking for something bold and aromatic..."
          </p>
          <button className="bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-2xl text-xs font-bold tracking-wider hover:bg-primary/20 transition-all">
            ASK YOUR DIGITAL SOMMELIER
          </button>
        </motion.div>
      </main>

      {/* Persistent Components */}
      <CartPanel />
    </div>
  );
}