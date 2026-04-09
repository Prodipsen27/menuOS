"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, Ban } from "lucide-react";
import { useCartStore } from "@/features/cart/cartStore";
import { cn, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useSettingsStore } from "@/features/settings/settingsStore";
import { useTranslation } from "@/hooks/useTranslation";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  description?: string;
  isFeatured?: boolean;
}

interface MenuItemCardProps {
  item: MenuItem;
  variant?: "list" | "grid";
}

export default function MenuItemCard({ item, variant = "list" }: MenuItemCardProps) {
  const { t } = useTranslation();
  const { items, addToCart, increaseQty, decreaseQty } = useCartStore();
  const { currencySymbol } = useSettingsStore();
  
  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const isGrid = variant === "grid";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={item.isAvailable ? { y: -8, scale: 1.02 } : {}}
      className={cn(
        "bg-surface-container/30 border border-white/5 rounded-[2rem] group transition-all duration-500 overflow-hidden",
        isGrid ? "flex flex-col p-3" : "flex items-center gap-4 p-4",
        item.isFeatured && !isGrid && item.isAvailable && "border-primary/20 bg-primary/[0.03]",
        !item.isAvailable && "opacity-40 grayscale"
      )}
    >
      <Link href={`/menu/${item.id}`} className={cn(
        "flex min-w-0 flex-grow",
        isGrid ? "flex-col items-center" : "items-center gap-4"
      )}>
        {/* Product Image */}
        <div className={cn(
          "relative rounded-2xl overflow-hidden flex-shrink-0 bg-black/20 shadow-inner mb-0",
          isGrid ? "w-full aspect-square mb-3" : "w-24 h-24"
        )}>
          <img
            src={item.image}
            alt={item.name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-700",
              item.isAvailable && "group-hover:scale-110",
              isGrid ? "brightness-90" : ""
            )}
          />
          
          {item.isAvailable && item.isFeatured && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/90 backdrop-blur-md rounded-full text-[8px] font-bold text-on-primary uppercase tracking-tighter shadow-xl">
              {t('chef_pick')}
            </div>
          )}

          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white py-1.5 px-3 border border-white/20 rounded-full bg-white/10">{t('sold_out')}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn(
          "flex-grow flex flex-col gap-0.5 min-w-0",
          isGrid ? "text-center items-center pb-1" : "justify-center"
        )}>
          <div className={cn("flex items-center gap-2 max-w-full", isGrid && "justify-center")}>
            <h3 className={cn(
              "text-on-surface font-headline font-bold leading-tight truncate",
              isGrid ? "text-sm w-full" : "text-base",
              !item.isAvailable && "text-on-surface-variant/40"
            )}>
              {item.name}
            </h3>
            {quantity > 0 && !isGrid && item.isAvailable && (
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0">
                {quantity}x
              </span>
            )}
          </div>
          
          {!isGrid && (
            <p className={cn(
              "text-on-surface-variant text-xs line-clamp-1 italic font-body opacity-70",
              !item.isAvailable && "text-on-surface-variant/20"
            )}>
              {item.description || t('crafted_msg')}
            </p>
          )}
    
          <span className={cn(
            "text-primary font-bold mt-1 tracking-tight font-headline",
            isGrid ? "text-base" : "text-lg",
            !item.isAvailable && "text-primary/30"
          )}>
            {formatPrice(item.price, currencySymbol)}
          </span>
        </div>
      </Link>

      {/* Interactive Controls */}
      <div className={cn(
        "flex items-center bg-surface-container-highest/60 rounded-xl p-1 gap-1 border border-white/5",
        isGrid ? "mt-4 justify-between w-full" : "flex-col p-1.5",
        !item.isAvailable && "opacity-50"
      )}>
        <AnimatePresence mode="wait">
          {!item.isAvailable ? (
            <div className={cn("flex items-center justify-center text-on-surface-variant/20", isGrid ? "w-full h-8" : "w-11 h-11")}>
              <Ban size={16} />
            </div>
          ) : quantity > 0 ? (
            <div key="qty-controls" className={cn("flex items-center gap-1", isGrid ? "w-full justify-between" : "flex-col")}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); decreaseQty(item.id); }}
                aria-label={quantity === 1 ? t('remove_item') : t('decrease_qty')}
                className={cn(
                  "flex items-center justify-center transition-colors rounded-xl",
                  isGrid ? "w-8 h-8" : "w-11 h-11 bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                )}
              >
                {quantity === 1 ? <Trash2 size={16} className="text-error" /> : <Minus size={16} />}
              </motion.button>
              
              <span className={cn(
                "font-bold text-on-surface tabular-nums",
                isGrid ? "text-[10px]" : "text-sm w-full text-center py-1"
              )}>{quantity}</span>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); increaseQty(item.id); }}
                aria-label={t('increase_qty')}
                className={cn(
                  "bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 rounded-xl",
                  isGrid ? "w-8 h-8" : "w-11 h-11"
                )}
              >
                <Plus size={isGrid ? 14 : 20} strokeWidth={3} />
              </motion.button>
            </div>
          ) : (
            <motion.button
              key="add-control"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, category: item.category }); }}
              aria-label={t('add_to_cart')}
              className={cn(
                "bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center transition-all text-primary hover:bg-primary/20 hover:border-primary",
                isGrid ? "w-full h-10" : "w-12 h-12"
              )}
            >
              <Plus size={isGrid ? 18 : 24} strokeWidth={3} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}