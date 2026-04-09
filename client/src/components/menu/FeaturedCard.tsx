"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
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

export default function FeaturedCard({ item }: { item: MenuItem }) {
  const { addToCart } = useCartStore();

  return (
    <section className="mb-12">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">
        Chef's Signature
      </h3>
      <motion.div 
        whileHover={{ y: -8 }}
        className="relative group cursor-pointer"
      >
        <div className="aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden bg-surface-container relative editorial-shadow border border-white/5">
          {/* Immersive Image */}
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          
          {/* Inner Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent opacity-80" />

          {/* Badge */}
          <div className="absolute top-6 left-6">
            <div className="bg-primary/90 backdrop-blur-md text-on-primary text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-2xl">
              Must Try
            </div>
          </div>

          {/* Content Overlays */}
          <div className="absolute bottom-0 left-0 w-full p-8">
            <div className="flex justify-between items-end gap-4">
              <div className="flex-grow">
                <h4 className="text-3xl font-headline font-bold text-on-surface leading-tight mb-1 drop-shadow-lg">
                  {item.name}
                </h4>
                <p className="text-on-surface-variant text-sm font-body italic mb-3 opacity-90">
                  {item.description}
                </p>
                <span className="text-primary font-bold text-2xl tracking-tighter drop-shadow-md">
                  {formatPrice(item.price)}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({ id: item.id, name: item.name, price: item.price });
                }}
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-[0_10px_30px_rgba(229,196,135,0.4)] active:bg-primary-container transition-colors"
              >
                <Plus size={32} strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
