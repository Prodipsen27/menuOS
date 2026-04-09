"use client";

import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  MapPin, 
  Globe, 
  Lock, 
  ShieldCheck, 
  Palette, 
  BellRing, 
  Save,
  CreditCard,
  Building2,
  Mail,
  UserCircle2
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SettingsState {
  _id?: string;
  restaurantName: string;
  cuisineStyle: string;
  timezone: string;
  currencySymbol: string;
  adminEmail: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/admin/settings", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Fetch settings failed", err);
      }
    };

    fetchSettings();
  }, [router]);

  const setData = (data: SettingsState) => {
    setSettings(data);
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("http://localhost:5000/api/admin/settings", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        alert("Aura configuration synchronized successfully.");
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const TABS = [
    { id: "general", label: "General Info", icon: Building2 },
    { id: "security", label: "Security", icon: Lock },
    { id: "branding", label: "Aesthetic", icon: Palette },
    { id: "payments", label: "Billing", icon: CreditCard },
  ];

  if (!settings) return null;

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">System Orchestration</span>
          </div>
          <h1 className="text-4xl font-headline italic font-bold text-on-surface">Admin Configuration</h1>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-4 rounded-2xl bg-primary text-on-primary font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-3 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isSaving ? "Applying..." : "Committing Changes"}
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-64 space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm",
                activeTab === tab.id 
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                  : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </aside>

        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container border border-white/5 rounded-[2.5rem] p-10 editorial-shadow"
          >
            {activeTab === "general" && (
              <div className="space-y-12">
                <section className="space-y-8">
                  <h3 className="text-xl font-headline italic font-bold text-on-surface flex items-center gap-3">
                    <Building2 className="text-primary" size={20} />
                    Brand Identity
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 ml-1">Restaurant Name</label>
                      <input 
                        type="text" 
                        value={settings.restaurantName}
                        onChange={(e) => setSettings({...settings, restaurantName: e.target.value})}
                        className="w-full bg-surface-container-low border border-white/5 p-4 rounded-2xl focus:outline-none focus:border-primary/50 transition-colors font-medium text-sm text-on-surface"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 ml-1">Cuisine Style</label>
                      <select 
                        value={settings.cuisineStyle}
                        onChange={(e) => setSettings({...settings, cuisineStyle: e.target.value})}
                        className="w-full bg-surface-container-low border border-white/5 p-4 rounded-2xl focus:outline-none focus:border-primary/50 transition-colors font-medium text-sm text-on-surface appearance-none cursor-pointer"
                      >
                        <option>Contemporary Fusion</option>
                        <option>Fine Dining</option>
                        <option>Artisanal Lounge</option>
                        <option>Casual Bistro</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-8">
                  <h3 className="text-xl font-headline italic font-bold text-on-surface flex items-center gap-3">
                    <Globe className="text-primary" size={20} />
                    Localization & Currency
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 ml-1">System Currency Symbol</label>
                      <input 
                        type="text" 
                        value={settings.currencySymbol}
                        onChange={(e) => setSettings({...settings, currencySymbol: e.target.value})}
                        className="w-full bg-surface-container-low border border-white/5 p-4 rounded-2xl focus:outline-none focus:border-primary/50 transition-colors font-medium text-sm text-on-surface"
                        placeholder="e.g. ₹ or $"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 ml-1">Active Timezone</label>
                      <select 
                        value={settings.timezone}
                        onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                        className="w-full bg-surface-container-low border border-white/5 p-4 rounded-2xl focus:outline-none focus:border-primary/50 transition-colors font-medium text-sm text-on-surface cursor-pointer ring-0"
                      >
                        <option>IST (Asia/Kolkata)</option>
                        <option>GMT (Europe/London)</option>
                        <option>EST (America/New_York)</option>
                        <option>PST (America/Los_Angeles)</option>
                      </select>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-12">
                <section className="space-y-8">
                  <h3 className="text-xl font-headline italic font-bold text-on-surface flex items-center gap-3">
                    <ShieldCheck className="text-primary" size={20} />
                    Credential Architecture
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-2 max-w-md">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 ml-1">Administrative Email</label>
                      <input 
                        type="email"
                        value={settings.adminEmail}
                        onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                        className="w-full bg-surface-container-low border border-white/5 p-4 rounded-2xl focus:outline-none focus:border-primary/50 transition-colors font-medium text-sm text-on-surface"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4 bg-primary/5 border border-primary/10 p-6 rounded-3xl">
                   <div className="flex items-center gap-3 text-primary mb-2">
                     <ShieldCheck size={20} />
                     <h4 className="text-xs font-bold uppercase tracking-[0.2em]">Environment Hardening</h4>
                   </div>
                   <p className="text-xs text-on-surface-variant/60 leading-relaxed">
                     Core credentials like DB strings remain hard-coded in the environment layer for maximum security. Brand tokens are now dynamically orchestrated via this dashboard.
                   </p>
                </section>
              </div>
            )}

            {activeTab === "branding" || activeTab === "payments" ? (
              <div className="text-center py-20 space-y-6">
                <div className="w-20 h-20 bg-surface-container-low rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/5 text-primary/20">
                   {activeTab === "branding" ? <Palette size={40} /> : <CreditCard size={40} />}
                </div>
                <div>
                  <h3 className="text-xl font-headline italic font-bold text-on-surface mb-2">
                    {activeTab === "branding" ? "Visual Orchestra" : "Billing Gateway"}
                  </h3>
                  <p className="text-sm text-on-surface-variant/40 max-w-sm mx-auto">
                    {activeTab === "branding" 
                      ? "Advanced aesthetic configuration tools are currently being refined for future service releases."
                      : "Subscription and payroll management integrations are available in the Enterprise edition."
                    }
                  </p>
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
