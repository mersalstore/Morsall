"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import AddVendorModal from "./AddVendorModal";

interface UsersVendorsTabProps {
  type: "users" | "vendors";
  data: any[];
  onAction?: (id: string, action: string) => void;
  classes: any;
  fetchData?: () => void;
}

export default function UsersVendorsTab({ type, data, onAction, classes, fetchData }: UsersVendorsTabProps) {
  const [search, setSearch] = useState("");
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);

  const filtered = data.filter(item => 
    (item.name || item.storeName || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.email || item.phone || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn(classes.card, "border-0 shadow-none")}>
      <AddVendorModal 
        isOpen={isAddVendorOpen} 
        onClose={() => setIsAddVendorOpen(false)} 
        onSuccess={() => {
          if (fetchData) fetchData();
        }} 
      />
      <div className="p-10 flex flex-wrap justify-between items-center gap-6 bg-white/50 border-b border-gray-100/50">
        <div className="relative flex-grow max-w-xl">
          <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-rounded text-[#1089A4]">search</span>
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder={type === "users" ? "ابحث عن عميل بالاسم، البريد، أو الهاتف..." : "ابحث عن متجر شريك..."} 
            className={cn(classes.input, "pr-16")} 
          />
        </div>
        {type === "vendors" && (
          <button 
            onClick={() => setIsAddVendorOpen(true)}
            className={cn(classes.btnPrimary, "flex items-center gap-2 px-8")}
          >
            <span className="material-symbols-rounded">add</span>
            إضافة مورد جديد
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[800px]">
          <thead>
            <tr className={classes.tableHeader}>
              <th className="px-8 py-6 rounded-tr-[2.5rem]">{type === "users" ? "بيانات العميل" : "اسم المتجر والمالك"}</th>
              <th className="px-8 py-6">قنوات الاتصال</th>
              <th className="px-8 py-6">{type === "users" ? "تاريخ التسجيل" : "الحالة التشغيلية"}</th>
              <th className="px-8 py-6 text-center rounded-tl-[2.5rem]">إجراءات الإدارة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {filtered.map((item) => (
              <tr key={item.id} className={classes.tableRow}>
                <td className="px-8 py-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1089A4]/10 to-[#021D24]/10 text-[#021D24] flex items-center justify-center font-black text-xl shadow-inner border border-white transform group-hover:scale-110 transition-transform duration-500">
                      {(item.name || item.storeName || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-[#021D24] text-lg leading-tight mb-1">{item.name || item.storeName}</span>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#F29124]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{type === "users" ? (item.role || "عميل مميز") : (item.city || "شريك مرسال")}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-8">
                   <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                         <span className="material-symbols-rounded text-sm text-[#1089A4]">alternate_email</span>
                         <span className="font-bold text-[#021D24] text-xs">{item.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="material-symbols-rounded text-sm text-[#1089A4]">smartphone</span>
                         <span className="text-gray-400 text-[11px] font-black" dir="ltr">{item.phone}</span>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-8">
                   {type === "users" ? (
                      <div className="flex flex-col">
                         <span className="text-xs font-black text-[#021D24]">{new Date(item.createdAt).toLocaleDateString("ar-EG")}</span>
                         <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">تاريخ الانضمام</span>
                      </div>
                   ) : (
                      <span className={cn(
                        classes.badge,
                        item.status === 'APPROVED' ? 'bg-[#1089A4]/10 text-[#1089A4]' : 'bg-orange-50 text-orange-500'
                      )}>
                        {item.status === 'APPROVED' ? 'متجر معتمد' : 'في انتظار الموافقة'}
                      </span>
                   )}
                </td>
                <td className="px-8 py-8">
                  <div className="flex items-center justify-center gap-3">
                    <button className="w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100 text-[#021D24] flex items-center justify-center hover:bg-[#021D24] hover:text-white transition-all duration-300 shadow-xl shadow-gray-200/50">
                      <span className="material-symbols-rounded text-xl">person_search</span>
                    </button>
                    <button className="w-12 h-12 rounded-[1.2rem] bg-gray-900 text-white flex items-center justify-center hover:bg-red-600 transition-all duration-300 shadow-xl">
                      <span className="material-symbols-rounded text-xl">block</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
