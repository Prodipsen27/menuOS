"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  trend: number;
  icon: LucideIcon;
  description: string;
}

export default function StatCard({ label, value, trend, icon: Icon, description }: StatCardProps) {
  const isPositive = trend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-primary/20 transition-all duration-300"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-2xl bg-surface-container-high border border-white/5 text-primary">
            <Icon size={24} />
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
            isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          )}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        </div>

        <h3 className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.2em] mb-1">
          {label}
        </h3>
        <p className="text-3xl font-headline italic font-bold text-on-surface mb-2">
          {value}
        </p>
        <p className="text-on-surface-variant/40 text-[10px] uppercase font-bold tracking-wider">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
