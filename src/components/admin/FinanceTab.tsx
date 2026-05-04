"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle2, XCircle, Clock, ArrowDownToLine } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinanceTab() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWithdrawals(); }, []);

  const fetchWithdrawals = async () => {
    const res = await fetch("/api/admin/withdrawals");
    if (res.ok) setWithdrawals(await res.json());
    setLoading(false);
  };

  const handleAction = async (id: string, status: string) => {
    if (!confirm(`هل أنت متأكد من ${status === 'APPROVED' ? 'الموافقة على' : 'رفض'} هذا الطلب؟`)) return;
    await fetch("/api/admin/withdrawals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    fetchWithdrawals();
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-400">جاري تحميل البيانات المالية...</div>;

  return (
    <div className="space-y-10">
      <div className="bg-gradient-to-br from-[#021D24] to-[#0D3B47] p-12 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-3xl relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4 flex items-center gap-4">
               <ArrowDownToLine className="text-[#F29124]" size={32} />
               إدارة عمليات السحب
            </h2>
            <p className="text-white/50 text-sm font-medium">مراجعة ومعالجة طلبات سحب الأرباح من قبل الموردين.</p>
         </div>
         <div className="bg-white/10 backdrop-blur-md px-10 py-6 rounded-[2rem] border border-white/10 text-center relative z-10">
            <p className="text-[10px] font-black text-[#F29124] uppercase tracking-widest mb-1">إجمالي طلبات السحب</p>
            <p className="text-4xl font-black">{withdrawals.length}</p>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#1089A4]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className={cn("bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden")}>
        <table className="w-full text-right" dir="rtl">
          <thead>
            <tr className="bg-[#021D24] text-white/40 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5">
              <th className="px-10 py-6">المورد / المتجر</th>
              <th className="px-10 py-6">المبلغ</th>
              <th className="px-10 py-6">طريقة السحب</th>
              <th className="px-10 py-6">الحالة</th>
              <th className="px-10 py-6">التاريخ</th>
              <th className="px-10 py-6">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {withdrawals.map((w: any) => (
              <tr key={w.id} className="hover:bg-gray-50/80 transition-all group">
                <td className="px-10 py-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-[#1089A4]">
                         {w.vendor?.storeName?.[0] || "V"}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#021D24]">{w.vendor?.storeName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{w.vendor?.user?.name}</p>
                      </div>
                   </div>
                </td>
                <td className="px-10 py-6 text-sm font-black text-[#021D24]">{w.amount.toLocaleString()} ج.س</td>
                <td className="px-10 py-6">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#1089A4] uppercase tracking-widest">{w.method}</span>
                      <span className="text-[10px] text-gray-400 font-bold mt-0.5">{w.details || "لا توجد تفاصيل"}</span>
                   </div>
                </td>
                <td className="px-10 py-6">
                   <span className={cn(
                     "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit",
                     w.status === 'PENDING' ? "bg-amber-50 text-amber-500" :
                     w.status === 'APPROVED' ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                   )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                         w.status === 'PENDING' ? "bg-amber-500 animate-pulse" :
                         w.status === 'APPROVED' ? "bg-green-500" : "bg-red-500"
                      )} />
                      {w.status === 'PENDING' ? "قيد الانتظار" : w.status === 'APPROVED' ? "تم التحويل" : "مرفوض"}
                   </span>
                </td>
                <td className="px-10 py-6 text-[10px] font-bold text-gray-400">{new Date(w.createdAt).toLocaleDateString('ar-EG')}</td>
                <td className="px-10 py-6">
                   {w.status === 'PENDING' && (
                     <div className="flex gap-2">
                        <button onClick={() => handleAction(w.id, 'APPROVED')} className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm"><CheckCircle2 size={18} /></button>
                        <button onClick={() => handleAction(w.id, 'REJECTED')} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"><XCircle size={18} /></button>
                     </div>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {withdrawals.length === 0 && (
          <div className="p-20 text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                <CreditCard size={40} />
             </div>
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">لا توجد طلبات سحب حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
