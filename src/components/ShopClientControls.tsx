"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShopFilters from "./ShopFilters";

interface ShopClientControlsProps {
  resultCount: number;
  query: string;
  initialSort: string;
}

export default function ShopClientControls({ resultCount, query, initialSort }: ShopClientControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("sort", e.target.value);
    } else {
      params.delete("sort");
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <>
      <div className="bg-white border border-gray-300 rounded shadow-sm p-2 px-3 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-gray-800">
          {query ? (
            <>1-{resultCount} من أكثر من 2,000 نتيجة لـ <span className="text-[#c60] font-bold">&quot;{query}&quot;</span></>
          ) : (
            <>1-{resultCount} من أكثر من 2,000 نتيجة</>
          )}
        </p>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 bg-gray-100 border border-gray-300 px-3 py-1 rounded-md text-sm font-bold text-gray-800 hover:bg-gray-200"
          >
            <span className="material-symbols-rounded text-sm">tune</span>
            فلاتر
          </button>
          <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-200 transition-colors">
            <span className="text-sm text-gray-700">الترتيب حسب:</span>
            <select 
              value={initialSort}
              onChange={handleSortChange}
              className="bg-transparent text-sm text-gray-900 outline-none cursor-pointer font-bold"
            >
              <option value="">متميز</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
              <option value="rated">متوسط تقييم العملاء</option>
              <option value="new">وصلنا حديثاً</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-[500] lg:hidden flex">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMobileFiltersOpen(false)}
              className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col z-10"
              dir="rtl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-black text-lg text-[#0F172A]">تصفية النتائج</h3>
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-rounded text-sm">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <ShopFilters />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
