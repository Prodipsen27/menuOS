"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, Search, ScrollText, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "menu", label: "Menu", icon: UtensilsCrossed, path: "/menu" },
  { id: "search", label: "Search", icon: Search, path: "/search" },
  { id: "orders", label: "Orders", icon: ScrollText, path: "/tracking" },
  { id: "ai", label: "Concierge", icon: Sparkles, path: "/ai" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 px-4 pb-6 pt-2">
      <div className="max-w-[400px] mx-auto bg-[#151311]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] flex justify-around items-center p-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || (pathname === "/" && item.id === "menu");
          
          return (
            <Link key={item.id} href={item.path} className="relative group p-3">
              <motion.div
                initial={false}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                className={cn(
                  "flex flex-col items-center justify-center transition-colors duration-300",
                  isActive ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <item.icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(isActive && "drop-shadow-[0_0_8px_rgba(229,196,135,0.4)]")}
                />
                
                <span className={cn(
                  "text-[9px] uppercase tracking-[0.15em] font-bold mt-1.5",
                  isActive ? "opacity-100" : "opacity-60"
                )}>
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute -top-1 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
