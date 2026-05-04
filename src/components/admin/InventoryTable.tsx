"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  products: any[];
  onEdit: (product: any) => void;
  onAdd: () => void;
  classes: any;
}

export default function InventoryTable({ products, onEdit, onAdd, classes }: InventoryTableProps) {
  const [search, setSearch] = useState("");

  const filtered = products.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn(classes.card, "border-0 shadow-none")}>
      <div className="p-10 flex flex-wrap justify-between items-center gap-6 bg-white/50 border-b border-gray-100/50">
        <div className="relative flex-grow max-w-xl">
          <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-rounded text-[#1089A4]">search</span>
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="ابحث عن منتج بالاسم، الكود، أو القسم..." 
            className={cn(classes.input, "pr-16")} 
          />
        </div>
        <button onClick={onAdd} className={cn(classes.btnPrimary, "flex items-center gap-3")}>
          <span className="material-symbols-rounded text-xl">add_box</span>
          إضافة منتج للنظام
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[800px]">
          <thead>
            <tr className={classes.tableHeader}>
              <th className="px-8 py-6 rounded-tr-[2.5rem]">بيانات المنتج الرئيسي</th>
              <th className="px-8 py-6">الرمز البريدي (SKU)</th>
              <th className="px-8 py-6">قيمة البيع</th>
              <th className="px-8 py-6 text-center">المخزون المتاح</th>
              <th className="px-8 py-6 text-center">حالة النشر</th>
              <th className="px-8 py-6 text-center rounded-tl-[2.5rem]">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {filtered.map((p) => (
              <tr key={p.id} className={classes.tableRow}>
                <td className="px-8 py-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-gray-50 overflow-hidden border-2 border-white shadow-2xl shadow-gray-200 shrink-0 transform group-hover:scale-110 transition-transform duration-500 flex items-center justify-center">
                      {p.images ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images.split(",")[0]?.trim()}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span className="material-symbols-rounded text-2xl text-gray-300">image</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-[#021D24] text-lg leading-tight mb-1">{p.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1089A4]" />
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{p.category?.name || "عام / غير مصنف"}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-8">
                  <div className="flex flex-col">
                     <span className="font-mono text-xs font-black text-gray-300 tracking-widest">{p.sku || "NO-SKU-ID"}</span>
                     <span className="text-[9px] font-bold text-[#1089A4] mt-1">تحديث: 2026</span>
                  </div>
                </td>
                <td className="px-8 py-8 font-black text-[#021D24] text-lg">
                  {p.price?.toLocaleString()} 
                  <span className="text-[11px] text-[#1089A4] mr-2 font-black">ج.س</span>
                </td>
                <td className="px-8 py-8 text-center">
                  <div className="flex flex-col items-center gap-1">
                     <span className={cn(
                        "px-5 py-2 rounded-2xl text-[11px] font-black shadow-sm",
                        p.stock > 10 ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                     )}>
                        {p.stock} قطعة
                     </span>
                     <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div className={cn("h-full rounded-full", p.stock > 10 ? "bg-green-500" : "bg-red-500")} style={{width: `${Math.min(p.stock, 100)}%`}} />
                     </div>
                  </div>
                </td>
                <td className="px-8 py-8 text-center">
                  <span className={cn(
                    classes.badge,
                    p.status === 'APPROVED' ? 'bg-[#1089A4]/10 text-[#1089A4]' : 'bg-orange-50 text-orange-500'
                  )}>
                    {p.status === 'APPROVED' ? 'معتمد ونشط' : 'قيد المراجعة'}
                  </span>
                </td>
                <td className="px-8 py-8">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => onEdit(p)} className="w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100 text-[#021D24] flex items-center justify-center hover:bg-[#021D24] hover:text-white transition-all duration-300 shadow-xl shadow-gray-200/50 active:scale-90">
                      <span className="material-symbols-rounded text-xl">edit_square</span>
                    </button>
                    <button className="w-12 h-12 rounded-[1.2rem] bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 shadow-xl shadow-red-200/50 active:scale-90">
                      <span className="material-symbols-rounded text-xl">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-40 flex flex-col items-center justify-center text-gray-200">
              <span className="material-symbols-rounded text-[100px] mb-6 opacity-20">inventory_2</span>
              <p className="font-black text-lg uppercase tracking-[0.3em]">لا توجد نتائج مطابقة</p>
          </div>
        )}
      </div>
    </div>
  );
}
