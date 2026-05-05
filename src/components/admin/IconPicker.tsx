"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const POPULAR_ICONS = [
  "devices", "smartphone", "laptop", "watch", "tv", "headphones",
  "checkroom", "styler", "shopping_bag", "laundry",
  "kitchen", "chair", "bed", "home", "light",
  "face", "spa", "content_cut", "medical_services",
  "sports_esports", "sports_soccer", "fitness_center",
  "local_shipping", "store", "shopping_cart", "sell", "discount",
  "restaurant", "fastfood", "local_cafe", "cake",
  "auto_stories", "school", "menu_book",
  "toys", "child_care", "baby_changing_station",
  "construction", "handyman", "electrical_services",
  "pets", "eco", "grass",
  "diamond", "watch_later", "wallet"
];

interface IconPickerProps {
  onSelect: (icon: string) => void;
  onClose: () => void;
}

export default function IconPicker({ onSelect, onClose }: IconPickerProps) {
  const [search, setSearch] = useState("");
  
  const filteredIcons = POPULAR_ICONS.filter(icon => 
    icon.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-3xl flex flex-col max-h-[80vh] overflow-hidden"
      >
        <div className="p-8 border-b flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-black text-[#021D24]">اختر أيقونة</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Select from Material Icons</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 bg-gray-50/50 shrink-0">
           <div className="relative">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                 autoFocus
                 placeholder="ابحث عن أيقونة (بالإنجليزي)..." 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="w-full bg-white border border-gray-100 rounded-2xl pr-12 pl-6 py-4 text-sm font-bold shadow-sm outline-none focus:border-[#1089A4] transition-all"
              />
           </div>
        </div>

        <div className="flex-grow overflow-y-auto p-8 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
           {filteredIcons.map(icon => (
             <button
                key={icon}
                onClick={() => { onSelect(icon); onClose(); }}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-[#1089A4] hover:text-white transition-all text-gray-400"
             >
                <span className="material-symbols-rounded text-2xl group-hover:scale-125 transition-transform">{icon}</span>
                <span className="text-[8px] font-black uppercase truncate w-full text-center">{icon.replace('_', ' ')}</span>
             </button>
           ))}
           {filteredIcons.length === 0 && (
             <div className="col-span-full py-10 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">
                لا توجد نتائج للبحث
             </div>
           )}
        </div>
      </motion.div>
    </div>
  );
}
