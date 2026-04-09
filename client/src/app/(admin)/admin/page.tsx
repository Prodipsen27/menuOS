"use client";

import { motion } from "framer-motion";
import { 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Clock, 
  ArrowUpRight, 
  ExternalLink,
  RefreshCw
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { cn, formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/features/settings/settingsStore";

interface DashboardStats {
  totalRevenue: number;
  activeTables: number;
  fulfilledOrders: number;
  hourlyData: { label: string; value: number }[];
  recentActivity: { id: string; status: string; time: string; color: string }[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { currencySymbol } = useSettingsStore();
  const router = useRouter();

  const fetchStats = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/40 animate-pulse">Synchronizing Aura Pulse...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <header className="flex items-end justify-between">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">
              Management Intelligence
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-headline italic font-bold text-on-surface"
          >
            Performance Overview
          </motion.h1>
        </div>
        
        <button 
          onClick={() => { setLoading(true); fetchStats(); }}
          className="p-3 rounded-2xl bg-surface-container border border-white/5 text-on-surface-variant/40 hover:text-primary transition-all"
        >
          <RefreshCw size={20} className={cn(loading && "animate-spin")} />
        </button>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          label="Total Revenue" 
          value={formatPrice(stats?.totalRevenue || 0, currencySymbol)} 
          trend={12.5} 
          icon={DollarSign}
          description="Cumulative net service"
        />
        <StatCard 
          label="Active Tables" 
          value={`${stats?.activeTables || 0} Open`} 
          trend={8.2} 
          icon={Users}
          description="Current live occupancy"
        />
        <StatCard 
          label="Orders Fulfilled" 
          value={stats?.fulfilledOrders?.toString() || "0"} 
          trend={-4.1} 
          icon={ShoppingBag}
          description="Successful service cycles"
        />
        <StatCard 
          label="Avg Prep Time" 
          value="12 min" 
          trend={0} 
          icon={Clock}
          description="Operational target: <15m"
        />
      </div>

      {/* Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hourly Chart */}
        <div className="lg:col-span-2 bg-surface-container border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-headline italic font-bold text-on-surface">Hourly Performance</h3>
              <p className="text-xs text-on-surface-variant/40 font-bold uppercase tracking-wider">Revenue across last 12 service hours</p>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-4">
            {stats?.hourlyData.map((data, i) => {
              const maxValue = Math.max(...stats.hourlyData.map(h => h.value), 100);
              const heightPercentage = (data.value / maxValue) * 100;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="relative w-full h-full flex items-end">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPercentage, 5)}%` }}
                      transition={{ delay: i * 0.05, duration: 0.8 }}
                      className={cn(
                        "w-full rounded-t-xl transition-all duration-300 group-hover:bg-primary",
                        i === stats.hourlyData.length - 1 ? "bg-primary shadow-[0_0_20px_rgba(229,196,135,0.3)]" : "bg-surface-container-highest"
                      )}
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-high border border-white/10 px-2 py-1 rounded-md text-[9px] font-bold text-primary whitespace-nowrap z-10 pointer-events-none">
                      {formatPrice(data.value, currencySymbol)}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant/20 uppercase">
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Status Side Panel */}
        <div className="bg-surface-container border border-white/5 rounded-[2.5rem] p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-headline italic font-bold text-on-surface">Active Pulse</h3>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-6 flex-1">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-white/5 flex items-center justify-center font-bold text-sm text-on-surface">
                      {activity.id}
                    </div>
                    <div>
                      <p className={cn("text-[10px] font-bold uppercase tracking-wider", activity.color)}>
                        {activity.status}
                      </p>
                      <p className="text-xs text-on-surface-variant/40 font-medium">Table Pulse</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-on-surface-variant/20">
                    {activity.time}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20">
                <ShoppingBag size={40} className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Quiet in the Room</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => router.push('/admin/orders')}
            className="mt-8 w-full py-4 rounded-2xl bg-surface-container-high border border-white/5 text-xs font-bold text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-2"
          >
            Manage Active Orders
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
