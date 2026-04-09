"use client";

import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Plus, Trash2, QrCode as QrIcon, MapPin, ExternalLink, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

export default function QRManagement() {
  const { t } = useTranslation();
  const [tables, setTables] = useState<{ id: string; name: string }[]>([]);
  const [newTableName, setNewTableName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("admin_tables");
    if (saved) {
      setTables(JSON.parse(saved));
    } else {
      setTables([
        { id: "1", name: "T1" },
        { id: "2", name: "T2" },
        { id: "3", name: "T3" },
        { id: "4", name: "T4" },
        { id: "5", name: "T5" },
        { id: "6", name: "T6" },
        { id: "7", name: "T7" },
        { id: "8", name: "T8" },
        { id: "9", name: "T9" },
        { id: "10", name: "T10" },
      ]);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("admin_tables", JSON.stringify(tables));
    }
  }, [tables, mounted]);

  const addTable = () => {
    if (!newTableName) return;
    // Check if already exists
    if (tables.find(t => t.name.toUpperCase() === newTableName.toUpperCase())) {
      alert("Table already exists");
      return;
    }
    setTables([...tables, { id: Date.now().toString(), name: newTableName.toUpperCase() }]);
    setNewTableName("");
  };

  const removeTable = (id: string) => {
    if (confirm("Are you sure you want to remove this table?")) {
      setTables(tables.filter((t) => t.id !== id));
    }
  };

  const downloadQR = (tableName: string) => {
    const canvas = document.getElementById(`qr-${tableName}`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR_Table_${tableName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getQRUrl = (tableName: string) => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${siteUrl}/menu?table=${tableName}`;
  };

  if (!mounted) return null;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline italic font-bold text-on-surface">QR Table Management</h1>
          <p className="text-on-surface-variant text-sm mt-1">Generate and manage QR codes for your restaurant tables.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <input 
              type="text"
              placeholder="Table Name (e.g. T10)"
              className="bg-surface-container-high border border-white/5 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-48"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTable()}
            />
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
          </div>
          <button 
            onClick={addTable}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all outline-none"
          >
            <Plus size={18} />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {tables.map((table) => (
            <motion.div
              key={table.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface-container-low border border-white/5 rounded-3xl p-6 group hover:border-primary/30 transition-all duration-300 shadow-xl shadow-black/20"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <QrIcon size={20} />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{table.name}</h3>
                </div>
                <button 
                  onClick={() => removeTable(table.id)}
                  className="p-2 text-on-surface-variant/30 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* QR Preview Area */}
              <div className="relative aspect-square bg-white rounded-2xl p-4 flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:ring-primary/50 transition-all shadow-inner overflow-hidden">
                <QRCodeCanvas
                  id={`qr-${table.name}`}
                  value={getQRUrl(table.name)}
                  size={256}
                  level="H"
                  includeMargin={false}
                  className="w-full h-full"
                />
                
                {/* Overlay link icon */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all pointer-events-none flex items-center justify-center">
                  <ExternalLink size={24} className="text-primary opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100" />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-50">Points to:</p>
                <div className="bg-surface-container-high/50 rounded-lg p-2 text-[10px] font-mono text-primary truncate border border-white/5">
                  {getQRUrl(table.name)}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => downloadQR(table.name)}
                    className="flex-1 bg-surface-container-high hover:bg-primary hover:text-on-primary py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="w-12 bg-surface-container-high hover:bg-surface-container-lowest py-2.5 rounded-xl text-xs flex items-center justify-center border border-white/5 transition-all text-on-surface-variant"
                  >
                    <Printer size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {tables.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant/20">
            <QrIcon size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold">No Tables Configured</h3>
            <p className="text-on-surface-variant max-w-xs mx-auto text-sm mt-1">Add your first table above to generate its ordering QR code.</p>
          </div>
        </div>
      )}
    </div>
  );
}
