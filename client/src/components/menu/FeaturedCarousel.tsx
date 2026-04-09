"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/features/cart/cartStore";
import { cn, formatPrice } from "@/lib/utils";

import { useTranslation } from "@/hooks/useTranslation";
import { useSettingsStore } from "@/features/settings/settingsStore";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  isFeatured?: boolean;
}

export default function FeaturedCarousel({ items }: { items: MenuItem[] }) {
  const { t } = useTranslation();
  const { currencySymbol } = useSettingsStore();
  const [index, setIndex] = useState(0);
  const { addToCart } = useCartStore();
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (items.length <= 1 || !autoPlay) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length, autoPlay]);

  const item = items[index];

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);

  const handleDragStart = () => {
    setIsDragging(true);
    setAutoPlay(false);
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    setDragX(info.offset.x);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number }; velocity: { x: number } }) => {
    setIsDragging(false);
    const threshold = 50; // Lower threshold for better responsiveness
    const velocity = info.velocity.x;

    // Check for swipe based on distance or velocity
    if (info.offset.x > threshold || (velocity > 500 && info.offset.x > 0)) {
      prev();
    } else if (info.offset.x < -threshold || (velocity < -500 && info.offset.x < 0)) {
      next();
    }

    setDragX(0);

    // Resume auto-play after a short delay
    setTimeout(() => setAutoPlay(true), 3000);
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          {t('chef_signatures')}
        </h3>
        {items.length > 1 && (
          <div className="flex gap-2">
            <button onClick={prev} className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:border-primary/20 transition-all">
              <ChevronLeft size={16} />
            </button>
            <button onClick={next} className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:border-primary/20 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="relative h-[400px] w-full rounded-[3rem] overflow-hidden editorial-shadow border border-white/5 bg-surface-container/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              x: isDragging ? dragX : 0,
              scale: isDragging ? 0.98 : 1
            }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 250,
              mass: 0.8
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing group touch-pan-y"
            style={{
              touchAction: 'pan-y', 
            }}
          >
            {/* Immersive Image */}
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            
            {/* Inner Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/10 to-transparent opacity-95" />

            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <div className="flex justify-between items-end gap-3 bg-background/80 -mx-6 -mb-6 p-6 rounded-t-[2.5rem] border-t border-white/5 shadow-2xl backdrop-blur-md">
                <Link href={`/menu/${item.id}`} className="flex-grow group/info">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h4 className="text-xl font-headline font-bold text-on-surface leading-tight mb-1 group-hover/info:text-primary transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-on-surface-variant text-[10px] font-body italic mb-2 opacity-80 line-clamp-1 max-w-[90%]">
                      {item.description}
                    </p>
                    <span className="text-primary font-bold text-lg tracking-tighter">
                      {formatPrice(item.price, currencySymbol)}
                    </span>
                  </motion.div>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, category: item.category });
                  }}
                  className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-glow active:bg-primary-container transition-all"
                >
                  <Plus size={24} strokeWidth={3} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        {items.length > 1 && (
          <div className="absolute top-8 right-8 flex gap-1.5">
            {items.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === index ? "w-8 bg-primary" : "w-2 bg-white/20"
                )} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
