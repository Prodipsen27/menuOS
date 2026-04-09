"use client";

import { motion } from "framer-motion";

interface AuraPulsarProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export default function AuraPulsar({ isListening, isSpeaking }: AuraPulsarProps) {
  return (
    <div className="relative w-56 h-56 flex items-center justify-center">
      {/* Ambient outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary/10"
        animate={{
          scale: isListening ? [1, 1.5, 1] : [1, 1.15, 1],
          opacity: isListening ? [0.4, 0, 0.4] : [0.15, 0, 0.15],
        }}
        transition={{ repeat: Infinity, duration: isListening ? 1.8 : 3.5, ease: "easeOut" }}
      />
      {/* Secondary ring */}
      <motion.div
        className="absolute inset-4 rounded-full border border-primary/15"
        animate={{
          scale: isListening ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: isListening ? [0.6, 0, 0.6] : [0.2, 0, 0.2],
        }}
        transition={{ repeat: Infinity, duration: isListening ? 1.8 : 3.5, delay: 0.3, ease: "easeOut" }}
      />

      {/* Rotating gradient ring */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: isSpeaking ? 4 : 12, ease: "linear" }}
        className="absolute inset-8 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, transparent 60%, rgba(229,196,135,0.4) 80%, transparent 100%)",
        }}
      />

      {/* Core orb */}
      <motion.div
        className="relative w-28 h-28 rounded-full bg-surface-container"
        style={{ boxShadow: "0 0 40px rgba(229,196,135,0.2), inset 0 0 20px rgba(229,196,135,0.05)" }}
        animate={{
          scale: isSpeaking ? [1, 1.06, 1] : [1, 1.02, 1],
        }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      >
        {/* Inner glow */}
        <motion.div
          className="absolute inset-3 rounded-full bg-primary/8"
          animate={{ opacity: isListening ? [0.4, 0.9, 0.4] : [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: isListening ? 1.2 : 2.5 }}
        />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-3 h-3 rounded-full bg-primary"
            animate={{
              opacity: isListening ? [1, 0.5, 1] : 1,
              boxShadow: [
                "0 0 8px rgba(229,196,135,0.6)",
                "0 0 20px rgba(229,196,135,1)",
                "0 0 8px rgba(229,196,135,0.6)",
              ],
            }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
