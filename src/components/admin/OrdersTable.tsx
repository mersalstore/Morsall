"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface OrdersTableProps {
  orders: any[];
  onEdit: (order: any) => void;
  onPrint: (order: any) => void;
  classes: any;
  ORDER_STATUSES: any;
}

export default function OrdersTable({ orders, onEdit, onPrint, classes, ORDER_STATUSES }: OrdersTableProps) {
  const [orderSearch, setOrderSearch] = useState("");
  const [oStatusFilter, setOStatusFilter] = useState("الكل");

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone?.includes(orderSearch);
    const matchesStatus = oStatusFilter === "الكل" || o.status === oStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "بانتظار المراجعة", count: orders.filter(o => o.status === "PENDING").length, color: "from-orange-400 to-orange-600", icon: "pending" },
          { label: "قيد التجهيز", count: orders.filter(o => o.status === "PROCESSING").length, color: "from-blue-400 to-blue-600", icon: "inventory_2" },
          { label: "خرج للتوصيل", count: orders.filter(o => o.status === "SHIPPED").length, color: "from-[#1089A4] to-[#021D24]", icon: "local_shipping" },
          { label: "تم التسليم", count: orders.filter(o => o.status === "DELIVERED").length, color: "from-green-400 to-green-600", icon: "verified" },
        ].map((s, i) => (
          <div key={i} className={cn(classes.card, "p-5 md:p-8 flex items-center justify-between group hover:scale-[1.03] shadow-none border-gray-100")}>
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
        {/* Search/Filter Bar */}
        <div className="p-5 md:p-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-white/50 border-b border-gray-100/50">
          <div className="relative flex-grow">
            <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-rounded text-[#1089A4] text-xl">search</span>
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

        {/* MOBILE: Card Layout */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-[#1089A4] bg-[#1089A4]/10 px-3 py-1 rounded-xl">
                  #{order.id?.slice(-8).toUpperCase()}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider",
                  ORDER_STATUSES[order.status]?.cls === 'badge-active' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'
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
              <div className="flex gap-3">
                <button onClick={() => onEdit(order)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#1089A4]/10 text-[#1089A4] font-black text-xs hover:bg-[#1089A4] hover:text-white transition-all">
                  <span className="material-symbols-rounded text-base">edit_note</span>
                  تعديل الحالة
                </button>
                <button onClick={() => onPrint(order)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#021D24]/10 text-[#021D24] font-black text-xs hover:bg-[#021D24] hover:text-white transition-all">
                  <span className="material-symbols-rounded text-base">print</span>
                  طباعة
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
                <th className="px-8 py-6 text-center rounded-tr-[2.5rem]">رقم التتبع</th>
                <th className="px-8 py-6">تفاصيل العميل</th>
                <th className="px-8 py-6">الوجهة</th>
                <th className="px-8 py-6">القيمة الإجمالية</th>
                <th className="px-8 py-6 text-center">حالة الطلب</th>
                <th className="px-8 py-6 text-center rounded-tl-[2.5rem]">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className={classes.tableRow}>
                  <td className="px-8 py-10 font-mono text-xs font-black text-[#1089A4] tracking-[0.2em] text-center">
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
                  <td className="px-8 py-10 text-center">
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
                      "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest",
                      ORDER_STATUSES[order.status]?.cls === 'badge-active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-500 border border-orange-100'
                    )}>
                      {ORDER_STATUSES[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td className="px-8 py-10">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => onEdit(order)} className="w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100 text-[#1089A4] flex items-center justify-center hover:bg-[#1089A4] hover:text-white transition-all shadow-xl shadow-gray-200/50">
                        <span className="material-symbols-rounded text-xl">edit_note</span>
                      </button>
                      <button onClick={() => onPrint(order)} className="w-12 h-12 rounded-[1.2rem] bg-[#021D24] text-white flex items-center justify-center hover:bg-[#F29124] transition-all shadow-xl">
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
              <p className="font-black text-lg uppercase tracking-[0.3em]">لا توجد طلبات مطابقة للبحث</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
