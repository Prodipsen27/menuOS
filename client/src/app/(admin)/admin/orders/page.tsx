"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  CheckCircle2, 
  Trash2, 
  ChefHat, 
  Utensils,
  History as HistoryIcon,
  Archive
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { API_URL, API_BASE_URL } from "@/lib/apiConfig";

type OrderStatus = "received" | "preparing" | "serving" | "archived";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  table: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  elapsed?: number;
}

const socket = io(API_BASE_URL);


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // 1. Initial Fetch
    fetch(`${API_URL}/admin/orders`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("admin_token");
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("Orders payload is not an array:", data);
          setOrders([]);
        }
      });

    // 2. Real-time Listeners
    socket.on("orders:new", (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on("orders:status_update", (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    return () => {
      socket.off("orders:new");
      socket.off("orders:status_update");
    };
  }, [router]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        const updated = await response.json();
        setOrders(prev => prev.map(o => o.id === id ? updated : o));
      } else if (response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
       console.error("Update failed", error);
    }
  };

  const deleteOrderLocally = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const activeOrders = orders.filter(o => o.status !== "archived");
  const historyOrders = orders.filter(o => o.status === "archived");
  
  const displayOrders = activeTab === "active" ? activeOrders : historyOrders;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "received": return "text-primary border-primary/20 bg-primary/5";
      case "preparing": return "text-secondary border-secondary/20 bg-secondary/5";
      case "serving": return "text-emerald-400 border-emerald-400/20 bg-emerald-400/5";
      case "archived": return "text-on-surface-variant/40 border-white/5 bg-white/5";
      default: return "text-on-surface-variant/40 border-white/5 bg-white/5";
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-on-surface-variant/40 mb-2">Live Service</p>
          <h1 className="text-4xl font-headline italic font-bold text-on-surface">
            {activeTab === 'active' ? 'Order Queue' : 'Service History'}
          </h1>
        </div>
        
        <div className="flex bg-surface-container-low border border-white/5 rounded-2xl p-1 shrink-0">
          <button 
            onClick={() => setActiveTab("active")}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === "active" ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            Active ({activeOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === "history" ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            History ({historyOrders.length})
          </button>
        </div>
      </header>

      {/* Grid of Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {displayOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface-container border border-white/5 rounded-[2rem] overflow-hidden flex flex-col group"
            >
              {/* Card Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-white/5 flex items-center justify-center font-bold text-lg text-primary">
                    {order.table || "T?"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Order #{order.id ? order.id.slice(-4) : "????"}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
                      {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                    </p>
                  </div>
                </div>
                
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-wider",
                  getStatusColor(order.status)
                )}>
                  {order.status === "received" && <Clock size={12} />}
                  {order.status === "preparing" && <ChefHat size={12} />}
                  {order.status === "serving" && <CheckCircle2 size={12} />}
                  {order.status === "archived" && <HistoryIcon size={12} />}
                  {order.status}
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 p-6 space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <span className="text-primary font-bold tabular-nums">{item.quantity}×</span>
                      <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer / Actions */}
              <div className="p-4 bg-surface-container-low/50 border-t border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/20">
                  <Clock size={14} />
                  <span>{order.status === 'archived' ? 'Closed' : (order.status === 'received' ? 'New' : 'Active')}</span>
                </div>

                <div className="flex gap-2">
                  {order.status === "received" && (
                    <button 
                      onClick={() => updateStatus(order.id, "preparing")}
                      className="px-4 py-2 rounded-xl bg-surface-container-high border border-white/5 text-[10px] font-bold text-primary hover:bg-primary/10 transition-all uppercase tracking-wider"
                    >
                      Start Prep
                    </button>
                  )}
                  {order.status === "preparing" && (
                    <button 
                      onClick={() => updateStatus(order.id, "serving")}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-on-primary text-[10px] font-bold hover:bg-emerald-600 transition-all uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                    >
                      Mark Serving
                    </button>
                  )}
                  {order.status === "serving" && (
                    <button 
                      onClick={() => updateStatus(order.id, "archived")}
                      className="px-4 py-2 rounded-xl bg-surface-container-high border border-white/5 text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-all uppercase tracking-wider flex items-center gap-2"
                    >
                      <Archive size={12} /> Archive
                    </button>
                  )}
                  
                  <button 
                    onClick={async () => {
                      const token = localStorage.getItem("admin_token");
                      if (!token) return;
                      if (!confirm("Permanently delete this order from records?")) return;
                      try {
                        const res = await fetch(`${API_URL}/admin/orders/${order.id}`, {
                          method: "DELETE",
                          headers: { "Authorization": `Bearer ${token}` }
                        });
                        if (res.ok) {
                          setOrders(prev => prev.filter(o => o.id !== order.id));
                        }
                      } catch (err) {
                        console.error("Delete failed", err);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-surface-container-high border border-white/5 text-on-surface-variant/40 hover:text-rose-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {displayOrders.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-surface-container flex items-center justify-center text-on-surface-variant/20 mb-6 border border-white/5">
            <Utensils size={40} />
          </div>
          <h2 className="text-xl font-headline italic font-bold text-on-surface mb-2">
            {activeTab === 'active' ? 'Queue is clear' : 'No history yet'}
          </h2>
          <p className="text-sm text-on-surface-variant/40 max-w-[260px]">
             {activeTab === 'active' 
               ? 'All guest requests have been fulfilled. The dining room is in harmony.'
               : 'Completed orders will appear here once archived.'
             }
          </p>
        </motion.div>
      )}
    </div>
  );
}
