"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ApprovalsTabProps {
  pendingVendors: any[];
  pendingProducts: any[];
  onVendorAction: (id: string, action: string) => void;
  onProductAction: (id: string, action: string) => void;
  classes: any;
}

export default function ApprovalsTab({ pendingVendors, pendingProducts, onVendorAction, onProductAction, classes }: ApprovalsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Pending Vendors */}
      <div className={cn(classes.card, "border-0 shadow-none")}>
        <div className="p-8 border-b border-gray-100/50 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
             <h3 className="font-black text-[#021D24] text-lg">طلبات انضمام المتاجر</h3>
          </div>
          <span className="bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/20">{pendingVendors.length}</span>
        </div>
        <div className="divide-y divide-gray-50/50">
          {pendingVendors.map(v => (
            <div key={v.id} className="p-8 flex items-center justify-between group hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1089A4] to-[#021D24] text-white flex items-center justify-center font-black text-xl shadow-2xl shadow-[#1089A4]/20 group-hover:scale-110 transition-transform">
                  {(v.storeName?.[0] || v.store?.[0] || "M").toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-[#021D24] text-base leading-tight mb-1">{v.storeName || v.store}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{v.city || "الخرطوم"} • {v.name}</p>
                </div>
              </div>
              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <button onClick={() => onVendorAction(v.id, "APPROVE")} className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-90">
                  <span className="material-symbols-rounded text-xl">check_circle</span>
                </button>
                <button onClick={() => onVendorAction(v.id, "REJECT")} className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-90">
                  <span className="material-symbols-rounded text-xl">cancel</span>
                </button>
              </div>
            </div>
          ))}
          {pendingVendors.length === 0 && (
             <div className="py-20 flex flex-col items-center justify-center text-gray-200">
                <span className="material-symbols-rounded text-6xl mb-4 opacity-20">verified_user</span>
                <p className="font-black text-xs uppercase tracking-[0.3em]">لا توجد متاجر معلقة حالياً</p>
             </div>
          )}
        </div>
      </div>

      {/* Pending Products */}
      <div className={cn(classes.card, "border-0 shadow-none")}>
        <div className="p-8 border-b border-gray-100/50 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 bg-[#1089A4] rounded-full animate-ping" />
             <h3 className="font-black text-[#021D24] text-lg">مراجعة المنتجات الجديدة</h3>
          </div>
          <span className="bg-[#1089A4] text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-[#1089A4]/20">{pendingProducts.length}</span>
        </div>
        <div className="divide-y divide-gray-50/50">
          {pendingProducts.map(p => (
            <div key={p.id} className="p-8 flex items-center justify-between group hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden border-2 border-white shadow-2xl shadow-gray-200 group-hover:scale-110 transition-transform">
                  {p.images && <img src={p.images.split(",")[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <p className="font-black text-[#021D24] text-base leading-tight mb-1">{p.title}</p>
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#F29124]" />
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.vendor?.storeName || "بائع مستقل"}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <button onClick={() => onProductAction(p.id, "APPROVE")} className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-90">
                  <span className="material-symbols-rounded text-xl">verified</span>
                </button>
                <button onClick={() => onProductAction(p.id, "REJECT")} className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-200/20 active:scale-90">
                  <span className="material-symbols-rounded text-xl">delete_sweep</span>
                </button>
              </div>
            </div>
          ))}
          {pendingProducts.length === 0 && (
             <div className="py-20 flex flex-col items-center justify-center text-gray-200">
                <span className="material-symbols-rounded text-6xl mb-4 opacity-20">inventory_2</span>
                <p className="font-black text-xs uppercase tracking-[0.3em]">جميع المنتجات تمت مراجعتها</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
