"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Loader2,
  Star,
  ChevronRight,
  Filter
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn, formatPrice, CURRENCY_SYMBOL } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/apiConfig";


type Category = "cocktails" | "mains" | "desserts" | "starters";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

const CATEGORIES: Category[] = ["cocktails", "mains", "desserts", "starters"];

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [imageSource, setImageSource] = useState<"url" | "upload">("url");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "cocktails" as Category,
    image: "",
    isFeatured: false
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchMenuItems();
  }, [router]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/menu`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch menu items", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: "", description: "", price: "", category: "cocktails", image: "", isFeatured: false });
    setImageSource("url");
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      isFeatured: item.isFeatured
    });
    setImageSource(item.image.startsWith("data:") ? "upload" : "url");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("admin_token");
    const url = editingItem 
      ? `${API_URL}/menu/${editingItem.id}` 
      : `${API_URL}/menu`;
    const method = editingItem ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      });

      if (res.ok) {
        const savedItem = await res.json();
        if (editingItem) {
          setItems(prev => prev.map(i => i.id === savedItem.id ? savedItem : i));
        } else {
          setItems(prev => [...prev, savedItem]);
        }
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAvailability = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`${API_URL}/menu/${id}/toggle`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setItems(prev => prev.map(item => item.id === id ? updated : item));
      }
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  const toggleFeatured = async (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`${API_URL}/menu/${item.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ isFeatured: !item.isFeatured })
      });
      if (res.ok) {
        const updated = await res.json();
        setItems(prev => prev.map(i => i.id === item.id ? updated : i));
      }
    } catch (err) {
      console.error("Featured toggle failed", err);
    }
  };

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remove this item from the catalog?")) return;
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`${API_URL}/menu/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-on-surface-variant/40 mb-2">Artisanal Catalog</p>
          <h1 className="text-4xl font-headline italic font-bold text-on-surface">Menu Orchestration</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group flex-1 sm:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Search dishes..."
              className="bg-surface-container-low border border-white/5 rounded-2xl p-3 pl-12 text-xs text-on-surface focus:outline-none focus:border-primary/50 w-full sm:w-64 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button 
            onClick={openAddModal}
            className="bg-primary text-on-primary p-3 px-6 rounded-2xl flex items-center gap-3 shadow-xl shadow-primary/20 hover:bg-primary-container transition-all"
          >
            <Plus size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Add Item</span>
          </button>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
        <div className="flex bg-surface-container-low/50 border border-white/5 p-1 rounded-2xl">
          <button 
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all",
              selectedCategory === "all" ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant/40 hover:text-on-surface"
            )}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all",
                selectedCategory === cat ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant/40 hover:text-on-surface"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List View */}
      <div className="bg-surface-container/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/40 font-bold">
              <th className="px-8 py-6">Offering</th>
              <th className="px-6 py-6 hidden md:table-cell">Category</th>
              <th className="px-6 py-6">Price</th>
              <th className="px-6 py-6 text-center">Chef's Signature</th>
              <th className="px-6 py-6 text-center">Availability</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {filteredItems.map(item => (
                <motion.tr 
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high overflow-hidden border border-white/5 flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/10">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{item.name}</h4>
                        <p className="text-[9px] text-on-surface-variant/30 truncate max-w-[200px]">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 hidden md:table-cell">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">{item.category}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold tabular-nums text-on-surface">{formatPrice(item.price)}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={(e) => toggleFeatured(item, e)}
                      className={cn(
                        "p-2.5 rounded-xl transition-all border",
                        item.isFeatured 
                          ? "bg-primary/10 border-primary/20 text-primary shadow-lg shadow-primary/10" 
                          : "border-white/5 text-on-surface-variant/20 hover:text-on-surface-variant/40"
                      )}
                    >
                      <Star size={16} fill={item.isFeatured ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={(e) => toggleAvailability(item.id, e)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                        item.isAvailable 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      )}
                    >
                      {item.isAvailable ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 translate-x-2 group-hover:translate-x-0 transition-transform">
                      <button 
                        onClick={() => openEditModal(item)}
                        className="p-2.5 rounded-xl bg-surface-container-high/50 border border-white/5 text-on-surface-variant/30 hover:text-primary transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={(e) => deleteItem(item.id, e)}
                        className="p-2.5 rounded-xl bg-surface-container-high/50 border border-white/5 text-on-surface-variant/30 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        
        {loading && (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">Syncing with Registry...</p>
          </div>
        )}
        
        {!loading && items.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">Your culinary catalog is empty.</p>
          </div>
        )}
      </div>

      {/* Modal - Unified for Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-surface-container border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden p-8 sm:p-12"
            >
              <div className="mb-10 text-center">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-primary">
                  {editingItem ? <Edit3 size={32} /> : <Plus size={32} />}
                </div>
                <h2 className="text-3xl font-headline italic font-bold text-on-surface">
                  {editingItem ? "Refine Offering" : "New Offering"}
                </h2>
                <p className="text-[10px] text-on-surface-variant/30 uppercase tracking-[0.3em] mt-2 font-bold">
                  {editingItem ? `Editing ID: #${editingItem.id.slice(-4)}` : "Catalog Registration"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <input 
                      type="text"
                      placeholder="Dish Name"
                      className="w-full bg-surface-container-low border border-white/5 rounded-2xl p-4 text-xs focus:outline-none focus:border-primary/50 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                    
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/20" size={14} />
                        <input 
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          className="w-full bg-surface-container-low border border-white/5 rounded-2xl p-4 pl-10 text-xs focus:outline-none focus:border-primary/50 transition-all"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          required
                        />
                      </div>
                      <select 
                        className="flex-1 bg-surface-container-low border border-white/5 rounded-2xl p-4 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-primary/50 transition-all appearance-none text-on-surface"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Image Sources */}
                    <div className="space-y-3">
                      <div className="flex bg-surface-container-low/50 border border-white/5 p-1 rounded-2xl">
                        <button type="button" onClick={() => setImageSource("url")} className={cn("flex-1 py-1.5 rounded-xl text-[8px] font-bold uppercase tracking-widest transition-all", imageSource === "url" ? "bg-primary text-on-primary" : "text-on-surface-variant/30")}>URL</button>
                        <button type="button" onClick={() => setImageSource("upload")} className={cn("flex-1 py-1.5 rounded-xl text-[8px] font-bold uppercase tracking-widest transition-all", imageSource === "upload" ? "bg-primary text-on-primary" : "text-on-surface-variant/30")}>Upload</button>
                      </div>
                      {imageSource === "url" ? (
                        <div className="relative">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/20" size={14} />
                          <input 
                            type="text"
                            placeholder="Image URL"
                            className="w-full bg-surface-container-low border border-white/5 rounded-2xl p-4 pl-10 text-xs focus:outline-none focus:border-primary/50 transition-all"
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                          />
                        </div>
                      ) : (
                        <div className="relative h-12 bg-surface-container-low border border-dashed border-white/10 rounded-2xl flex items-center justify-center overflow-hidden border-primary/20">
                          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setFormData({...formData, image: reader.result as string});
                              reader.readAsDataURL(file);
                            }
                          }} />
                          {formData.image && <img src={formData.image} className="absolute inset-0 w-full h-full object-cover opacity-20" />}
                          <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/30">Select Photo</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-surface-container-low border border-white/5 rounded-2xl">
                      <input 
                        type="checkbox"
                        id="form-isFeatured"
                        className="w-4 h-4 accent-primary rounded cursor-pointer"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                      />
                      <label htmlFor="form-isFeatured" className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40 cursor-pointer select-none"> Chef's Signature</label>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea 
                      placeholder="Articulate the sensory details of this offering..."
                      className="w-full h-full min-h-[200px] bg-surface-container-low border border-white/5 rounded-3xl p-6 text-xs focus:outline-none focus:border-primary/50 transition-all resize-none leading-relaxed"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-on-surface-variant border border-white/5">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] bg-primary text-on-primary p-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 flex items-center justify-center gap-3">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (editingItem ? "Update Catalog" : "Register Item")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
