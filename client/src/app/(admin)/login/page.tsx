"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/apiConfig";

export default function AdminLoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("admin_token", data.token);
        router.push("/admin/orders");
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(229,196,135,0.05),transparent)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-container border border-white/5 p-10 rounded-[3rem] editorial-shadow"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <Lock className="text-primary" size={28} />
          </div>
          <h1 className="text-3xl font-headline italic font-bold text-on-surface mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-on-surface-variant/40 text-[10px] uppercase tracking-[0.3em] font-bold">Secure Gateway • Aura Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <input
                type="email"
                placeholder="Manager Email"
                className="w-full bg-surface-container-low border border-white/5 rounded-2xl p-4 pl-12 text-sm text-on-surface focus:border-primary/50 focus:outline-none transition-all placeholder:text-on-surface-variant/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-primary transition-colors" size={18} />
            </div>

            <div className="relative group">
              <input
                type="password"
                placeholder="Access Key"
                className="w-full bg-surface-container-low border border-white/5 rounded-2xl p-4 pl-12 text-sm text-on-surface focus:border-primary/50 focus:outline-none transition-all placeholder:text-on-surface-variant/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-primary transition-colors" size={18} />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-rose-500 font-bold uppercase tracking-widest text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary p-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 hover:bg-primary-container transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (
              <>
                Initialize Session
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-on-surface-variant/20 font-medium uppercase tracking-widest">
          Aura Luxé Digital Systems • v1.0.4
        </p>
      </motion.div>
    </div>
  );
}
