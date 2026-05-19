"use client"

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const COLORS = [
  { name: "أسود", value: "أسود", hex: "#000000" },
  { name: "أبيض", value: "أبيض", hex: "#ffffff" },
  { name: "أحمر", value: "أحمر", hex: "#ef4444" },
  { name: "أزرق", value: "أزرق", hex: "#3b82f6" },
  { name: "ذهبي", value: "ذهبي", hex: "#C5A021" },
];

const SIZES = ["S", "M", "L", "XL", "128GB", "256GB"];

export default function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentAttributes = searchParams.get("attributes") ? searchParams.get("attributes")?.split(",") : [];
  
  const [categories, setCategories] = useState<any[]>([]);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  
  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/shop?${params.toString()}`);
  };

  const handleAttributeToggle = (attr: string) => {
    let attrs = [...(currentAttributes || [])];
    if (attrs.includes(attr)) {
      attrs = attrs.filter(a => a !== attr);
    } else {
      attrs.push(attr);
    }
    updateFilters("attributes", attrs.length > 0 ? attrs.join(",") : null);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    router.push(`/shop?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    router.push('/shop');
  };

  return (
    <div className="flex flex-col gap-10 sticky top-40 h-fit pb-20">
      {/* Category Filter */}
      <div className="space-y-6">
         <h4 className="font-black text-xs uppercase tracking-[0.2em] border-b-2 border-[#C5A021]/10 pb-4 text-[#C5A021]">
            الأقـسـام
         </h4>
         <div className="flex flex-col gap-4">
            {categories.map((cat, i) => {
               const isChecked = currentCategory === cat.id;
               return (
                 <label key={i} className="flex items-center gap-4 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={() => updateFilters("category", isChecked ? null : cat.id)}
                      className="w-5 h-5 rounded accent-[#C5A021]" 
                    />
                    <span className={cn("text-sm font-black transition-colors", isChecked ? "text-[#C5A021]" : "text-[#0F172A]/70 group-hover:text-[#C5A021]")}>{cat.name}</span>
                 </label>
               );
            })}
         </div>
      </div>

      {/* Price Slider */}
      <div className="space-y-6">
         <h4 className="font-black text-xs uppercase tracking-[0.2em] border-b-2 border-[#C5A021]/10 pb-4 text-[#C5A021]">
            نطاق السعر
         </h4>
         <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="من" 
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#C5A021]"
              />
              <span className="text-slate-400">-</span>
              <input 
                type="number" 
                placeholder="إلى" 
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#C5A021]"
              />
            </div>
            <button onClick={applyPriceFilter} className="w-full bg-[#0F172A] text-white py-2 rounded-xl text-xs font-black hover:bg-[#C5A021] transition-colors">
              تطبيق السعر
            </button>
         </div>
      </div>

      {/* Color Visual Attributes */}
      <div className="space-y-6">
         <h4 className="font-black text-xs uppercase tracking-[0.2em] border-b-2 border-[#C5A021]/10 pb-4 text-[#C5A021]">
            اللون
         </h4>
         <div className="flex flex-wrap gap-3">
            {COLORS.map((c) => {
               const isActive = currentAttributes?.includes(c.value);
               return (
                 <button
                   key={c.value}
                   onClick={() => handleAttributeToggle(c.value)}
                   title={c.name}
                   className={cn(
                     "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                     isActive ? "border-[#C5A021] scale-110 shadow-md" : "border-slate-200 hover:scale-105"
                   )}
                   style={{ backgroundColor: c.hex }}
                 >
                   {isActive && <span className={cn("material-symbols-rounded text-[14px]", c.hex === "#ffffff" ? "text-black" : "text-white")}>check</span>}
                 </button>
               )
            })}
         </div>
      </div>

      {/* Size/Storage Visual Attributes */}
      <div className="space-y-6">
         <h4 className="font-black text-xs uppercase tracking-[0.2em] border-b-2 border-[#C5A021]/10 pb-4 text-[#C5A021]">
            المقاس / السعة
         </h4>
         <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => {
               const isActive = currentAttributes?.includes(s);
               return (
                 <button
                   key={s}
                   onClick={() => handleAttributeToggle(s)}
                   className={cn(
                     "px-3 py-1.5 rounded-xl border text-xs font-black transition-all",
                     isActive ? "bg-[#C5A021] text-white border-[#C5A021] shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-[#C5A021]"
                   )}
                 >
                   {s}
                 </button>
               )
            })}
         </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
        <button onClick={clearFilters} className="w-full text-center text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.3em] flex items-center justify-center gap-2">
           <span className="material-symbols-rounded text-lg">restart_alt</span> مسح جميع الفلاتر
        </button>
      </div>
    </div>
  );
}
