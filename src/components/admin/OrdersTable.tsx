"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
    <div className="space-y-10">
      {/* Orders Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "بانتظار المراجعة", count: orders.filter(o => o.status === "PENDING").length, color: "from-orange-400 to-orange-600", icon: "pending" },
            { label: "قيد التجهيز", count: orders.filter(o => o.status === "PROCESSING").length, color: "from-blue-400 to-blue-600", icon: "inventory_2" },
            { label: "خرج للتوصيل", count: orders.filter(o => o.status === "SHIPPED").length, color: "from-[#1089A4] to-[#021D24]", icon: "local_shipping" },
            { label: "تم التسليم بنجاح", count: orders.filter(o => o.status === "DELIVERED").length, color: "from-green-400 to-green-600", icon: "verified" },
          ].map((s, i) => (
            <div key={i} className={cn(classes.card, "p-8 flex items-center justify-between group hover:scale-[1.05] shadow-none border-gray-100")}>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{s.label}</p>
                  <p className="text-3xl font-black text-[#021D24]">{s.count}</p>
                </div>
                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-xl shadow-gray-200", s.color)}>
                  <span className="material-symbols-rounded text-2xl">{s.icon}</span>
                </div>
            </div>
          ))}
      </div>

      <div className={cn(classes.card, "border-0 shadow-none")}>
        <div className="p-10 flex flex-wrap gap-6 items-center bg-white/50 border-b border-gray-100/50">
          <div className="relative flex-grow min-w-[300px]">
            <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-rounded text-[#1089A4]">search</span>
            <input 
              value={orderSearch} 
              onChange={e => setOrderSearch(e.target.value)} 
              placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..." 
              className={cn(classes.input, "pr-16")} 
            />
          </div>
          <select value={oStatusFilter} onChange={e => setOStatusFilter(e.target.value)} className={cn(classes.input, "w-60")}>
            <option value="الكل">جميع حالات الطلبيات</option>
            {Object.keys(ORDER_STATUSES).map(key => <option key={key} value={key}>{ORDER_STATUSES[key].label}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[1000px]">
            <thead>
              <tr className={classes.tableHeader}>
                <th className="px-8 py-6 text-center rounded-tr-[2.5rem]">رقم التتبع</th>
                <th className="px-8 py-6">تفاصيل العميل</th>
                <th className="px-8 py-6">محتويات الشحنة</th>
                <th className="px-8 py-6 text-center">الوجهة</th>
                <th className="px-8 py-6">القيمة الإجمالية</th>
                <th className="px-8 py-6 text-center">حالة الطلب</th>
                <th className="px-8 py-6 text-center rounded-tl-[2.5rem]">إجراءات التحصيل</th>
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
                  <td className="px-8 py-10">
                      <div className="flex -space-x-3 rtl:space-x-reverse">
                        {order.items?.slice(0, 4).map((item: any, i: number) => (
                            <div key={i} className="w-11 h-11 rounded-2xl border-2 border-white bg-white overflow-hidden shadow-2xl shadow-gray-200 group-hover:scale-110 transition-transform duration-500">
                              {item.product?.images && <Image src={item.product.images.split(",")[0]} alt="" fill className="object-cover" />}
                            </div>
                        ))}
                        {order.items?.length > 4 && (
                            <div className="w-11 h-11 rounded-2xl border-2 border-white bg-[#021D24] text-white text-xs flex items-center justify-center font-black shadow-2xl">
                              +{order.items.length - 4}
                            </div>
                        )}
                      </div>
                  </td>
                  <td className="px-8 py-10 text-center">
                      <div className="flex flex-col items-center">
                         <span className="bg-gray-100 text-[#021D24] px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                           {order.city}
                         </span>
                         <span className="text-[9px] font-bold text-gray-400 mt-2">{order.district || "خدمة سريعة"}</span>
                      </div>
                  </td>
                  <td className="px-8 py-10 font-black text-[#021D24] text-lg whitespace-nowrap">
                      {order.totalAmount?.toLocaleString()} 
                      <span className="text-[11px] text-[#1089A4] mr-2 font-black">ج.س</span>
                  </td>
                  <td className="px-8 py-10 text-center">
                      <span className={cn(
                        "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        ORDER_STATUSES[order.status]?.cls === 'badge-active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-500 border border-orange-100'
                      )}>
                        {ORDER_STATUSES[order.status]?.label || order.status}
                      </span>
                  </td>
                  <td className="px-8 py-10">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => onEdit(order)} className="w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100 text-[#1089A4] flex items-center justify-center hover:bg-[#1089A4] hover:text-white transition-all duration-300 shadow-xl shadow-gray-200/50">
                            <span className="material-symbols-rounded text-xl">edit_note</span>
                        </button>
                        <button onClick={() => onPrint(order)} className="w-12 h-12 rounded-[1.2rem] bg-[#021D24] text-white flex items-center justify-center hover:bg-[#F29124] transition-all duration-300 shadow-xl shadow-gray-300/50">
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
                <span className="material-symbols-rounded text-[100px] mb-6 opacity-20">order_approve</span>
                <p className="font-black text-lg uppercase tracking-[0.3em]">لا توجد طلبات مطابقة للبحث</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
