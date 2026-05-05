"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OrdersTableProps {
  orders: any[];
  onEdit: (order: any) => void;
  onPrint: (order: any) => void;
  classes: any;
  ORDER_STATUSES: any;
  defaultStatusFilter?: string | null;
}

export default function OrdersTable({ orders, onEdit, onPrint, classes, ORDER_STATUSES, defaultStatusFilter }: OrdersTableProps) {
  const [orderSearch, setOrderSearch] = useState("");
  const [oStatusFilter, setOStatusFilter] = useState(defaultStatusFilter || "الكل");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sync defaultStatusFilter from overview click
  useEffect(() => {
    if (defaultStatusFilter) setOStatusFilter(defaultStatusFilter);
  }, [defaultStatusFilter]);

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone?.includes(orderSearch);
    const matchesStatus = oStatusFilter === "الكل" || o.status === oStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const allSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.has(o.id));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      filteredOrders.forEach(o => next.delete(o.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredOrders.forEach(o => next.add(o.id));
      setSelectedIds(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  // Export selected (or all filtered) as CSV
  const exportCSV = () => {
    const toExport = filteredOrders.filter(o => selectedIds.size === 0 || selectedIds.has(o.id));
    const headers = ["رقم الطلب", "اسم العميل", "الهاتف", "المدينة", "المبلغ", "الحالة", "التاريخ"];
    const rows = toExport.map(o => [
      `#${o.id?.slice(-8).toUpperCase()}`,
      o.customerName || o.customer?.name || "",
      o.phone || "",
      o.city || "",
      o.totalAmount || 0,
      ORDER_STATUSES[o.status]?.label || o.status,
      new Date(o.createdAt).toLocaleDateString("ar-EG")
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "جاري التجهيز",   count: orders.filter(o => o.status === "PROCESSING").length,   color: "from-indigo-400 to-indigo-600", icon: "inventory_2" },
          { label: "جاري التوصيل",   count: orders.filter(o => o.status === "SHIPPED").length,       color: "from-[#1089A4] to-[#021D24]",   icon: "delivery_dining" },
          { label: "تم التسليم",      count: orders.filter(o => o.status === "DELIVERED").length,     color: "from-green-400 to-green-600",   icon: "verified" },
          { label: "ملغي / مرجع",    count: orders.filter(o => ["CANCELLED","RETURNED"].includes(o.status)).length, color: "from-red-400 to-red-600", icon: "cancel" },
        ].map((s, i) => (
          <div key={i} className={cn(classes.card, "p-5 md:p-8 flex items-center justify-between hover:scale-[1.03] shadow-none border-gray-100 cursor-pointer")}
            onClick={() => setOStatusFilter(i === 0 ? "PROCESSING" : i === 1 ? "SHIPPED" : i === 2 ? "DELIVERED" : "CANCELLED")}
          >
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{s.label}</p>
              <p className="text-2xl md:text-3xl font-black text-[#021D24]">{s.count}</p>
            </div>
            <div className={cn("w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-xl", s.color)}>
              <span className="material-symbols-rounded text-xl md:text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={cn(classes.card, "border-0 shadow-none")}>
        {/* Toolbar */}
        <div className="p-5 md:p-8 flex flex-col gap-4 bg-white/50 border-b border-gray-100/50">
          {/* Search + Status */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-rounded text-[#1089A4]">search</span>
              <input
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                placeholder="ابحث برقم الطلب أو اسم العميل..."
                className={cn(classes.input, "pr-14 py-4")}
              />
            </div>
            <select value={oStatusFilter} onChange={e => setOStatusFilter(e.target.value)} className={cn(classes.input, "md:w-56 py-4")}>
              <option value="الكل">جميع الحالات</option>
              {Object.keys(ORDER_STATUSES).map(key => <option key={key} value={key}>{ORDER_STATUSES[key].label}</option>)}
            </select>
          </div>
          {/* Action Bar */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-black text-gray-400">
              {selectedIds.size > 0 ? `${selectedIds.size} طلب محدد` : `${filteredOrders.length} طلب`}
            </span>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-2xl font-black text-xs hover:bg-green-600 transition-all"
            >
              <span className="material-symbols-rounded text-base">download</span>
              {selectedIds.size > 0 ? `تصدير (${selectedIds.size})` : "تصدير الكل"} CSV
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={() => setSelectedIds(new Set())}
                className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all"
              >
                إلغاء التحديد
              </button>
            )}
          </div>
        </div>

        {/* MOBILE: Card Layout */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleOne(order.id)}
                    className="w-4 h-4 rounded accent-[#1089A4]" />
                  <span className="font-mono text-xs font-black text-[#1089A4] bg-[#1089A4]/10 px-3 py-1 rounded-xl">
                    #{order.id?.slice(-8).toUpperCase()}
                  </span>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-xl text-[10px] font-black",
                  ORDER_STATUSES[order.status]?.cls === "badge-active" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-500"
                )}>
                  {ORDER_STATUSES[order.status]?.label || order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-[#021D24] text-sm">{order.customerName || order.customer?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5" dir="ltr">{order.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#021D24]">{order.totalAmount?.toLocaleString()} <span className="text-[10px] text-[#1089A4]">ج.س</span></p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{order.city}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(order)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#1089A4]/10 text-[#1089A4] font-black text-xs hover:bg-[#1089A4] hover:text-white transition-all">
                  <span className="material-symbols-rounded text-base">edit_note</span>
                  تعديل الحالة
                </button>
                <button onClick={() => onPrint(order)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#021D24]/10 text-[#021D24] font-black text-xs hover:bg-[#021D24] hover:text-white transition-all">
                  <span className="material-symbols-rounded text-base">print</span>
                  طباعة البوليصة
                </button>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-gray-200">
              <span className="material-symbols-rounded text-[80px] opacity-20">order_approve</span>
              <p className="font-black text-sm uppercase tracking-widest mt-4">لا توجد طلبات</p>
            </div>
          )}
        </div>

        {/* DESKTOP: Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[1000px]">
            <thead>
              <tr className={classes.tableHeader}>
                <th className="px-6 py-6 rounded-tr-[2.5rem] w-12">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded accent-[#1089A4]" />
                </th>
                <th className="px-8 py-6">رقم التتبع</th>
                <th className="px-8 py-6">تفاصيل العميل</th>
                <th className="px-8 py-6">الوجهة</th>
                <th className="px-8 py-6">القيمة</th>
                <th className="px-8 py-6 text-center">الحالة</th>
                <th className="px-8 py-6 text-center rounded-tl-[2.5rem]">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className={cn(classes.tableRow, selectedIds.has(order.id) && "bg-[#1089A4]/5")}>
                  <td className="px-6 py-8">
                    <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleOne(order.id)}
                      className="w-4 h-4 rounded accent-[#1089A4]" />
                  </td>
                  <td className="px-8 py-10 font-mono text-xs font-black text-[#1089A4] tracking-[0.2em]">
                    #{order.id?.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-8 py-10">
                    <div className="flex flex-col">
                      <span className="font-black text-[#021D24] text-lg leading-tight mb-1">{order.customerName || order.customer?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-rounded text-[14px] text-gray-400">call</span>
                        <span className="text-[11px] font-bold text-gray-400" dir="ltr">{order.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-10">
                    <span className="bg-gray-100 text-[#021D24] px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                      {order.city}
                    </span>
                  </td>
                  <td className="px-8 py-10 font-black text-[#021D24] text-lg whitespace-nowrap">
                    {order.totalAmount?.toLocaleString()}
                    <span className="text-[11px] text-[#1089A4] mr-2 font-black">ج.س</span>
                  </td>
                  <td className="px-8 py-10 text-center">
                    <span className={cn(
                      "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest",
                      ORDER_STATUSES[order.status]?.cls === "badge-active" ? "bg-green-50 text-green-600 border border-green-100" : "bg-orange-50 text-orange-500 border border-orange-100"
                    )}>
                      {ORDER_STATUSES[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td className="px-8 py-10">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onEdit(order)} className="w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100 text-[#1089A4] flex items-center justify-center hover:bg-[#1089A4] hover:text-white transition-all shadow-xl" title="تعديل الحالة">
                        <span className="material-symbols-rounded text-xl">edit_note</span>
                      </button>
                      <button onClick={() => onPrint(order)} className="w-12 h-12 rounded-[1.2rem] bg-[#021D24] text-white flex items-center justify-center hover:bg-[#F29124] transition-all shadow-xl" title="طباعة البوليصة">
                        <span className="material-symbols-rounded text-xl">print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="py-40 flex flex-col items-center justify-center text-gray-200">
              <span className="material-symbols-rounded text-[100px] opacity-20">order_approve</span>
              <p className="font-black text-lg uppercase tracking-[0.3em]">لا توجد طلبات مطابقة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
