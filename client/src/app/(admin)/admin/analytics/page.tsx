"use client";

import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  ShoppingBag, 
  DollarSign,
  ArrowRight,
  ChevronRight,
  Star
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, cn } from "@/lib/utils";
import { useSettingsStore } from "@/features/settings/settingsStore";

interface AnalyticsData {
  dailyRevenue: { label: string; value: number }[];
  topItems: { name: string; count: number }[];
  categoryDistribution: { name: string; value: number }[];
  totalOrders: number;
  avgOrderValue: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { currencySymbol } = useSettingsStore();
  const router = useRouter();

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/admin/analytics", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        } else if (res.status === 401) {
          router.push("/login");
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/40 animate-pulse">Analyzing Service Patterns...</p>
      </div>
    );
  }

  // Calculate max for scale
  const maxRevenue = Math.max(...(data?.dailyRevenue.map(d => d.value) || []), 100);
  const maxCategory = Math.max(...(data?.categoryDistribution.map(c => c.value) || []), 100);

  return (
    <div className="space-y-10">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Strategic Insights</span>
        </div>
        <h1 className="text-4xl font-headline italic font-bold text-on-surface">Intelligence Console</h1>
      </header>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 mb-1">Service Velocity</p>
            <h3 className="text-3xl font-headline italic font-bold text-on-surface">{data?.totalOrders}</h3>
            <p className="text-xs text-on-surface-variant/60">Total volume recorded</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative z-10">
            <ShoppingBag size={28} />
          </div>
        </div>

        <div className="bg-surface-container border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 mb-1">Average Ticket</p>
            <h3 className="text-3xl font-headline italic font-bold text-on-surface">{formatPrice(data?.avgOrderValue || 0, currencySymbol)}</h3>
            <p className="text-xs text-on-surface-variant/60">Per guest interaction</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 relative z-10">
            <DollarSign size={28} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Revenue Matrix */}
        <div className="lg:col-span-8 bg-surface-container border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-headline italic font-bold text-on-surface">Weekly Treasury</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              <TrendingUp size={14} />
              Positive Growth
            </div>
          </div>
          
          <div className="h-72 flex items-end justify-between gap-4">
            {data?.dailyRevenue.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="relative w-full h-full flex items-end">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.value / maxRevenue) * 100 || 5}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className={cn(
                      "w-full rounded-t-xl transition-all duration-500 group-hover:bg-primary",
                      i === 6 ? "bg-primary" : "bg-surface-container-highest"
                    )}
                  />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-high border border-white/10 px-2 py-1 rounded-md text-[9px] font-bold text-primary whitespace-nowrap z-10">
                    {formatPrice(day.value, currencySymbol)}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant/20 uppercase">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Assets */}
        <div className="lg:col-span-4 bg-surface-container border border-white/5 rounded-[2.5rem] p-8">
          <h3 className="text-xl font-headline italic font-bold text-on-surface mb-8">High Performance</h3>
          
          <div className="space-y-6">
            {data?.topItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-white/5 flex items-center justify-center font-bold text-xs text-primary">
                  #{i+1}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-on-surface">{item.name}</p>
                  <p className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest">{item.count} orders</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-on-surface-variant/20">
                  <Star size={12} />
                </div>
              </div>
            ))}
          </div>

          <button className="mt-8 w-full py-4 rounded-2xl bg-surface-container-high border border-white/5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center gap-2">
            View Inventory Performance
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Category Performance Matrix */}
      <div className="bg-surface-container border border-white/5 rounded-[2.5rem] p-8">
        <h3 className="text-xl font-headline italic font-bold text-on-surface mb-8">Categorical Contribution</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.categoryDistribution.map((cat, i) => (
            <div key={i} className="p-6 rounded-3xl bg-surface-container-low border border-white/5 group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                  <PieChartIcon size={18} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-full">
                  {Math.round((cat.value / maxCategory) * 100)}%
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 mb-1">{cat.name}</p>
              <h4 className="text-xl font-headline italic font-bold text-on-surface">{formatPrice(cat.value, currencySymbol)}</h4>
              <div className="mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(cat.value / maxCategory) * 100}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
