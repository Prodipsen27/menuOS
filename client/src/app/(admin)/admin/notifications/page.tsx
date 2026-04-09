"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ShoppingBag,
  Settings,
  AlertCircle,
  PackageOpen,
  Check,
  CheckCheck,
  Loader2,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "order" | "payment" | "system" | "inventory";
  isRead: boolean;
  metadata?: { orderId?: string; table?: string };
  createdAt: string;
}

const TYPE_CONFIG = {
  order: { icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
  payment: { icon: Settings, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  system: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-400/10" },
  inventory: { icon: PackageOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/login"); return; }

    try {
      const res = await fetch("http://localhost:5000/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotifications(await res.json());
      else if (res.status === 401) router.push("/login");
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem("admin_token");
    try {
      await fetch(`http://localhost:5000/api/admin/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => markAsRead(n._id)));
  };

  const displayed = filter === "unread"
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">
              Live Service Feed
            </span>
          </div>
          <h1 className="text-4xl font-headline italic font-bold text-on-surface flex items-center gap-4">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-bold not-italic px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {unreadCount} new
              </span>
            )}
          </h1>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-container border border-white/5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all"
          >
            <CheckCheck size={16} />
            Mark All Read
          </button>
        )}
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all",
              filter === f
                ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
                : "bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-primary/30"
            )}
          >
            {f === "all" ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
            Retrieving Service Events...
          </p>
        </div>
      ) : displayed.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 gap-6"
        >
          <div className="w-24 h-24 rounded-[2.5rem] bg-surface-container border border-white/5 flex items-center justify-center text-on-surface-variant/10">
            <Bell size={40} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-headline italic font-bold text-on-surface mb-1">
              {filter === "unread" ? "All Caught Up" : "No Events Yet"}
            </h3>
            <p className="text-sm text-on-surface-variant/40 max-w-xs">
              {filter === "unread"
                ? "No unread notifications. Every event has been acknowledged."
                : "Service events will appear here as activity flows through the platform."}
            </p>
          </div>
          {filter === "unread" && (
            <button
              onClick={() => setFilter("all")}
              className="text-xs font-bold text-primary underline underline-offset-4"
            >
              View all history
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div layout className="space-y-3">
          <AnimatePresence mode="popLayout">
            {displayed.map((notif, i) => {
              const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
              const Icon = cfg.icon;

              return (
                <motion.div
                  key={notif._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className={cn(
                    "group relative flex items-start gap-5 p-6 rounded-[2rem] border transition-all duration-300",
                    notif.isRead
                      ? "bg-surface-container border-white/5 opacity-60 hover:opacity-100"
                      : "bg-surface-container-high border-primary/10 shadow-lg shadow-primary/5"
                  )}
                >
                  {/* Unread Dot */}
                  {!notif.isRead && (
                    <span className="absolute top-5 right-5 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}

                  {/* Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center",
                    cfg.bg
                  )}>
                    <Icon size={20} className={cfg.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className={cn(
                        "text-sm font-bold leading-snug",
                        notif.isRead ? "text-on-surface-variant" : "text-on-surface"
                      )}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/40 whitespace-nowrap flex-shrink-0">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant/60 leading-relaxed mb-3">
                      {notif.message}
                    </p>

                    {notif.metadata?.table && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 border border-white/5">
                        Table {notif.metadata.table}
                      </span>
                    )}
                  </div>

                  {/* Mark Read Button */}
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      title="Mark as read"
                      className="flex-shrink-0 w-9 h-9 rounded-xl border border-white/5 bg-surface-container flex items-center justify-center text-on-surface-variant/30 hover:text-primary hover:border-primary/30 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
