"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, Minus, Trash2, Star, Clock, Info, ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/features/cart/cartStore";
import { useSettingsStore } from "@/features/settings/settingsStore";
import { useTranslation } from "@/hooks/useTranslation";
import { API_URL } from "@/lib/apiConfig";
import { cn, formatPrice } from "@/lib/utils";
import MenuItemCard from "@/components/menu/MenuItemCard";
import CartPanel from "@/components/cart/CartPanel";
import { useLiveMenu } from "@/hooks/useLiveMenu";
import { useCallback } from "react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  isFeatured?: boolean;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { currencySymbol } = useSettingsStore();
  const { items: cartItems, addToCart, increaseQty, decreaseQty } = useCartStore();
  
  const [item, setItem] = useState<MenuItem | null>(null);
  const [recommended, setRecommended] = useState<MenuItem[]>([]);
  const [related, setRelated] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const cartItem = cartItems.find((i) => i.id === id);
  const quantity = cartItem?.quantity || 0;

  const fetchItem = useCallback(async (isInitial = false) => {
    if (!id) return;
    if (isInitial) setLoading(true);
    else setIsTransitioning(true);
    
    try {
      // Fetch current item and all menu items for recommendations
      const [itemRes, menuRes] = await Promise.all([
        fetch(`${API_URL}/menu/${id}`),
        fetch(`${API_URL}/menu`)
      ]);
      
      const data = await itemRes.json();
      const allData = await menuRes.json();
      
      if (data && data.id) {
        setItem(data);
        
        if (Array.isArray(allData)) {
          // Same category recommendations
          const othersInCat = allData.filter(i => i.id !== id && i.category === data.category && i.isAvailable);
          setRecommended(othersInCat.slice(0, 4));
          
          // Different category "related" items
          const othersDiffCat = allData.filter(i => i.id !== id && i.category !== data.category && i.isAvailable);
          // Shuffle or pick featured ones
          setRelated(othersDiffCat.sort(() => Math.random() - 0.5).slice(0, 2));
        }
      }
    } catch (err) {
      console.error("Failed to fetch product details", err);
    } finally {
      setLoading(false);
      setIsTransitioning(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      // If we don't have an item yet, it's initial
      fetchItem(!item);
    }
  }, [id]); // Only depend on id to avoid infinite loops if fetchItem changes

  useLiveMenu(() => fetchItem(false));

  if (loading && !item) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-primary"
        >
          <Clock size={40} />
        </motion.div>
        <span className="text-on-surface-variant font-medium animate-pulse">{t("preparing_details")}...</span>
      </div>
    );
  }

  if (!item && !loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center text-error mb-6">
          <Info size={40} />
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-2">{t('item_not_found')}</h1>
        <p className="text-on-surface-variant mb-8">{t('item_not_found_desc')}</p>
        <button
          onClick={() => router.push('/menu')}
          className="bg-primary text-on-primary px-8 py-3 rounded-2xl font-bold flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          {t('back_to_menu')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pb-32">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: isTransitioning ? 0.6 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {/* Product Image Hero */}
          <section className="relative h-[50vh] min-h-[400px] w-full">
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-black/40" />
            
            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => router.back()}
                className="w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white/90 hover:text-white transition-colors"
              >
                <ChevronLeft size={24} />
              </motion.button>
              
              {item.isFeatured && (
                <div className="px-4 py-2 bg-primary/90 backdrop-blur-xl rounded-2xl flex items-center gap-2 text-on-primary shadow-2xl">
                  <Star size={14} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('chef_pick')}</span>
                </div>
              )}
            </div>
          </section>
        </motion.div>
      </AnimatePresence>

      {/* Product Info Section */}
      <main className="relative -mt-20 z-10 px-6 max-w-[500px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${item.id}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: isTransitioning ? 0.7 : 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="bg-neutral-900 border border-white/5 rounded-[3rem] p-8 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="min-w-0">
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    className="text-[10px] uppercase tracking-[0.3em] font-black text-primary"
                  >
                    {item.category}
                  </motion.span>
                  <h1 className="text-3xl font-black text-on-surface leading-tight mt-1">{item.name}</h1>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-primary">
                    {formatPrice(item.price, currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <p className="text-on-surface-variant leading-relaxed font-medium text-lg opacity-80 italic">
                  {item.description || t('crafted_msg')}
                </p>
                
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent my-6" />
                
                {/* Traits/Specs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-[1.5rem] border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Star size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant/60 font-black uppercase">{t('quality')}</span>
                      <span className="text-xs font-bold text-on-surface">{t('premium')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-[1.5rem] border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Clock size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant/60 font-black uppercase">{t('prep_time')}</span>
                      <span className="text-xs font-bold text-on-surface">15-20 {t('mins')}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Cart Actions inside the card */}
                <div className="pt-4">
                  {quantity > 0 ? (
                    <div className="flex items-center gap-4 bg-white/[0.03] p-2 rounded-2xl border border-white/5">
                      <button 
                        onClick={() => decreaseQty(item.id)}
                        className="w-12 h-12 flex items-center justify-center bg-black/20 rounded-xl text-on-surface-variant hover:text-error transition-colors"
                      >
                        {quantity === 1 ? <Trash2 size={20} /> : <Minus size={20} />}
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant block leading-none mb-1">{t('in_cart')}</span>
                        <span className="text-2xl font-black text-on-surface tabular-nums">{quantity}</span>
                      </div>
                      <button 
                        onClick={() => increaseQty(item.id)}
                        className="w-12 h-12 flex items-center justify-center bg-primary rounded-xl text-on-primary shadow-lg shadow-primary/20"
                      >
                        <Plus size={24} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, category: item.category })}
                      disabled={!item.isAvailable}
                      className="w-full h-14 bg-primary text-on-primary rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      <Plus size={20} strokeWidth={3} />
                      {t('add_to_order')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* You May Also Like Section (Same Category) */}
            {recommended.length > 0 && (
              <section className="mt-16 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-black text-on-surface flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-primary rounded-full" />
                    {t('you_may_also_like')}
                  </h2>
                  <ArrowRight size={18} className="text-primary opacity-40" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {recommended.map((recommend) => (
                    <MenuItemCard 
                      key={recommend.id} 
                      item={recommend} 
                      variant="grid"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Related Items Section (Chef Selections / Popular Items) */}
            <section className="mt-16 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-on-surface flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-secondary/60 rounded-full" />
                  {t('related_items_title') || "Related Selections"}
                </h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 opacity-90">
                {/* Show diverse selections from different categories */}
                {related.map((rel) => (
                  <MenuItemCard 
                    key={`related-${rel.id}`} 
                    item={rel} 
                    variant="grid"
                  />
                ))}
              </div>
            </section>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-50 pointer-events-none">
        <div className="max-w-[500px] mx-auto flex items-center gap-4 bg-neutral-900 border border-white/10 rounded-[2.5rem] p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] pointer-events-auto">
          {quantity > 0 ? (
            <div className="flex-1 flex items-center justify-between bg-surface-container-highest/50 rounded-2xl p-2 h-16">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => decreaseQty(item.id)}
                className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center text-on-surface hover:bg-neutral-700 transition-colors"
              >
                {quantity === 1 ? <Trash2 size={20} className="text-error" /> : <Minus size={20} />}
              </motion.button>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{t('quantity')}</span>
                <span className="text-xl font-black text-on-surface tabular-nums">{quantity}</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => increaseQty(item.id)}
                className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/30"
              >
                <Plus size={24} strokeWidth={3} />
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, category: item.category })}
              disabled={!item.isAvailable}
              className="flex-1 h-16 bg-primary text-on-primary rounded-2xl p-4 flex items-center justify-between font-black text-lg disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-on-primary/10 rounded-xl flex items-center justify-center">
                  <Plus size={24} strokeWidth={3} />
                </div>
                <span>{t('add_to_order')}</span>
              </div>
              <span className="bg-black/20 px-3 py-1 rounded-lg text-sm">
                {formatPrice(item.price, currencySymbol)}
              </span>
            </motion.button>
          )}

          {/* Cart Shortcut - Only visible if there are items in cart */}
          {cartItems.length > 0 && (
            <div className="w-16 h-16">
              <CartPanel>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white relative group"
                >
                  <ShoppingBag size={28} />
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-on-primary text-[10px] font-black rounded-full flex items-center justify-center border-4 border-neutral-900 shadow-xl group-hover:scale-110 transition-transform">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                  </span>
                </motion.button>
              </CartPanel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
