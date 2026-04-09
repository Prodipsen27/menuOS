"use client";

import AdminSidebar from "@/components/admin/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Bell, LogOut } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!isLoginPage && !localStorage.getItem("admin_token")) {
      router.push("/login");
    }
  }, [pathname, isLoginPage, router]);

  const fetchUnread = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token || isLoginPage) return;
    try {
      const res = await fetch("http://localhost:5000/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.filter((n: { isRead: boolean }) => !n.isRead).length);
      }
    } catch { /* silent */ }
  }, [isLoginPage]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // Clear badge when visiting notifications page
  useEffect(() => {
    if (pathname === "/admin/notifications") {
      setUnreadCount(0);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface selection:bg-primary/30">
      {!isLoginPage && (
        <>
          <AdminSidebar />

          <div className="flex-1 flex flex-col lg:pl-64">
            {/* Admin Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 sm:px-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:text-on-surface transition-colors"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <Menu size={24} />
                </button>
                <div className="hidden sm:flex items-center gap-2 text-xs font-bold tracking-widest text-on-surface-variant/40 uppercase">
                  <span>Management Console</span>
                  <span className="h-1 w-1 rounded-full bg-primary/40" />
                  <span className="text-primary italic">Live Feed</span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Functional Notification Bell */}
                <button
                  onClick={() => router.push("/admin/notifications")}
                  className="relative p-2.5 rounded-xl bg-surface-container-low border border-white/5 text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all"
                  title="Notifications"
                >
                  <Bell size={18} />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        key="badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary text-on-primary text-[9px] font-bold rounded-full shadow-lg shadow-primary/30 ring-2 ring-background"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                {/* Admin Avatar */}
                <button className="flex items-center gap-3 p-1.5 pl-3 rounded-xl bg-surface-container-low border border-white/5 hover:border-primary/20 transition-all cursor-pointer">
                  <span className="hidden sm:block text-xs font-bold text-on-surface-variant">Admin</span>
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    A
                  </div>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-surface-container-low border border-rose-500/10 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                  title="Logout Session"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </header>

            <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-[1600px] w-full mx-auto">
              {children}
            </main>
          </div>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <motion.div
                  initial={{ x: -256 }}
                  animate={{ x: 0 }}
                  exit={{ x: -256 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-64 h-full bg-surface-container-low shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AdminSidebar />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {isLoginPage && (
        <main className="w-full">{children}</main>
      )}
    </div>
  );
}
