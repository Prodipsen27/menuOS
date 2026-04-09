"use client";

import { useCartStore } from "@/features/cart/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export default function CartPage() {
  const { t } = useTranslation();
  const { items, increaseQty, decreaseQty, removeFromCart, getTotal } = useCartStore();
  const totalPrice = getTotal();
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background text-on-surface pb-40 max-w-[450px] mx-auto relative">
      {/* Header - Increased top padding for TopBar clearance */}
      <header className="px-6 pt-24 pb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/menu" className="p-2 -ml-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-headline italic font-bold tracking-tight">{t('your_selection')}</h1>
        </div>
        <div className="bg-surface-container-high px-3 py-1 rounded-full border border-primary/10">
          <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{totalCount} {totalCount === 1 ? t('item') : t('items')}</span>
        </div>
      </header>

      <main className="px-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {items.length > 0 ? (
            items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface-container-low p-5 rounded-[2.5rem] flex items-center gap-5 editorial-shadow group border border-white/5"
              >
                {/* Product Image */}
                <div className="w-16 h-16 bg-surface-container rounded-2xl overflow-hidden border border-white/5 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/10">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                </div>

                <div className="flex-grow">
                  <h3 className="font-headline font-bold text-base leading-tight mb-0.5">{item.name}</h3>
                  <p className="text-primary font-bold tracking-tighter text-sm">{formatPrice(item.price)}</p>
                </div>

                {/* Quantity Controls - Mobile Optimized 44x44 */}
                <div className="flex items-center bg-surface-container rounded-2xl p-1 gap-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => decreaseQty(item.id)}
                    aria-label={item.quantity === 1 ? t('remove_item') : t('decrease_qty')}
                    className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {item.quantity === 1 ? <Trash2 size={16} className="text-error" /> : <Minus size={16} />}
                  </motion.button>
                  <span className="w-6 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => increaseQty(item.id)}
                    aria-label={t('increase_qty')}
                    className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto opacity-20">
                <ShoppingBag size={40} />
              </div>
              <p className="text-on-surface-variant font-body italic">{t('empty_cart_msg')}</p>
              <Link href="/menu" className="inline-block px-8 py-4 bg-surface-container rounded-full text-xs font-bold uppercase tracking-widest hover:bg-surface-container-high transition-colors">
                {t('explore_menu')}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Total Summary Card */}
        {items.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container rounded-[2.5rem] p-8 space-y-4 editorial-shadow border border-primary/5"
          >
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
              <span>{t('subtotal')}</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">
              <span>{t('service_charge')}</span>
              <span>{formatPrice(0)}</span>
            </div>
            <div className="pt-6 border-t border-white/5 flex flex-col items-end gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">{t('order_total')}</span>
              <span className="text-5xl font-headline font-bold text-primary drop-shadow-glow">{formatPrice(totalPrice)}</span>
            </div>
          </motion.section>
        )}
      </main>

      {/* Floating Checkout Button - Aligned with mobile container */}
      {items.length > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-[110px] left-0 right-0 w-full max-w-[450px] mx-auto px-6 z-40"
        >
          <Link href="/checkout">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-on-primary py-5 rounded-3xl font-bold uppercase tracking-[0.3em] text-[10px] shadow-[0_20px_50px_rgba(229,196,135,0.3)] flex justify-between items-center px-8 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer" />
              <span className="relative z-10">{t('confirm_selection')}</span>
              <ArrowRight size={18} strokeWidth={3} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
