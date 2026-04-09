"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Keyboard, Send, ArrowLeft, Volume2, VolumeX,
  MicOff, ChevronDown
} from "lucide-react";
import AuraPulsar from "@/components/ai/AuraPulsar";
import AuraChat, { Message } from "@/components/ai/AuraChat";
import { cn } from "@/lib/utils";
import Link from "next/link";

const SOMMELIER_REPLIES = [
  "An excellent choice. Our cellar master recommends the 2018 Vintage Reserve to pair with the Wagyu Short Rib. Shall I add it to your selection?",
  "The Burrata & Heirloom pairs beautifully with a crisp Chenin Blanc this evening. Would you like to explore the wine menu?",
  "Certainly. The Truffle Salmon Bowl features black truffle oil from Périgord — a truly singular ingredient. May I suggest a starter to precede it?",
  "Tonight's Chef's Signature is the Wagyu Short Rib, braised for 48 hours. I can have it prioritised for your table.",
];

let replyIndex = 0;
function getNextReply() {
  const reply = SOMMELIER_REPLIES[replyIndex % SOMMELIER_REPLIES.length];
  replyIndex++;
  return reply;
}

export default function AIPage() {
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "Welcome. I am Aura, your digital sommelier. How may I guide your culinary journey tonight?",
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceSubtitle, setVoiceSubtitle] = useState(
    "Tap the orb and speak naturally..."
  );
  const [isListeningActive, setIsListeningActive] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when switching to text mode
  useEffect(() => {
    if (mode === "text") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [mode]);

  const handleSend = (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    if (mode === "voice") {
      setVoiceSubtitle("Aura is curating your response...");
    }

    setTimeout(() => {
      const reply = getNextReply();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsProcessing(false);
      if (mode === "voice") {
        setVoiceSubtitle(reply);
        setTimeout(() => setVoiceSubtitle("Tap the orb and speak naturally..."), 6000);
      }
    }, 1800);
  };

  const handleVoiceTap = () => {
    if (isProcessing) return;
    setIsListeningActive((v) => {
      const next = !v;
      if (next) {
        setVoiceSubtitle("Listening... speak now");
        // Simulate a voice input after 2s
        setTimeout(() => {
          setIsListeningActive(false);
          handleSend("What would you recommend with the Wagyu Short Rib?");
        }, 2200);
      } else {
        setVoiceSubtitle("Tap the orb and speak naturally...");
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      {/* ── Radial Atmosphere ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(229,196,135,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── Top Header ── */}
      <header className="relative z-20 flex items-center justify-between px-5 pt-16 pb-4">
        <Link
          href="/menu"
          className="w-11 h-11 bg-surface-container-low rounded-2xl flex items-center justify-center border border-white/5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          aria-label="Back to menu"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-on-surface-variant/40">
            Aura Concierge
          </span>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              animate={{ opacity: isProcessing ? [1, 0.3, 1] : 1 }}
              transition={{ repeat: isProcessing ? Infinity : 0, duration: 0.8 }}
            />
            <span className="text-xs text-on-surface-variant font-medium">
              {isProcessing ? "Processing..." : "Ready"}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-11 h-11 bg-surface-container-low rounded-2xl flex items-center justify-center border border-white/5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          aria-label={isMuted ? "Unmute Aura" : "Mute Aura"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </header>

      {/* ── Centered Mode Toggle ── */}
      <div className="relative z-20 flex justify-center py-2">
        <div className="flex bg-surface-container-low border border-white/8 rounded-2xl p-1 gap-1 editorial-shadow">
          <button
            onClick={() => setMode("voice")}
            className={cn(
              "relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer overflow-hidden",
              mode === "voice" ? "text-on-primary" : "text-on-surface-variant/50 hover:text-on-surface-variant"
            )}
            aria-label="Switch to voice mode"
          >
            {mode === "voice" && (
              <motion.div
                layoutId="active-mode"
                className="absolute inset-0 bg-primary rounded-xl"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Mic size={16} className="relative z-10" />
            <span className="relative z-10">Voice</span>
          </button>

          <button
            onClick={() => setMode("text")}
            className={cn(
              "relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer overflow-hidden",
              mode === "text" ? "text-on-primary" : "text-on-surface-variant/50 hover:text-on-surface-variant"
            )}
            aria-label="Switch to text/chat mode"
          >
            {mode === "text" && (
              <motion.div
                layoutId="active-mode"
                className="absolute inset-0 bg-primary rounded-xl"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Keyboard size={16} className="relative z-10" />
            <span className="relative z-10">Chat</span>
          </button>
        </div>
      </div>

      {/* ── Main Interaction Area ── */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === "voice" ? (
            /* ── VOICE MODE ── */
            <motion.div
              key="voice"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full flex flex-col items-center justify-between py-6 px-6"
            >
              {/* Pulsar + Tap zone */}
              <div className="flex-1 flex flex-col items-center justify-center gap-8">
                <motion.button
                  onClick={handleVoiceTap}
                  disabled={isProcessing}
                  className="cursor-pointer relative"
                  whileTap={{ scale: 0.96 }}
                  aria-label="Tap to speak"
                >
                  <AuraPulsar
                    isListening={isListeningActive}
                    isSpeaking={isProcessing}
                  />
                  {/* State badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <motion.div
                      animate={{ opacity: isListeningActive ? 1 : 0.5 }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                        isListeningActive
                          ? "bg-primary/20 border-primary/30 text-primary"
                          : isProcessing
                          ? "bg-surface-container-high border-white/10 text-on-surface-variant"
                          : "bg-surface-container border-white/5 text-on-surface-variant/50"
                      )}
                    >
                      {isListeningActive ? (
                        <>
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                          />
                          Listening
                        </>
                      ) : isProcessing ? (
                        "Processing"
                      ) : (
                        <>
                          <Mic size={10} />
                          Tap to speak
                        </>
                      )}
                    </motion.div>
                  </div>
                </motion.button>

                {/* Subtitle Display */}
                <motion.div
                  key={voiceSubtitle}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-[300px] text-center"
                >
                  <p className="text-on-surface-variant text-sm font-body italic leading-relaxed">
                    "{voiceSubtitle}"
                  </p>
                </motion.div>
              </div>

              {/* Recent message strip */}
              {messages.length > 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setMode("text")}
                  className="w-full bg-surface-container-low border border-white/5 rounded-2xl p-4 text-left cursor-pointer hover:border-primary/20 transition-colors"
                  aria-label="View full conversation"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-on-surface-variant/40">
                      Last response
                    </span>
                    <ChevronDown size={14} className="text-on-surface-variant/30" />
                  </div>
                  <p className="text-on-surface text-xs leading-relaxed line-clamp-2">
                    {messages[messages.length - 1].content}
                  </p>
                </motion.button>
              )}
            </motion.div>
          ) : (
            /* ── TEXT CHAT MODE ── */
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="h-full flex flex-col"
            >
              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto no-scrollbar px-5 pb-2"
                role="log"
                aria-live="polite"
                aria-label="Conversation with Aura"
              >
                <AuraChat messages={messages} />

                {/* Typing indicator */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-1.5 items-center ml-11 mt-4"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-primary/40 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input bar */}
              <div className="px-5 pb-8 pt-3 border-t border-white/5 bg-background/60 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(input)}
                    placeholder="Ask about pairings, allergens..."
                    disabled={isProcessing}
                    className="flex-1 bg-surface-container-low border border-white/8 rounded-2xl py-3.5 px-4 text-sm font-body text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/30 transition-all disabled:opacity-50"
                    aria-label="Type a message to Aura"
                  />
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleSend(input)}
                    disabled={!input.trim() || isProcessing}
                    className="w-12 h-12 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 transition-opacity"
                    aria-label="Send message"
                  >
                    <Send size={18} strokeWidth={2.5} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
