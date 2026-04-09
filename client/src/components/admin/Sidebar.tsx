"use client";

import { motion } from "framer-motion";
import { 
  BarChart3, 
  ChefHat, 
  ClipboardList, 
  LayoutDashboard, 
  Settings, 
  QrCode
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";
import { API_URL, API_BASE_URL } from "@/lib/apiConfig";
import { useEffect, useState } from "react";

const socket = io(API_BASE_URL);

const NAV_ITEMS = [
  { name: "Overview", icon: LayoutDashboard, href: "/admin" },
  { name: "Orders", icon: ClipboardList, href: "/admin/orders" },
  { name: "Menu", icon: ChefHat, href: "/admin/menu" },
  { name: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { name: "QR Tables", icon: QrCode, href: "/admin/qr" },
  { name: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const fetchNewOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Count only "received" orders as new
          setNewOrdersCount(data.filter((o: { status: string }) => o.status === "received").length);
        }
      } catch (err) {
        // Silently fail for sidebar badge
      }
    };

    fetchNewOrders();

    // 🚀 Real-time logic
    socket.on("orders:new", (newOrder) => {
      if (newOrder.status === "received") {
        setNewOrdersCount(prev => prev + 1);
      }
    });

    socket.on("orders:status_update", (updatedOrder) => {
      // Re-fetch or manually adjust count
      // Manual adjustment is cleaner for performance
      // If an order moves OUT of "received", decrement
      // If an order moves INTO "received" (unlikely but possible), increment
      // Since status_update happens for ANY update, we need a way to know if it was previously received.
      // Easiest is to re-fetch or keep the ID list.
      // Let's re-fetch for simplicity and accuracy, but maybe throttle?
      // Actually, let's just re-fetch the count logic.
      fetchNewOrders();
    });

    return () => {
      socket.off("orders:new");
      socket.off("orders:status_update");
    };
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-white/5 z-50 hidden lg:flex flex-col">
      {/* Brand */}
      <div className="p-8">
        <h1 className="text-2xl font-headline italic font-bold text-primary tracking-tight">
          Cafe <span className="text-on-surface-variant font-normal not-italic text-sm ml-1">Admin</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isOrders = item.href === "/admin/orders";

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={20}
                  className={cn(
                    isActive
                      ? "text-primary"
                      : "text-on-surface-variant/70 group-hover:text-on-surface"
                  )}
                />
                <span className="text-sm font-medium tracking-wide">{item.name}</span>
              </div>

              {/* New Orders badge */}
              {isOrders && newOrdersCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-on-primary text-[9px] font-bold shadow-lg shadow-primary/30"
                >
                  {newOrdersCount > 9 ? "9+" : newOrdersCount}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high/40 border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">Admin</p>
            <p className="text-[10px] text-on-surface-variant/50 truncate">Management Portal</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
