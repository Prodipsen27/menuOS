"use client";

import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;
}

export default function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
  return (
    <div className="flex bg-surface-container-low p-1 rounded-2xl border border-white/5 editorial-shadow">
      <button
        onClick={() => setViewMode("list")}
        className={cn(
          "relative p-2 rounded-xl transition-all duration-300",
          viewMode === "list" ? "text-primary" : "text-on-surface-variant/40"
        )}
        aria-label="List View"
      >
        {viewMode === "list" && (
          <motion.div
            layoutId="toggle-bg"
            className="absolute inset-0 bg-primary/10 rounded-xl"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <List size={20} className="relative z-10" />
      </button>

      <button
        onClick={() => setViewMode("grid")}
        className={cn(
          "relative p-2 rounded-xl transition-all duration-300",
          viewMode === "grid" ? "text-primary" : "text-on-surface-variant/40"
        )}
        aria-label="Grid View"
      >
        {viewMode === "grid" && (
          <motion.div
            layoutId="toggle-bg"
            className="absolute inset-0 bg-primary/10 rounded-xl"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <LayoutGrid size={20} className="relative z-10" />
      </button>
    </div>
  );
}
