"use client"

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StoreAnalytics({ stats }: { stats: any }) {
  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[#0F172A]">التحليلات المتقدمة</h2>
          <p className="text-gray-400 font-bold">مراقبة أداء المتجر، المبيعات، ونمو الأرباح بدقة.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white px-5 py-2.5 rounded-xl border flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest">تحديث مباشر</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[#0F172A]">منحنى المبيعات</h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">آخر 30 يوم</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A021]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">المبيعات</span>
                  </div>
              </div>
              
              <div className="h-64 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                    <defs>
                       <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C5A021" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#C5A021" stopOpacity="0" />
                       </linearGradient>
                    </defs>
                    <path d="M0,250 Q150,180 300,220 T600,100 T1000,150 L1000,300 L0,300 Z" fill="url(#chartGradient)" />
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      d="M0,250 Q150,180 300,220 T600,100 T1000,150" 
                      fill="none" 
                      stroke="#C5A021" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                    />
                  </svg>
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                 {['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'].map((w, i) => (
                   <span key={i} className="text-[10px] font-black uppercase tracking-widest text-gray-300">{w}</span>
                 ))}
              </div>
            </div>
        </div>

        {/* Breakdown Stats */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#0F172A]">توزيع الأرباح</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">إجمالي المبيعات</span>
                    <span className="font-black text-[#0F172A]">{stats?.totalSales?.toLocaleString()} ج.س</span>
                 </div>
                 <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C5A021]" style={{ width: '100%' }} />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400">
                      عمولة المنصة ({stats?.commissionType === 'PERCENTAGE' ? `${stats?.commissionRate}%` : `${stats?.commissionRate} ج.س/قطعة`})
                    </span>
                    <span className="font-black text-red-500">-{ (stats?.totalSales - stats?.netProfit || 0).toLocaleString() } ج.س</span>
                 </div>
                 <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400" style={{ width: stats?.totalSales > 0 ? `${((stats?.totalSales - stats?.netProfit) / stats?.totalSales) * 100}%` : '0%' }} />
                 </div>
                 <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-xs font-black text-[#0F172A]">صافي الربح</span>
                    <span className="text-xl font-black text-[#C5A021]">{stats?.netProfit?.toLocaleString()} ج.س</span>
                 </div>
              </div>
           </div>

           <div className="bg-[#0F172A] p-8 rounded-3xl text-white space-y-3 shadow-lg">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-rounded text-xl text-[#F29124]">workspace_premium</span>
                 </div>
                 <h4 className="font-black text-base">الباقة الفاخرة</h4>
              </div>
              <p className="text-[10px] font-bold opacity-60 leading-relaxed">استمتع بكافة المميزات المتقدمة المتاحة للمتاجر الكبرى.</p>
           </div>
        </div>
      </div>

    </div>
  );
}
