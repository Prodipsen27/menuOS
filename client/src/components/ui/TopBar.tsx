"use client";

import { motion } from "framer-motion";
import { Menu, User } from "lucide-react";
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ["/ai", "/admin"];

export default function TopBar() {
  const pathname = usePathname();
  const isHidden = HIDDEN_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (isHidden) return null;

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center">
      {/* Glass backdrop */}
      {/* <div className="absolute inset-0 bg-[#151311]/60 backdrop-blur-2xl border-b border-white/5 -z-10" /> */}

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 flex items-center justify-center text-primary cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </motion.button>
        <h1 className="text-2xl font-headline italic font-bold text-primary tracking-tight">
          Cafe
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-primary/10"
      >
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <span className="text-[10px] font-bold tracking-tight text-primary uppercase">
          Table 7 · Dine-in
        </span>
      </motion.div>
    </header>
  );
}
