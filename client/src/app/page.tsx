"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreeCanvas } from "@/components/canvas/ThreeCanvas";
import { HeroModel } from "@/components/canvas/HeroModel";
import { ChevronRight, Play, UtensilsCrossed, Tablet, Smartphone, Laptop } from "lucide-react";
import { useSettingsStore } from "@/features/settings/settingsStore";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";

export default function Home() {
  const { t } = useTranslation();
  const { restaurantName } = useSettingsStore();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 1024;
      return isMobileDevice || isSmallScreen;
    };

    const isCurrentlyMobile = checkDevice();
    setIsMobile(isCurrentlyMobile);

    if (isCurrentlyMobile) {
      window.location.href = "https://menu-os-frontend.vercel.app/menu?table=1";
    }
  }, []);

  // Prevent flash of desktop content on mobile
  if (isMobile === null || isMobile === true) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-primary font-headline italic text-2xl"
        >
          {restaurantName.split(' ')[0]}
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* 3D Background / Hero Section */}
      <div className="absolute inset-0 z-0">
        <ThreeCanvas camera={{ position: [0, 0, 4], fov: 45 }}>
          <HeroModel />
        </ThreeCanvas>
      </div>

      {/* Content Overlay - Desktop Version */}
      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
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

          <h1 className="text-6xl md:text-8xl font-headline italic text-on-surface mb-6 leading-[1.1]">
            {restaurantName.split(' ')[0]} <span className="text-primary">{restaurantName.split(' ').slice(1).join(' ')}</span>
          </h1>
          
          <p className="text-on-surface-variant font-body text-lg md:text-xl leading-relaxed mb-8 max-w-md">
            To experience our nocturnal culinary journey, please scan the QR code using your mobile device.
          </p>

          <div className="flex items-center gap-6 text-on-surface-variant/60 font-medium">
            <div className="flex flex-col items-center gap-2">
              <Smartphone className="w-6 h-6" />
              <span className="text-xs">Mobile</span>
            </div>
            <div className="w-8 h-[1px] bg-outline-variant" />
            <div className="flex flex-col items-center gap-2">
              <Tablet className="w-6 h-6" />
              <span className="text-xs">Tablet</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative group lg:ml-auto"
        >
          {/* QR Code Container */}
          <div className="relative p-8 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden ai-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 bg-white p-4 rounded-3xl shadow-inner">
              <Image 
                src="/images/qr-code.png" 
                alt="Scan to order" 
                width={300} 
                height={300}
                className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-on-surface font-headline italic text-xl mb-1">Scan to Start</p>
              <p className="text-on-surface-variant text-sm">Open camera on your phone</p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-secondary/20 rounded-full blur-xl animate-pulse" />
        </motion.div>
      </div>

      {/* Ambient Lighting Detail */}
      <div className="absolute -bottom-20 -left-20 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-[40rem] h-[40rem] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
    </main>
  );
}
