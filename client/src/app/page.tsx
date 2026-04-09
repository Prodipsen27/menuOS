"use client";

import { motion } from "framer-motion";
import { ThreeCanvas } from "@/components/canvas/ThreeCanvas";
import { HeroModel } from "@/components/canvas/HeroModel";
import { ChevronRight, Play, UtensilsCrossed } from "lucide-react";
import { useSettingsStore } from "@/features/settings/settingsStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function Home() {
  const { t } = useTranslation();
  const { restaurantName } = useSettingsStore();

  return (
    <main className="relative min-h-screen bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* 3D Background / Hero Section */}
      <div className="absolute inset-0 z-0">
        <ThreeCanvas camera={{ position: [0, 0, 4], fov: 45 }}>
          <HeroModel />
        </ThreeCanvas>
        
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-md pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-surface-container-high/40 backdrop-blur-md rounded-full border border-primary/20 ai-glow"
          >
            <UtensilsCrossed className="w-4 h-4 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
              {t('digital_sommelier')}
            </span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-headline italic text-on-surface mb-4 leading-[1.1]">
            {restaurantName.split(' ')[0]} <span className="text-primary">{restaurantName.split(' ').slice(1).join(' ')}</span>
          </h1>
          
          <p className="text-on-surface-variant font-body text-sm md:text-base leading-relaxed mb-12 max-w-[280px] mx-auto">
            {t('tagline')}
          </p>

          <div className="flex flex-col gap-4 pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl group transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t('begin_experience')}</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <button className="w-full bg-transparent border border-outline-variant/30 text-on-surface font-medium py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors">
              {t('browse_classic')}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Ambient Lighting Detail */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
    </main>
  );
}
