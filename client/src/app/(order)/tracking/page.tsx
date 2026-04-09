"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft, FileText, Clock, CheckCircle2,
  ChefHat, UtensilsCrossed, Loader2, ScrollText, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState, Suspense } from "react";
import { io } from "socket.io-client";
import { useSearchParams, useRouter } from "next/navigation";
import { generateOrderReceipt } from "@/lib/generateReceipt";
import { useSettingsStore } from "@/features/settings/settingsStore";
import { API_URL, API_BASE_URL } from "@/lib/apiConfig";

const socket = io(API_BASE_URL);


const STEPS = [
  { id: "received", label: "Confirmed", icon: CheckCircle2 },
  { id: "preparing", label: "In Kitchen", icon: ChefHat },
  { id: "serving", label: "Serving Soon", icon: UtensilsCrossed },
];

// ─── Empty State ──────────────────────────────────────────────────────────────
function NoOrderState() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center px-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-xs"
      >
        {/* Icon */}
        <div className="w-28 h-28 rounded-[2.5rem] bg-surface-container border border-white/5 flex items-center justify-center mb-8">
          <ScrollText size={44} className="text-on-surface-variant/20" />
        </div>

        <h2 className="text-2xl font-headline italic font-bold text-on-surface mb-2">
          No Active Orders
        </h2>
        <p className="text-sm text-on-surface-variant/50 leading-relaxed mb-10">
          Your order history will appear here once you place an order. Browse the menu and start your experience.
        </p>

        <Link href="/menu">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
          >
            Explore Menu
            <ArrowRight size={16} />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

// ─── Tracking Content ─────────────────────────────────────────────────────────
function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { restaurantName } = useSettingsStore();

  // Resolve orderId: from URL param OR from localStorage (Orders tab shortcut)
  const urlId = searchParams.get("id");
  const [orderId, setOrderId] = useState<string | null>(urlId);

  useEffect(() => {
    if (!urlId) {
      const stored = localStorage.getItem("active_order_id");
      if (stored) {
        // Redirect to proper URL so refresh works
        router.replace(`/tracking?id=${stored}`);
      } else {
        setOrderId(null);
      }
    }
  }, [urlId, router]);

  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState("received");
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    fetch(`${API_URL}/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setOrder(data);
          setStatus(data.status);
          // Clear stored ID once order is served/completed
          if (data.status === "archived") {
            localStorage.removeItem("active_order_id");
          }
        }
      })
      .catch((err) => console.error("Fetch error:", err));

    socket.emit("join_order", orderId);

    socket.on("orders:status_update", (updatedOrder) => {
      setOrder(updatedOrder);
      setStatus(updatedOrder.status);
      if (updatedOrder.status === "archived") {
        localStorage.removeItem("active_order_id");
      }
    });

    return () => {
      socket.off("orders:status_update");
    };
  }, [orderId]);

  // If no orderId resolved yet (checking localStorage) — show loader briefly
  if (!urlId && orderId === null && typeof window !== "undefined" && !localStorage.getItem("active_order_id")) {
    return <NoOrderState />;
  }

  // Still resolving from localStorage
  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  const handleDownloadReceipt = () => {
    if (!order) return;
    setGeneratingPdf(true);
    try {
      generateOrderReceipt(order, restaurantName);
    } finally {
      setTimeout(() => setGeneratingPdf(false), 1000);
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.id === status);
  const currentStep = STEPS[currentStepIndex] || STEPS[0];
  const MainIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-background text-on-surface pb-32">
      {/* Header */}
      <header className="px-6 pt-12 pb-8 flex items-center justify-between">
        <Link href="/menu" className="p-2 -ml-2 text-on-surface-variant hover:text-on-surface transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-primary">
            Order #{orderId.slice(-6).toUpperCase()}
          </h1>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest leading-none mt-1">
            Table {order?.table || "—"} · {restaurantName}
          </p>
        </div>
        <div className="w-10" />
      </header>

      <main className="px-6 max-w-[500px] mx-auto space-y-8">
        {/* Live Status Card */}
        <section className="bg-surface-container rounded-[3rem] p-10 editorial-shadow border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="text-center space-y-4 relative z-10">
            <motion.div
              key={status}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.1, 1], opacity: 1 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20"
            >
              <MainIcon size={40} className="text-primary" />
            </motion.div>

            <div>
              <h2 className="text-2xl font-headline italic font-bold capitalize">{currentStep.label}</h2>
              <p className="text-on-surface-variant font-body text-sm opacity-80 mt-1">
                {status === "received"
                  ? "We've received your order and confirmed it."
                  : status === "preparing"
                  ? "Our chefs are meticulously crafting your selection."
                  : "Your order is being served to your table."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-4">
              <Clock size={16} className="text-primary" />
              <span className="text-sm font-bold tracking-tight">
                {status === "serving" ? "Arriving now" : "Est. 8 - 12 mins"}
              </span>
            </div>
          </div>
        </section>

        {/* Vertical Stepper */}
        <section className="px-4">
          <div className="space-y-10 relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-outline-variant/20" />
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.id} className="flex gap-6 relative">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border flex items-center justify-center z-10 transition-colors duration-500",
                      isPast
                        ? "bg-primary border-primary text-on-primary"
                        : isCurrent
                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(229,196,135,0.2)]"
                        : "bg-surface-container border-outline-variant/30 text-on-surface-variant/40"
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-grow pt-1">
                    <h3 className={cn(
                      "text-sm font-bold tracking-tight uppercase",
                      isCurrent ? "text-on-surface" : "text-on-surface-variant/60"
                    )}>
                      {step.label}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Order Summary */}
        {order && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container border border-white/5 rounded-[2rem] p-6 space-y-4"
          >
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">Your Order</h3>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex gap-2">
                    <span className="text-primary font-bold">×{item.quantity}</span>
                    <span className="text-on-surface">{item.name}</span>
                  </div>
                  {item.price != null && (
                    <span className="text-on-surface-variant text-xs font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-white/5 pt-3 flex justify-between items-baseline">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Total</span>
              <span className="text-xl font-headline italic font-bold text-primary">₹{order.total?.toFixed(2)}</span>
            </div>
          </motion.section>
        )}

        {/* Actions */}
        <section className="flex gap-4">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleDownloadReceipt}
            disabled={!order || generatingPdf}
            className="flex-grow bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-primary/20 transition-all text-primary disabled:opacity-40"
          >
            {generatingPdf ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}
            {generatingPdf ? "Generating..." : "Order Receipt"}
          </motion.button>
        </section>
      </main>

      <div className="fixed bottom-[88px] left-0 w-full px-6 pointer-events-none">
        <Link href="/menu" className="pointer-events-auto block">
          <button className="w-full bg-white/5 backdrop-blur-xl border border-white/10 text-on-surface py-5 rounded-3xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-colors">
            Continue Exploring
          </button>
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
