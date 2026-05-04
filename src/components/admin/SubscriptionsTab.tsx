"use client";

import React, { useState, useEffect } from "react";
import { Gem, Check, X, ShieldCheck, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubscriptionsTab() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/subscriptions/plans")
      .then(res => res.json())
      .then(data => {
        setPlans(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center font-black text-gray-400">جاري تحميل باقات الاشتراك...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6">
         <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-2xl">
            <Gem size={32} />
         </div>
         <div>
            <h2 className="text-3xl font-black text-[#021D24]">باقات اشتراك الموردين</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Vendor Subscription Plans</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
         {plans.map((plan) => (
            <div key={plan.id} className={cn(
              "p-12 rounded-[3.5rem] border relative overflow-hidden transition-all duration-500 hover:scale-[1.05]",
              plan.isPopular ? "bg-[#021D24] text-white border-transparent shadow-3xl" : "bg-white text-[#021D24] border-gray-100 shadow-2xl shadow-gray-200/50"
            )}>
               {plan.isPopular && (
                 <div className="absolute top-8 left-[-35px] bg-[#F29124] text-white text-[9px] font-black uppercase tracking-[0.3em] px-12 py-2 -rotate-45 shadow-lg">الأكثر طلباً</div>
               )}
               
               <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
               <div className="flex items-end gap-2 mb-10">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className={cn("text-xs font-bold mb-1", plan.isPopular ? "text-white/40" : "text-gray-400")}>ج.س / شهرياً</span>
               </div>

               <div className="space-y-6 mb-12">
                  {plan.features?.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", plan.isPopular ? "bg-white/10 text-[#F29124]" : "bg-green-50 text-green-500")}>
                          <Check size={14} strokeWidth={3} />
                       </div>
                       <span className={cn("text-xs font-bold", plan.isPopular ? "text-white/70" : "text-gray-500")}>{f}</span>
                    </div>
                  ))}
               </div>

               <button className={cn(
                 "w-full py-5 rounded-2xl font-black text-sm transition-all",
                 plan.isPopular ? "bg-[#F29124] text-white hover:brightness-110 shadow-xl shadow-[#F29124]/20" : "bg-gray-100 text-[#021D24] hover:bg-[#021D24] hover:text-white"
               )}>
                 تعديل الباقة
               </button>
            </div>
         ))}

         {/* Add New Plan Card */}
         <button className="border-4 border-dashed border-gray-100 rounded-[3.5rem] p-12 flex flex-col items-center justify-center gap-6 group hover:border-[#1089A4] transition-all">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#1089A4]/10 transition-colors">
               <Plus size={32} className="text-gray-200 group-hover:text-[#1089A4]" />
            </div>
            <p className="text-sm font-black text-gray-300 group-hover:text-[#1089A4]">إضافة باقة جديدة</p>
         </button>
      </div>
    </div>
  );
}
