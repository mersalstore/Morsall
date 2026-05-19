"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  products: any[];
  onEdit: (product: any) => void;
  onAdd: () => void;
  classes: any;
  onRefresh: () => void;
}

export default function InventoryTable({ products, onEdit, onAdd, classes, onRefresh }: InventoryTableProps) {
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all"); // all, low, out
  const [statusFilter, setStatusFilter] = useState("all"); // all, APPROVED, PENDING, REJECTED
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  // Extract unique vendors and categories
  const vendors = useMemo(() => Array.from(new Map(products.map(p => [p.vendorId, p.vendor || { id: p.vendorId, storeName: "بدون مورد" }])).values()), [products]);
  const categories = useMemo(() => Array.from(new Map(products.map(p => [p.categoryId, p.category || { id: p.categoryId, name: "بدون قسم" }])).values()), [products]);

  // Filters logic
  const filtered = products.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchVendor = vendorFilter === "all" || p.vendorId === vendorFilter;
    const matchCategory = categoryFilter === "all" || p.categoryId === categoryFilter;
    const matchStock = stockFilter === "all" || (stockFilter === "low" && p.stock > 0 && p.stock <= 10) || (stockFilter === "out" && p.stock === 0);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchVendor && matchCategory && matchStock && matchStatus;
  });

  // Checkbox logic
  const allSelected = filtered.length > 0 && filtered.every(p => selectedIds.has(p.id));
  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      filtered.forEach(p => next.delete(p.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filtered.forEach(p => next.add(p.id));
      setSelectedIds(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} منتج؟`)) return;
    
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      if (res.ok) {
        setSelectedIds(new Set());
        onRefresh();
      } else {
        alert("فشل الحذف الجماعي");
      }
    } catch (err) {
      console.error(err);
    }
    setActionLoading(false);
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    setActionLoading(true);
    try {
      // Admin product API expects {id, action} to update status for a single product via POST currently.
      // We can iterate or add bulk status to PATCH. Let's iterate for safety/simplicity.
      for (const id of Array.from(selectedIds)) {
         await fetch("/api/admin/products", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: newStatus })
         });
      }
      setSelectedIds(new Set());
      onRefresh();
    } catch (err) {
      console.error(err);
    }
    setActionLoading(false);
  };

  // Export CSV
  const exportCSV = () => {
    const toExport = filtered.filter(p => selectedIds.size === 0 || selectedIds.has(p.id));
    const headers = ["اسم المنتج", "SKU", "السعر", "الخصم", "المخزون", "القسم", "المورد", "الحالة"];
    const rows = toExport.map(p => [p.title, p.sku || "", p.price, p.discountPrice || 0, p.stock, p.category?.name || "", p.vendor?.storeName || "", p.status]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `inventory_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className={cn(classes.card, "border-0 shadow-none")}>
      {/* Filters Toolbar */}
      <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-stretch bg-white/50 border-b border-gray-100/50 flex-wrap">
        <div className="relative flex-grow min-w-[200px]">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-rounded text-[#C5A021] text-lg">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم، أو الـ SKU..."
            className={cn(classes.input, "pr-12 py-3 text-xs w-full")}
          />
        </div>
        <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)} className={cn(classes.input, "py-3 text-xs w-full md:w-36")}>
          <option value="all">كل الموردين</option>
          {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.storeName}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={cn(classes.input, "py-3 text-xs w-full md:w-32")}>
          <option value="all">كل الأقسام</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className={cn(classes.input, "py-3 text-xs w-full md:w-32")}>
          <option value="all">حالة المخزون</option>
          <option value="low">منخفض (≤10)</option>
          <option value="out">نفذ المخزون</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={cn(classes.input, "py-3 text-xs w-full md:w-32")}>
          <option value="all">كل الحالات</option>
          <option value="APPROVED">معتمد</option>
          <option value="PENDING">قيد المراجعة</option>
          <option value="REJECTED">مرفوض</option>
        </select>
      </div>

      {/* Bulk Actions Toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
         <div className="flex items-center gap-3">
           <span className="text-xs font-black text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
             {selectedIds.size} محدد
           </span>
           {selectedIds.size > 0 && (
             <div className="flex gap-2 flex-wrap">
               <button disabled={actionLoading} onClick={handleBulkDelete} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-sm">
                 <span className="material-symbols-rounded text-[14px]">delete</span>
                 حذف جماعي
               </button>
               <button disabled={actionLoading} onClick={() => handleBulkStatusUpdate("APPROVED")} className="bg-green-50 text-green-600 hover:bg-green-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-sm">
                 <span className="material-symbols-rounded text-[14px]">check_circle</span>
                 اعتماد المحددة
               </button>
               <button disabled={actionLoading} onClick={() => handleBulkStatusUpdate("PENDING")} className="bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-sm">
                 <span className="material-symbols-rounded text-[14px]">pause_circle</span>
                 تعليق المحددة
               </button>
             </div>
           )}
         </div>
         <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1 bg-[#0F172A] text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-[#C5A021] transition-all shadow-md">
              <span className="material-symbols-rounded text-[14px]">download</span>
              تصدير
            </button>
            <button onClick={onAdd} className="flex items-center gap-1 bg-[#C5A021] text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-[#0F172A] transition-all shadow-md">
              <span className="material-symbols-rounded text-[14px]">add</span>
              منتج جديد
            </button>
         </div>
      </div>

      {/* DESKTOP: Compact Table Layout */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-right border-collapse min-w-[900px] text-sm">
          <thead>
            <tr className={cn(classes.tableHeader, "text-xs")}>
              <th className="px-4 py-4 w-12 text-center rounded-tr-[1.5rem]">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded accent-[#C5A021]" />
              </th>
              <th className="px-4 py-4 w-16">صورة</th>
              <th className="px-4 py-4">المنتج والـ SKU</th>
              <th className="px-4 py-4">السعر</th>
              <th className="px-4 py-4 text-center">المخزون</th>
              <th className="px-4 py-4">السمات</th>
              <th className="px-4 py-4 text-center">الحالة</th>
              <th className="px-4 py-4 text-center rounded-tl-[1.5rem]">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {filtered.map((p) => (
              <tr key={p.id} className={cn(classes.tableRow, selectedIds.has(p.id) && "bg-[#C5A021]/5")}>
                <td className="px-4 py-3 text-center">
                   <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleOne(p.id)} className="w-4 h-4 rounded accent-[#C5A021]" />
                </td>
                <td className="px-4 py-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                    {(p.images && p.images.trim().length > 0) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images.split(",")[0]?.trim()}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="material-symbols-rounded text-lg text-gray-300">image</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-black text-[#0F172A] text-xs truncate max-w-[200px]" title={p.title}>{p.title}</span>
                    <span className="font-mono text-[10px] font-bold text-gray-400 tracking-wider mt-0.5">{p.sku || "NO-SKU"}</span>
                    <span className="text-[9px] text-[#C5A021] font-bold mt-0.5">{p.vendor?.storeName || "بدون مورد"}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-black text-[#0F172A] text-sm">
                      {p.price?.toLocaleString()} <span className="text-[9px] text-[#C5A021]">ج.س</span>
                    </span>
                    {p.discountPrice && p.discountPrice > 0 && (
                      <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                        <span className="material-symbols-rounded text-[10px]">sell</span>
                        خصم: {p.discountPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "px-3 py-1 rounded-xl text-[10px] font-black whitespace-nowrap",
                    p.stock > 10 ? "bg-green-50 text-green-600" : p.stock > 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                  )}>
                    {p.stock} قطعة
                  </span>
                </td>
                <td className="px-4 py-3">
                   <div className="flex flex-col gap-1 text-[9px] font-bold text-gray-500">
                     {p.colors && <span className="bg-gray-100 px-2 py-0.5 rounded w-fit">ألوان: {p.colors.split(",").length}</span>}
                     {p.sizes && <span className="bg-gray-100 px-2 py-0.5 rounded w-fit">مقاسات: {p.sizes.split(",").length}</span>}
                     {!p.colors && !p.sizes && <span className="text-gray-300">بدون متغيرات</span>}
                   </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[9px] font-black whitespace-nowrap",
                    p.status === 'APPROVED' ? 'bg-green-50 text-green-600' : p.status === 'PENDING' ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500'
                  )}>
                    {p.status === 'APPROVED' ? 'معتمد' : p.status === 'PENDING' ? 'قيد المراجعة' : 'مرفوض'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onEdit(p)} className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-[#C5A021] hover:text-white transition-all shadow-sm">
                      <span className="material-symbols-rounded text-[14px]">edit</span>
                    </button>
                    <button onClick={() => {
                      if(confirm("تأكيد الحذف؟")) {
                         setSelectedIds(new Set([p.id]));
                         setTimeout(handleBulkDelete, 0); // Hacky way to use bulk delete logic for single delete
                      }
                    }} className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                      <span className="material-symbols-rounded text-[14px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-gray-200">
            <span className="material-symbols-rounded text-[80px] opacity-20">inventory_2</span>
            <p className="font-black text-sm uppercase tracking-[0.2em] mt-4">لا توجد منتجات مطابقة</p>
          </div>
        )}
      </div>
    </div>
  );
}
