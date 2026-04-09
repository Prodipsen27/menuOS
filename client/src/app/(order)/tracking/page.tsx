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
import { useTranslation } from "@/hooks/useTranslation";
import { useSearchParams, useRouter } from "next/navigation";
import { generateOrderReceipt } from "@/lib/generateReceipt";
import { useSettingsStore } from "@/features/settings/settingsStore";
import { API_URL, API_BASE_URL } from "@/lib/apiConfig";
import { useCartStore } from "@/features/cart/cartStore";
import { useDialogStore } from "@/features/ui/dialogStore";
import { XCircle } from "lucide-react";

const socket = io(API_BASE_URL);

/* Status Steps helper */
const getSteps = (t: any) => [
  { id: "received", label: t('confirmed'), icon: CheckCircle2 },
  { id: "preparing", label: t('in_kitchen'), icon: ChefHat },
  { id: "serving", label: t('serving_soon'), icon: UtensilsCrossed },
];

// ─── Empty State ──────────────────────────────────────────────────────────────
function NoOrderState() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center px-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-xs"
      >
        <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-8">
          <ScrollText size={24} className="text-primary/30" />
        </div>

        <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-on-surface mb-3">
          {t('no_active_orders')}
        </h2>
        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40 leading-relaxed mb-10">
          {t('order_history_msg')}
        </p>

        <Link href="/menu">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 bg-primary text-black px-8 py-3.5 rounded-full font-bold uppercase tracking-[0.2em] text-[8px] transition-all"
          >
            {t('explore_menu')}
            <ArrowRight size={12} />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

// ─── Tracking Content ─────────────────────────────────────────────────────────
function TrackingContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { restaurantName } = useSettingsStore();

  const urlId = searchParams.get("id");
  const [orderId, setOrderId] = useState<string | null>(urlId);

  useEffect(() => {
    if (!urlId) {
      const stored = localStorage.getItem("active_order_id");
      if (stored) {
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
            if (data.status === "archived" || data.status === "canceled") {
              localStorage.removeItem("active_order_id");
            }
          } else {
            // Order not found or invalid
            localStorage.removeItem("active_order_id");
            setOrderId(null);
          }
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          localStorage.removeItem("active_order_id");
          setOrderId(null);
        });

    socket.emit("join_order", orderId);

    socket.on("orders:status_update", (updatedOrder) => {
      setOrder(updatedOrder);
      setStatus(updatedOrder.status);
      if (updatedOrder.status === "archived" || updatedOrder.status === "canceled") {
        localStorage.removeItem("active_order_id");
      }
    });

    return () => {
      socket.off("orders:status_update");
    };
  }, [orderId]);

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { setItems } = useCartStore();
  const showDialog = useDialogStore((state) => state.show);

  useEffect(() => {
    if (!order || order.status !== "received") {
      setTimeLeft(0);
      return;
    }

    const createdAt = new Date(order.createdAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = 40 * 1000 - (now - createdAt);
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  const handleCancelOrder = async () => {
    if (!order) return;

    showDialog({
      type: "confirm",
      title: t('cancel_order'),
      message: t('confirm_cancel_order'),
      confirmLabel: t('confirm'),
      cancelLabel: t('back'),
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
            method: "POST",
          });

          if (res.ok) {
            setItems(order.items);
            localStorage.removeItem("active_order_id");
            router.push("/cart");
          } else {
            const error = await res.json();
            showDialog({
              type: "error",
              message: error.message || t('error_msg')
            });
          }
        } catch (err) {
          console.error("Cancel error:", err);
        }
      }
    });
  };

  if ((!urlId && orderId === null && typeof window !== "undefined" && !localStorage.getItem("active_order_id")) || (order && (status === "archived" || status === "canceled"))) {
    return <NoOrderState />;
  }

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary/30" size={20} />
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

  const STEPS = getSteps(t);
  const currentStepIndex = STEPS.findIndex((s) => s.id === status);
  const currentStep = STEPS[currentStepIndex] || STEPS[0];
  const MainIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-background text-on-surface pb-40">
      {/* Header */}
      <header className="px-6 pt-24 pb-12 flex items-center justify-between">
        <Link href="/menu" className="p-2 -ml-2 text-on-surface-variant/40 hover:text-primary transition-colors">
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Link>
        <div className="text-center">
          <h1 className="text-[9px] font-bold uppercase tracking-[0.5em] text-primary/80">
            {t('order_num')} #{orderId.slice(-6).toUpperCase()}
          </h1>
          <p className="text-[7px] text-on-surface-variant/20 uppercase tracking-[0.6em] mt-3">
            {t('table')} {order?.table || "—"} · {restaurantName}
          </p>
        </div>
        <div className="w-10" />
      </header>

      <main className="px-6 max-w-[450px] mx-auto space-y-12">
        {/* Live Status Card */}
        <section className="relative py-12 px-6 border border-white/[0.03] bg-white/[0.01] rounded-[2.5rem] overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[80px]" />
          
          <div className="text-center space-y-6 relative z-10">
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative w-20 h-20 mx-auto"
            >
              <div className="absolute inset-0 rounded-full bg-primary/5 border border-primary/10 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MainIcon size={28} strokeWidth={1.5} className="text-primary" />
              </div>
            </motion.div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-on-surface">
                {currentStep.label}
              </h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50 leading-relaxed mt-4 max-w-[240px] mx-auto">
                {status === "received"
                  ? t('order_received_msg')
                  : status === "preparing"
                  ? t('chef_preparing_msg')
                  : t('order_serving_msg')}
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 pt-4">
              <div className="flex items-center gap-3 opacity-60">
                <Clock size={12} className="text-primary" />
                <span className="text-[9px] uppercase tracking-[0.3em] font-medium">
                  {status === "serving" ? t('arriving_now') : t('est_time')}
                </span>
              </div>

              {/* Order Receipt Button Nested Here */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadReceipt}
                disabled={!order || generatingPdf}
                className="group relative flex items-center gap-4 bg-primary/[0.03] border border-primary/20 px-8 py-3 rounded-full transition-all hover:bg-primary/10 disabled:opacity-40"
              >
                {generatingPdf ? (
                  <Loader2 size={12} className="animate-spin text-primary/40" />
                ) : (
                  <FileText size={12} className="text-primary/60 group-hover:text-primary transition-colors" />
                )}
                <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-primary/80 group-hover:text-primary transition-colors">
                  {generatingPdf ? t('generating') : t('order_receipt')}
                </span>
              </motion.button>

              {timeLeft > 0 && (
                <div className="flex flex-col items-center gap-4 pt-8 border-t border-white/[0.03] w-full">
                  <p className="text-[7px] uppercase tracking-[0.3em] text-on-surface-variant/30 flex items-center gap-2">
                    <Clock size={8} /> 
                    {Math.floor(timeLeft / 1000 / 60)}:{Math.floor((timeLeft / 1000) % 60).toString().padStart(2, '0')} {t('left_to_cancel')}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelOrder}
                    className="flex items-center gap-3 text-[8px] font-bold uppercase tracking-[0.4em] text-red-500/60 hover:text-red-500 transition-colors"
                  >
                    <XCircle size={10} />
                    {t('cancel_order')}
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Vertical Stepper */}
        <section className="px-4">
          <div className="space-y-12 relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-white/[0.05]" />
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.id} className="flex gap-8 relative items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full border flex items-center justify-center z-10 transition-all duration-700",
                      isPast
                        ? "bg-primary border-primary text-black shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                        : isCurrent
                        ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                        : "bg-background border-white/10 text-white/10"
                    )}
                  >
                    <Icon size={14} strokeWidth={isCurrent ? 2 : 1.5} />
                  </div>
                  <div className="flex-grow">
                    <h3 className={cn(
                      "text-[9px] font-bold tracking-[0.3em] uppercase transition-colors duration-700",
                      isCurrent ? "text-on-surface" : isPast ? "text-on-surface/50" : "text-on-surface-variant/10"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 pt-12 border-t border-white/[0.03]"
          >
            <h3 className="text-[8px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/20 text-center">
              {t('your_order')}
            </h3>
            
            <div className="space-y-5 px-2">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-bold text-primary/40 w-4">
                      {item.quantity}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-on-surface/70">
                      {item.name}
                    </span>
                  </div>
                  {item.price != null && (
                    <span className="text-[9px] font-medium text-on-surface-variant/30 tracking-[0.1em]">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-8 flex justify-between items-center border-t border-white/[0.03]">
              <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/10">
                {t('total')}
              </span>
              <span className="text-xl font-bold text-primary tracking-tight">
                ₹{order.total?.toFixed(2)}
              </span>
            </div>
          </motion.section>
        )}
      </main>

      <div className="fixed bottom-[110px] left-0 w-full px-6 flex justify-center">
        <Link href="/menu" className="w-full max-w-[450px]">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] text-on-surface/40 py-4 rounded-full text-[8px] font-bold uppercase tracking-[0.4em] hover:bg-white/[0.06] hover:text-on-surface transition-all"
          >
            {t('continue_exploring')}
          </motion.button>
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
          <Loader2 className="animate-spin text-primary/20" size={20} />
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
