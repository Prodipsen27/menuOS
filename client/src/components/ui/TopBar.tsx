"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import LanguageToggle from "./LanguageToggle";
import { useTranslation } from "@/hooks/useTranslation";
import { useCartStore } from "@/features/cart/cartStore";
import { useSettingsStore } from "@/features/settings/settingsStore";
import { useEffect, useState } from "react";

const HIDDEN_ROUTES = ["/ai", "/admin"];

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { restaurantName } = useSettingsStore();
  const { items, setOpenCart, openCart, tableNumber } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpenCart(() => router.push('/cart'));
  }, [router, setOpenCart]);

  const isHidden = HIDDEN_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (isHidden) return null;

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-background/95 border-b border-white/5 backdrop-blur-md">
      <h1 className="text-2xl font-headline italic font-bold text-primary tracking-tight">
        {restaurantName.split(' ')[0]}
      </h1>

     <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
  
  {/* Label */}
  <span className="text-xs text-white/60 font-medium tracking-wide">
    Table
  </span>

  <AnimatePresence>
    {mounted && tableNumber ? (
      <motion.div
        key={tableNumber}
        initial={{ opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.9 }}
        transition={{ duration: 0.25 }}
        className="bg-primary px-3 py-1 rounded-full flex items-center gap-2 shadow-lg shadow-primary/40 border border-white/10"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-on-primary animate-pulse" />

        <span className="text-xs font-bold tracking-wide text-on-primary">
          {tableNumber}
        </span>
      </motion.div>
    ) : (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-red-400"
      >
        No Table
      </motion.div>
    )}
  </AnimatePresence>
</div>

      <div className="flex items-center gap-4">
        <LanguageToggle />

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={openCart}
          className="relative w-10 h-10 flex items-center justify-center text-primary cursor-pointer"
          aria-label={t('open_cart')}
        >
          <ShoppingCart size={24} />
          {totalItems > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-on-primary text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border border-on-primary/20"
            >
              {totalItems}
            </motion.span>
          )}
        </motion.button>
      </div>
    </header>
  );
}
