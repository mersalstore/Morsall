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
      {/* Toolbar */}
      <div className="p-5 md:p-10 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white/50 border-b border-gray-100/50">
        <div className="relative flex-grow max-w-full md:max-w-xl">
          <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-rounded text-[#1089A4]">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            className={cn(classes.input, "pr-14 py-4")}
          />
        </div>
        <button onClick={onAdd} className={cn(classes.btnPrimary, "flex items-center justify-center gap-2 py-4 px-6 text-sm")}>
          <span className="material-symbols-rounded text-xl">add_box</span>
          إضافة منتج
        </button>
      </div>

      {/* MOBILE: Card Layout */}
      <div className="md:hidden divide-y divide-gray-100">
        {filtered.map((p) => (
          <div key={p.id} className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center">
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
            <div className="flex-grow min-w-0">
              <p className="font-black text-[#021D24] text-sm truncate">{p.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{p.category?.name || "غير مصنف"}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="font-black text-[#021D24] text-sm">{p.price?.toLocaleString()} <span className="text-[10px] text-[#1089A4]">ج.س</span></span>
                <span className={cn(
                  "px-2 py-0.5 rounded-lg text-[10px] font-black",
                  p.stock > 10 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                )}>{p.stock} قطعة</span>
              </div>
            </div>
            <button
              onClick={() => onEdit(p)}
              className="w-10 h-10 rounded-xl bg-[#1089A4]/10 text-[#1089A4] flex items-center justify-center shrink-0 hover:bg-[#1089A4] hover:text-white transition-all"
            >
              <span className="material-symbols-rounded text-lg">edit_square</span>
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-200">
            <span className="material-symbols-rounded text-[80px] opacity-20">inventory_2</span>
            <p className="font-black text-sm mt-4">لا توجد منتجات</p>
          </div>
        )}
      </div>

      {/* DESKTOP: Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[800px]">
          <thead>
            <tr className={classes.tableHeader}>
              <th className="px-8 py-6 rounded-tr-[2.5rem]">بيانات المنتج</th>
              <th className="px-8 py-6">الكود (SKU)</th>
              <th className="px-8 py-6">السعر</th>
              <th className="px-8 py-6 text-center">المخزون</th>
              <th className="px-8 py-6 text-center">الحالة</th>
              <th className="px-8 py-6 text-center rounded-tl-[2.5rem]">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {filtered.map((p) => (
              <tr key={p.id} className={classes.tableRow}>
                <td className="px-8 py-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-gray-50 overflow-hidden border-2 border-white shadow-2xl shadow-gray-200 shrink-0 flex items-center justify-center">
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
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{p.category?.name || "عام"}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-8">
                  <span className="font-mono text-xs font-black text-gray-300 tracking-widest">{p.sku || "NO-SKU"}</span>
                </td>
                <td className="px-8 py-8 font-black text-[#021D24] text-lg">
                  {p.price?.toLocaleString()}
                  <span className="text-[11px] text-[#1089A4] mr-2 font-black">ج.س</span>
                </td>
                <td className="px-8 py-8 text-center">
                  <span className={cn(
                    "px-5 py-2 rounded-2xl text-[11px] font-black shadow-sm",
                    p.stock > 10 ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                  )}>
                    {p.stock} قطعة
                  </span>
                </td>
                <td className="px-8 py-8 text-center">
                  <span className={cn(
                    classes.badge,
                    p.status === 'APPROVED' ? 'bg-[#1089A4]/10 text-[#1089A4]' : 'bg-orange-50 text-orange-500'
                  )}>
                    {p.status === 'APPROVED' ? 'معتمد' : 'قيد المراجعة'}
                  </span>
                </td>
                <td className="px-8 py-8">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => onEdit(p)} className="w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100 text-[#021D24] flex items-center justify-center hover:bg-[#021D24] hover:text-white transition-all shadow-xl shadow-gray-200/50">
                      <span className="material-symbols-rounded text-xl">edit_square</span>
                    </button>
                    <button className="w-12 h-12 rounded-[1.2rem] bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl">
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
            <span className="material-symbols-rounded text-[100px] opacity-20">inventory_2</span>
            <p className="font-black text-lg uppercase tracking-[0.3em]">لا توجد نتائج</p>
          </div>
        )}
      </div>
    </div>
  );
}
