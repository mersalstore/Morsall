"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Truck, Package, MapPin, CheckCircle2, Clock, Search, Navigation } from "lucide-react";
import { cn } from "../lib/utils";

interface LogisticsProps {
  orders: any[];
}

export default function VendorLogisticsTab({ orders = [] }: LogisticsProps) {
  const [search, setSearch] = useState("");

  const activeDeliveries = orders
    .filter(o => ["SHIPPED", "PROCESSING", "DELIVERED"].includes(o.status))
    .map(o => ({
      id: `MSR-${o.id.slice(-6).toUpperCase()}`,
      status: o.status,
      customer: o.customerName,
      location: o.city,
      driver: "جاري البحث عن مندوب", // Since we don't have driver info easily available here
      eta: "يحدد لاحقاً"
    }));

  return (
    <div className="space-y-8 pb-20 font-black" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h3 className="text-2xl text-[#0F172A]">تتبع الشحنات</h3>
            <p className="text-sm text-gray-400 font-bold mt-1">متابعة حالة توصيل طلباتك لعملائك</p>
         </div>
         <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-3 w-full md:w-80 shadow-sm focus-within:ring-2 ring-[#C5A021]/20 transition-all">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="بحث برقم الشحنة..." 
              className="bg-transparent outline-none text-xs w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Active Shipments List */}
         <div className="lg:col-span-2 space-y-4">
            {activeDeliveries.map((delivery, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 group hover:border-[#C5A021]/30 transition-all"
               >
                  <div className="flex flex-col md:flex-row gap-6">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-[#C5A021] shrink-0">
                        <Package size={32} />
                     </div>
                     <div className="flex-grow space-y-4">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                           <div>
                              <p className="text-xs text-[#C5A021]">{delivery.id}</p>
                              <h4 className="text-lg text-[#0F172A]">{delivery.customer}</h4>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className={cn(
                                "px-4 py-1 rounded-full text-[10px] font-black uppercase",
                                delivery.status === "SHIPPED" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                              )}>
                                 {delivery.status === "SHIPPED" ? "في الطريق" : "قيد التجهيز"}
                              </span>
                              <p className="text-[10px] text-gray-400 mt-2">الموعد المتوقع: {delivery.eta}</p>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                           <div className="flex items-center gap-3">
                              <MapPin size={16} className="text-gray-400" />
                              <p className="text-xs text-gray-500">{delivery.location}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <Truck size={16} className="text-[#C5A021]" />
                              <p className="text-xs text-gray-500">المندوب: {delivery.driver}</p>
                           </div>
                        </div>

                        {/* Progress Stepper */}
                        <div className="pt-4 flex items-center gap-2">
                           {[
                             { label: "تم الإنشاء", done: true },
                             { label: "تم التجهيز", done: delivery.status === "SHIPPED" },
                             { label: "جاري التوصيل", done: delivery.status === "SHIPPED" },
                             { label: "تم التسليم", done: false },
                           ].map((step, idx) => (
                             <React.Fragment key={idx}>
                               <div className="flex flex-col items-center gap-1">
                                  <div className={cn(
                                    "w-4 h-4 rounded-full flex items-center justify-center transition-all",
                                    step.done ? "bg-[#C5A021] text-white" : "bg-gray-100 text-transparent"
                                  )}>
                                     <CheckCircle2 size={10} />
                                  </div>
                                  <span className={cn("text-[8px] font-black", step.done ? "text-[#C5A021]" : "text-gray-300")}>{step.label}</span>
                               </div>
                               {idx !== 3 && <div className={cn("flex-grow h-0.5 rounded-full", step.done ? "bg-[#C5A021]" : "bg-gray-100")} />}
                             </React.Fragment>
                           ))}
                        </div>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* Logistics Summary Sidebar */}
         <div className="space-y-6">
            <div className="bg-[#0F172A] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <h4 className="text-sm font-black mb-6">ملخص التوصيل</h4>
               <div className="space-y-4">
                  {[
                    { label: "شحنات جارية", count: 12 },
                    { label: "تم تسليمها اليوم", count: 8 },
                    { label: "بانتظار التحصيل", count: 5 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                       <span className="text-[10px] text-white/60">{item.label}</span>
                       <span className="text-sm font-black">{item.count}</span>
                    </div>
                  ))}
               </div>
               <div className="mt-8 pt-8 border-t border-white/10 text-center">
                  <p className="text-[10px] text-white/40 mb-2">وقت التوصيل المتوسط</p>
                  <p className="text-2xl font-black text-[#C5A021]">2.4 يوم</p>
               </div>
               <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#C5A021]/10 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
               <h4 className="text-sm text-[#0F172A] mb-6 flex items-center gap-2">
                  <Clock size={16} className="text-[#F29124]" />
                  المناطق الأكثر طلباً
               </h4>
               <div className="space-y-4">
                  {[
                    { city: "الخرطوم", val: 85 },
                    { city: "أم درمان", val: 60 },
                    { city: "بحري", val: 40 },
                  ].map((city, i) => (
                    <div key={i}>
                       <div className="flex justify-between text-[10px] mb-1">
                          <span>{city.city}</span>
                          <span className="text-gray-400">{city.val}%</span>
                       </div>
                       <div className="h-1 bg-gray-50 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-l from-[#C5A021] to-[#F29124]" style={{ width: `${city.val}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
