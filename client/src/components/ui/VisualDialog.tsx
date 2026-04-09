"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDialogStore } from "@/features/ui/dialogStore";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VisualDialog() {
  const { 
    isOpen, type, title, message, 
    onConfirm, onCancel, confirmLabel, cancelLabel, close 
  } = useDialogStore();

  const handleConfirm = () => {
    onConfirm?.();
    close();
  };

  const handleCancel = () => {
    onCancel?.();
    close();
  };

  const Icon = type === "error" ? AlertCircle : type === "warning" ? AlertTriangle : type === "confirm" ? CheckCircle2 : Info;
  const iconColor = type === "error" ? "text-red-500" : type === "warning" ? "text-amber-500" : type === "confirm" ? "text-primary" : "text-primary/60";
  const showCancel = type === "confirm" || type === "warning";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[340px] bg-background border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute top-0 right-0 p-4">
              <button onClick={handleCancel} className="p-2 text-on-surface-variant/20 hover:text-on-surface transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-8 pt-10 text-center">
              <div className={cn("inline-flex p-3 rounded-full bg-white/[0.02] border border-white/[0.05] mb-6", iconColor)}>
                <Icon size={24} strokeWidth={1.5} />
              </div>

              {title && (
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface mb-3">
                  {title}
                </h3>
              )}

              <p className="text-[11px] uppercase tracking-[0.2em] text-on-surface-variant/50 leading-relaxed mb-10">
                {message}
              </p>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="w-full bg-primary text-black py-4 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] shadow-[0_10px_20px_rgba(212,175,55,0.15)]"
                >
                  {confirmLabel}
                </motion.button>
                
                {showCancel && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    className="w-full bg-white/[0.03] text-on-surface/40 py-4 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] border border-white/[0.05]"
                  >
                    {cancelLabel}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Subtle Gradient Glow */}
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-[60px] -z-10" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
