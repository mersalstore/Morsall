"use client";

import { Product } from "@/lib/mockData/products";

export default function ProductSpecs({ product }: { product: Product }) {
  if (!product.specs || Object.keys(product.specs).length === 0) return null;

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between border-b-4 border-border/30 pb-10">
        <h3 className="text-4xl font-black text-[#0F172A] tracking-tighter">المواصفات <span className="text-[#C5A021]">الفنية</span></h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">تفاصيل المنتج السيادية</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-2">
        {Object.entries(product.specs).map(([key, value], idx) => (
          <div 
            key={idx} 
            className="flex items-center justify-between py-5 border-b border-gray-100 hover:bg-gray-50/50 transition-colors px-4 rounded-xl"
          >
            <span className="text-sm font-black text-gray-400 uppercase tracking-tight">{key}</span>
            <span className="text-sm font-bold text-[#0F172A] text-left">{value}</span>
          </div>
        ))}
        
        {/* Additional Static Specs for Premium Look */}
        <div className="flex items-center justify-between py-5 border-b border-gray-100 px-4">
           <span className="text-sm font-black text-gray-400 uppercase tracking-tight">رقم الموديل</span>
           <span className="text-sm font-bold text-[#0F172A] text-left">{product.id.split('-').pop()?.toUpperCase()}</span>
        </div>
        <div className="flex items-center justify-between py-5 border-b border-gray-100 px-4">
           <span className="text-sm font-black text-gray-400 uppercase tracking-tight">توافر الضمان</span>
           <span className="text-sm font-bold text-green-600 text-left">ضمان مرسال لمدة عام</span>
        </div>
      </div>
    </div>
  );
}
