"use client"

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const FALLBACK_BRANDS = ["Vixcell", "Mersal Official", "Samsung", "Apple"];

export default function ShopFilters({ brands = [] }: { brands?: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentBrands = (searchParams.get("brand") || "").split(",").map(b => b.trim()).filter(Boolean);
  const currentRating = searchParams.get("minRating");
  const nextDay = searchParams.get("nextDay") === "1";
  const includeOutOfStock = searchParams.get("includeOutOfStock") === "1";

  const [categories, setCategories] = useState<any[]>([]);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  const brandList = brands.length ? brands : FALLBACK_BRANDS;
  const hasActiveFilters = !!(
    currentCategory || currentMinPrice || currentMaxPrice ||
    currentBrands.length || currentRating || nextDay || includeOutOfStock ||
    searchParams.get("sort")
  );

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

  const toggleBrand = (brand: string) => {
    const set = new Set(currentBrands);
    if (set.has(brand)) set.delete(brand);
    else set.add(brand);
    updateFilters("brand", Array.from(set).join(",") || null);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    router.push(`/shop?${params.toString()}`);
  };

  const handlePriceRange = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("minPrice", min); else params.delete("minPrice");
    if (max) params.set("maxPrice", max); else params.delete("maxPrice");
    router.push(`/shop?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    router.push('/shop');
  };

  return (
    <div className="flex flex-col gap-5 text-[#0F172A] text-sm pb-10">

      {/* ── ترتيب المنتجات ── */}
      <div className="space-y-2">
        <h4 className="font-bold mb-2 text-[#0F172A]">ترتيب المنتجات</h4>
        <div className="flex flex-col gap-2">
          {[
            { value: "",          label: "مميز (الافتراضي)" },
            { value: "new",       label: "الأحدث وصولاً" },
            { value: "price_asc", label: "السعر: من الأقل" },
            { value: "price_desc",label: "السعر: من الأعلى" },
            { value: "rated",     label: "الأعلى تقييماً" },
          ].map(opt => {
            const currentSort = searchParams.get("sort") || "";
            const isActive = currentSort === opt.value;
            return (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="sort"
                  checked={isActive}
                  onChange={() => updateFilters("sort", opt.value || null)}
                  className="w-4 h-4 accent-[#e77600] cursor-pointer"
                />
                <span className={cn("text-sm transition-colors group-hover:text-[#C7511F]", isActive ? "font-bold text-[#e77600]" : "text-gray-800")}>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      {/* Delivery */}
      <div className="space-y-2">
         <h4 className="font-bold mb-2 text-[#0F172A]">الشحن والتوصيل</h4>
         <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={nextDay}
              onChange={() => updateFilters("nextDay", nextDay ? null : "1")}
              className="w-4 h-4 rounded border-gray-400 accent-[#e77600] cursor-pointer"
            />
            <span className="text-sm group-hover:text-[#C7511F] transition-colors">احصل عليه غداً</span>
         </label>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
         <h4 className="font-bold mb-2 text-[#0F172A]">القسم</h4>
         <div className="flex flex-col gap-2">
            {categories.map((cat, i) => {
               const isChecked = currentCategory === cat.id;
               return (
                 <label key={i} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => updateFilters("category", isChecked ? null : cat.id)}
                      className="w-4 h-4 rounded border-gray-400 accent-[#e77600] cursor-pointer"
                    />
                    <span className={cn("text-sm transition-colors group-hover:text-[#C7511F]", isChecked ? "font-bold text-[#e77600]" : "text-gray-800")}>{cat.name}</span>
                 </label>
               );
            })}
         </div>
      </div>

      {/* Customer Reviews */}
      <div className="space-y-2">
         <h4 className="font-bold mb-2 text-[#0F172A]">تقييم العملاء</h4>
         <div className="flex flex-col gap-2">
           {[4, 3, 2, 1].map(stars => {
             const isActive = currentRating === String(stars);
             return (
               <button
                 key={stars}
                 onClick={() => updateFilters("minRating", isActive ? null : String(stars))}
                 className={cn(
                   "flex items-center gap-1 cursor-pointer group transition-colors text-right",
                   isActive ? "font-bold" : "hover:text-[#C7511F]"
                 )}
               >
                 <div className="flex text-[#FFA41C]">
                   {[1,2,3,4,5].map(i => (
                     <span key={i} className={`text-lg ${i <= stars ? "text-[#FFA41C]" : "text-gray-300"}`}>★</span>
                   ))}
                 </div>
                 <span className={cn("text-xs group-hover:text-[#C7511F]", isActive ? "text-[#e77600]" : "text-gray-800")}>وأكثر</span>
               </button>
             );
           })}
         </div>
      </div>

      {/* Brands */}
      <div className="space-y-2">
         <h4 className="font-bold mb-2 text-[#0F172A]">العلامة التجارية / البائع</h4>
         <div className="flex flex-col gap-2">
            {brandList.map(brand => {
               const isChecked = currentBrands.includes(brand);
               return (
                 <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleBrand(brand)}
                      className="w-4 h-4 rounded border-gray-400 accent-[#e77600] cursor-pointer"
                    />
                    <span className={cn("text-sm transition-colors group-hover:text-[#C7511F]", isChecked ? "font-bold text-[#e77600]" : "text-gray-800")}>{brand}</span>
                 </label>
               );
            })}
         </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
         <h4 className="font-bold mb-2 text-[#0F172A]">السعر</h4>
         <div className="flex flex-col gap-1.5 mb-3">
            <button onClick={() => handlePriceRange("", "5000")} className="text-right text-sm text-gray-800 hover:text-[#C7511F]">أقل من 5,000 ج.س</button>
            <button onClick={() => handlePriceRange("5000", "15000")} className="text-right text-sm text-gray-800 hover:text-[#C7511F]">5,000 ج.س إلى 15,000 ج.س</button>
            <button onClick={() => handlePriceRange("15000", "50000")} className="text-right text-sm text-gray-800 hover:text-[#C7511F]">15,000 ج.س إلى 50,000 ج.س</button>
            <button onClick={() => handlePriceRange("50000", "")} className="text-right text-sm text-gray-800 hover:text-[#C7511F]">50,000 ج.س وأكثر</button>
         </div>
         <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="الحد الأدنى"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="w-[85px] border border-gray-400 rounded px-2 py-1 text-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow placeholder:text-xs"
            />
            <span className="text-gray-500 font-bold">-</span>
            <input
              type="number"
              placeholder="الحد الأقصى"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="w-[85px] border border-gray-400 rounded px-2 py-1 text-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow placeholder:text-xs"
            />
            <button onClick={applyPriceFilter} className="bg-white border border-gray-300 shadow-sm text-sm px-3 py-1 rounded-md hover:bg-gray-50 transition-colors font-medium">
              انتقال
            </button>
         </div>
      </div>

      {/* Availability */}
      <div className="space-y-2 mt-2 border-t border-gray-200 pt-4">
         <h4 className="font-bold mb-2 text-[#0F172A]">التوفر</h4>
         <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={includeOutOfStock}
              onChange={() => updateFilters("includeOutOfStock", includeOutOfStock ? null : "1")}
              className="w-4 h-4 rounded border-gray-400 accent-[#e77600] cursor-pointer"
            />
            <span className="text-sm text-gray-800 group-hover:text-[#C7511F] transition-colors">تضمين غير المتوفر</span>
         </label>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button onClick={clearFilters} className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline mt-4 text-right font-medium flex items-center gap-1">
           <span className="material-symbols-rounded text-[16px]">clear</span>
           مسح جميع الفلاتر
        </button>
      )}
    </div>
  );
}
