"use client";

import { useCartStore } from "@/features/cart/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export default function CartPanel() {
  const { t } = useTranslation();
  const { items, getTotal } = useCartStore();
  
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = getTotal();

  return (
    <AnimatePresence>
      {totalCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-[110px] left-0 right-0 w-full max-w-[450px] mx-auto px-6 z-40 pointer-events-none"
        >
          <Link href="/cart" className="pointer-events-auto block">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-4 rounded-3xl flex justify-between items-center px-6 shadow-[0_20px_50px_rgba(229,196,135,0.3)] transition-colors relative overflow-hidden group"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-on-primary/10 p-2 rounded-xl">
                  <ShoppingBag size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-headline tracking-tight uppercase text-[10px] opacity-80">
                    {t('your_selection')}
                  </span>
                  <span className="text-sm font-bold">
                    {totalCount} {totalCount === 1 ? t('item') : t('items')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <span className="text-xl font-headline font-bold">
                  {formatPrice(totalPrice)}
                </span>
                <div className="bg-on-primary/20 p-1.5 rounded-full transition-transform group-hover:translate-x-1">
                  <ArrowRight size={16} strokeWidth={3} />
                </div>
              </div>
            </motion.button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}