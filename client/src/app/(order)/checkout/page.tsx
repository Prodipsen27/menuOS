"use client";

import { useCartStore } from "@/features/cart/cartStore";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, CreditCard, MapPin, Phone, User, CheckCircle2, Save } from "lucide-react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { API_URL } from "@/lib/apiConfig";
import { useTranslation } from "@/hooks/useTranslation";
import { useDialogStore } from "@/features/ui/dialogStore";


const CUSTOMER_KEY = "guest_profile";

interface GuestProfile {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

function loadProfile(): GuestProfile {
  if (typeof window === "undefined") return { name: "", phone: "", email: "", notes: "" };
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    if (!raw) return { name: "", phone: "", email: "", notes: "" };
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || "",
      phone: parsed.phone || "",
      email: parsed.email || "",
      notes: parsed.notes || ""
    };
  } catch {
    return { name: "", phone: "", email: "", notes: "" };
  }
}

function saveProfile(profile: GuestProfile) {
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(profile));
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { items, getTotal, clearCart, tableNumber } = useCartStore();
  const showDialog = useDialogStore((state) => state.show);
  const [isOrdered, setIsOrdered] = useState<string | false>(false);
  const [isSaved, setIsSaved] = useState(false);

  const [form, setForm] = useState<GuestProfile>({ name: "", phone: "", email: "", notes: "" });

  // Pre-fill from localStorage on mount
  useEffect(() => {
    const saved = loadProfile();
    if (saved.name || saved.phone || saved.email) {
      setForm(saved);
    }
  }, []);

  const updateField = (field: keyof GuestProfile, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    saveProfile(updated); // Auto-save on every keystroke
  };

  const handleSaveProfile = () => {
    saveProfile(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleOrder = async () => {
    if (!form.name || !form.phone) {
      showDialog({
        title: t('provide_info'),
        message: t('provide_info_desc') || "Please enter your name and contact details to proceed.",
        type: 'warning'
      });
      return;
    }

    saveProfile(form); // Persist before placing order

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.notes,
          items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, category: i.category })),
          total: getTotal(),
          table: tableNumber || "T1",
        }),
      });

      if (!response.ok) throw new Error("Failed to place order");

      const order = await response.json();
      // Persist active order so Orders tab can resume tracking
      localStorage.setItem("active_order_id", order.id);
      
      // REQUIREMENT: Clear the cart after placing the order
      clearCart();
      
      setIsOrdered(order.id);
    } catch (error) {
      console.error(error);
      showDialog({
        type: "error",
        message: t('error_msg')
      });
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-surface-container p-12 rounded-[3rem] editorial-shadow border border-primary/20"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-primary" size={48} />
          </div>
          <h1 className="text-4xl font-headline italic font-bold text-on-surface mb-2">{t('order_confirmed')}</h1>
          <p className="text-on-surface-variant font-body mb-8">{t('preparing_selection')}</p>
          <Link href={`/tracking?id=${isOrdered}`}>
            <button className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-primary-container transition-colors">
              {t('track_order')}
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface pb-32">
      {/* Header */}
      <header className="px-6 pt-12 pb-8 flex items-center gap-4">
        <Link href="/menu" className="p-2 -ml-2 text-on-surface-variant hover:text-on-surface">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-3xl font-headline italic font-bold">{t('secure_checkout')}</h1>
      </header>

      <main className="px-6 space-y-8 max-w-[500px] mx-auto">
        {/* Contact Info Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <User size={18} className="text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {t('guest_details')}
                {tableNumber && <span className="ml-2 text-primary font-bold">({tableNumber})</span>}
              </h2>
            </div>
            {/* Remembered indicator */}
            {(form.name || form.phone) && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1"
              >
                <Save size={10} />
                {t('remembered')}
              </motion.span>
            )}
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                placeholder={t('full_name')}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 pl-12 focus:border-primary/50 focus:outline-none transition-all font-body text-sm"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
            </div>

            <div className="relative">
              <input
                placeholder={t('phone_number')}
                type="tel"
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 pl-12 focus:border-primary/50 focus:outline-none transition-all font-body text-sm"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
            </div>

            <div className="relative">
              <input
                placeholder={t('email_id') || "Email Address (Optional)"}
                type="email"
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 pl-12 focus:border-primary/50 focus:outline-none transition-all font-body text-sm"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
            </div>

            <div className="relative">
              <textarea
                placeholder={t('special_instructions')}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 pl-12 focus:border-primary/50 focus:outline-none transition-all font-body text-sm min-h-[100px]"
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
              <MapPin className="absolute left-4 top-5 text-on-surface-variant/40" size={18} />
            </div>
          </div>


          {/* Save Profile Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveProfile}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-xs font-bold uppercase tracking-widest transition-all",
              isSaved
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:border-primary/30 hover:text-primary"
            )}
          >
            <Save size={14} />
            {isSaved ? t('profile_saved') : t('remember_details')}
          </motion.button>
        </section>

        {/* Order Summary Section */}
        <section className="bg-surface-container rounded-[2rem] p-6 editorial-shadow">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard size={18} className="text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t('your_selection')}</h2>
          </div>

          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm font-body">
                <div className="flex gap-2">
                  <span className="text-primary font-bold">x{item.quantity}</span>
                  <span className="text-on-surface">{item.name}</span>
                </div>
                <span className="text-on-surface-variant">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-outline-variant/10 pt-4 flex justify-between items-end">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t('total_amount')}</span>
            <span className="text-3xl font-headline font-bold text-primary">{formatPrice(getTotal())}</span>
          </div>
        </section>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOrder}
          disabled={items.length === 0}
          className={cn(
            "w-full bg-primary text-on-primary p-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 transition-all",
            items.length === 0 && "opacity-50 grayscale cursor-not-allowed"
          )}
        >
          {t('confirm_place_order')}
          <CheckCircle2 size={16} />
        </motion.button>
      </main>
    </div>
  );
}