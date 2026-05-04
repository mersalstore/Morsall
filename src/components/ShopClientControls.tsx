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
      <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          {query ? (
            <><strong className="text-[#021D24]">{resultCount}</strong> نتيجة لـ &quot;<strong>{query}</strong>&quot;</>
          ) : (
            <><strong className="text-[#021D24]">{resultCount}</strong> منتج متوفر</>
          )}
        </p>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded text-xs font-bold text-gray-700 hover:bg-gray-100"
          >
            <span className="material-symbols-rounded text-sm">tune</span>
            فلاتر
          </button>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-400">ترتيب حسب:</label>
            <select 
              value={initialSort}
              onChange={handleSortChange}
              className="border border-gray-300 rounded px-2 py-1 text-xs font-bold outline-none focus:border-[#1089A4] bg-white cursor-pointer"
            >
              <option value="">الأكثر مبيعاً</option>
              <option value="new">الأحدث</option>
              <option value="price_asc">السعر: الأقل أولاً</option>
              <option value="price_desc">السعر: الأعلى أولاً</option>
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
              className="absolute inset-0 bg-[#021D24]/60 backdrop-blur-sm"
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
                <h3 className="font-black text-lg text-[#021D24]">تصفية النتائج</h3>
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
