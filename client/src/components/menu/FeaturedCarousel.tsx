"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/features/cart/cartStore";
import { cn, formatPrice } from "@/lib/utils";

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
  const [index, setIndex] = useState(0);
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const item = items[index];

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Chef's Signatures
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

      <div className="relative h-[500px] w-full rounded-[2.5rem] overflow-hidden editorial-shadow border border-white/5 bg-surface-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 cursor-pointer group"
          >
            {/* Immersive Image */}
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            
            {/* Inner Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent opacity-90" />

            {/* Content Overlays */}
            <div className="absolute bottom-0 left-0 w-full p-8">
              <div className="flex justify-between items-end gap-4">
                <div className="flex-grow">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="text-3xl font-headline font-bold text-on-surface leading-tight mb-1 drop-shadow-lg">
                      {item.name}
                    </h4>
                    <p className="text-on-surface-variant text-sm font-body italic mb-3 opacity-90 line-clamp-2 max-w-[80%]">
                      {item.description}
                    </p>
                    <span className="text-primary font-bold text-2xl tracking-tighter drop-shadow-md">
                      {formatPrice(item.price)}
                    </span>
                  </motion.div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
                  }}
                  className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-2xl active:bg-primary-container transition-colors"
                >
                  <Plus size={32} strokeWidth={2.5} />
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
