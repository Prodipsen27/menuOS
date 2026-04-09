"use client";

import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AuraChatProps {
  messages: Message[];
}

export default function AuraChat({ messages }: AuraChatProps) {
  return (
    <div className="flex flex-col gap-5 py-4">
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={cn(
            "flex gap-3",
            msg.role === "user" ? "flex-row-reverse self-end max-w-[85%]" : "self-start max-w-[88%]"
          )}
        >
          {/* Avatar */}
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border",
              msg.role === "user"
                ? "bg-surface-container-highest border-white/5"
                : "bg-primary/10 border-primary/20"
            )}
          >
            {msg.role === "user" ? (
              <User size={14} className="text-on-surface-variant" />
            ) : (
              <Sparkles size={14} className="text-primary" />
            )}
          </div>

          {/* Bubble */}
          <div
            className={cn(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-surface-container-high text-on-surface rounded-tr-sm"
                : "bg-surface-container-low border border-white/5 text-on-surface rounded-tl-sm"
            )}
          >
            <p>{msg.content}</p>
            <p className="mt-1.5 text-[10px] opacity-25 tabular-nums">
              {msg.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
