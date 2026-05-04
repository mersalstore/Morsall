"use client"

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  
  const [categories, setCategories] = useState<any[]>([]);
  
  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  const handleCategoryChange = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentCategory === catId) {
      params.delete("category");
    } else {
      params.set("category", catId);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/shop');
  };

  return (
    <div className="flex flex-col gap-16 sticky top-40 h-fit pb-20">
      {/* 1. Category Filter - Refined to be more dominant */}
      <div className="space-y-12">
         <h4 className="font-black text-xs uppercase tracking-[0.4em] flex items-center justify-between border-b-4 border-[#1089A4]/10 pb-8 text-[#1089A4]">
            تصفح الأقـسـام <span className="material-symbols-rounded text-xl opacity-20">dashboard_customize</span>
         </h4>
         <div className="flex flex-col gap-6 px-1">
            {categories.map((cat, i) => {
               const isChecked = currentCategory === cat.id;
               return (
                 <label key={i} className="flex items-center gap-6 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                       <input 
                         type="checkbox" 
                         checked={isChecked}
                         onChange={() => handleCategoryChange(cat.id)}
                         className="peer w-8 h-8 border-4 border-border/50 rounded-2xl appearance-none checked:bg-[#1089A4] checked:border-[#1089A4] transition-all cursor-pointer shadow-sm hover:border-[#1089A4]/30" 
                       />
                       <span className="material-symbols-rounded absolute text-white text-xl opacity-0 peer-checked:opacity-100 transition-opacity scale-90">check</span>
                    </div>
                    <span className="text-base font-black text-[#021D24]/60 group-hover:text-[#1089A4] transition-colors tracking-tight">{cat.name}</span>
                 </label>
               );
            })}
         </div>
      </div>

      {/* Sidebar Footer Action - Enlarged for Premium Feel */}
      <div className="space-y-6 pt-12 border-t border-border/10">
        <button onClick={() => window.location.reload()} className="w-full bg-[#021D24] text-white py-8 rounded-[3rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-black/15 hover:bg-[#1089A4] hover:shadow-[#1089A4]/40 hover:-translate-y-2 transition-all active:scale-95 border-b-[10px] border-white/5">
           تحديث القائمة الآن
        </button>
        <button onClick={clearFilters} className="w-full text-center text-[10px] font-black text-[#021D24]/20 hover:text-red-500 transition-colors uppercase tracking-[0.3em] flex items-center justify-center gap-4">
           <span className="material-symbols-rounded text-lg">restart_alt</span> إعادة تعيين الفرز
        </button>
      </div>
    </div>
  );
}
