"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import ItemDetailsModal from "./ItemDetailsModal";
import ProductDetailsModal from "./ProductDetailsModal";

interface ApprovalsTabProps {
  pendingVendors: any[];
  pendingProducts: any[];
  onVendorAction: (id: string, action: string, reason?: string) => void;
  onProductAction: (id: string, action: string, reason?: string) => void;
  classes: any;
}

export default function ApprovalsTab({ pendingVendors, pendingProducts, onVendorAction, onProductAction, classes }: ApprovalsTabProps) {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rejectingItem, setRejectingItem] = useState<{ id: string, type: 'vendor' | 'product' } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleConfirmReject = () => {
    if (!rejectingItem) return;
    if (!rejectReason.trim()) {
      alert("الرجاء إدخال سبب الرفض");
      return;
    }
    if (rejectingItem.type === 'vendor') {
      onVendorAction(rejectingItem.id, "REJECT", rejectReason.trim());
    } else {
      onProductAction(rejectingItem.id, "REJECT", rejectReason.trim());
    }
    setRejectingItem(null);
    setRejectReason("");
  };

  return (
    <>
    <ItemDetailsModal
      isOpen={!!selectedVendor}
      type="vendors"
      item={selectedVendor}
      onClose={() => setSelectedVendor(null)}
    />
    <ProductDetailsModal
      isOpen={!!selectedProduct}
      product={selectedProduct}
      onClose={() => setSelectedProduct(null)}
    />

    {/* Rejection Modal */}
    {rejectingItem && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-sm" dir="rtl">
        <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
          <h3 className="text-xl font-black text-[#0F172A] mb-4 flex items-center gap-2">
            <span className="material-symbols-rounded text-red-500">warning</span>
            تأكيد الرفض مع ذكر السبب
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            سيتم إرسال هذا السبب إلى {rejectingItem.type === 'vendor' ? 'صاحب المتجر' : 'البائع'} لإعلامه بسبب عدم قبول الطلب.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="اكتب سبب الرفض هنا بالتفصيل (مثال: السجل التجاري غير واضح، الصور غير مطابقة للشروط)..."
            className="w-full h-32 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-bold outline-none focus:border-red-500 text-[#0F172A] mb-6 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={handleConfirmReject}
              className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
            >
              تأكيد الرفض
            </button>
            <button
              onClick={() => { setRejectingItem(null); setRejectReason(""); }}
              className="w-24 bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-xs hover:bg-gray-200 transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Pending Vendors */}
      <div className={cn(classes.card, "border-0 shadow-none")}>
        <div className="p-8 border-b border-gray-100/50 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
             <h3 className="font-black text-[#0F172A] text-lg">طلبات انضمام المتاجر</h3>
          </div>
          <span className="bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/20">{pendingVendors.length}</span>
        </div>
        <div className="divide-y divide-gray-50/50">
          {pendingVendors.map(v => (
            <div key={v.id} className="p-8 flex items-center justify-between group hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C5A021] to-[#0F172A] text-white flex items-center justify-center font-black text-xl shadow-2xl shadow-[#C5A021]/20 group-hover:scale-110 transition-transform">
                  {(v.storeName?.[0] || v.store?.[0] || "M").toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-[#0F172A] text-base leading-tight mb-1">{v.storeName || v.store}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{v.city || "الخرطوم"} • {v.name}</p>
                </div>
              </div>
              <div className="flex gap-3 transition-all">
                <button
                  onClick={() => setSelectedVendor(v)}
                  className="w-12 h-12 bg-[#C5A021]/10 text-[#C5A021] rounded-2xl flex items-center justify-center hover:bg-[#C5A021] hover:text-white transition-all shadow-xl shadow-[#C5A021]/10 active:scale-90"
                  title="عرض التفاصيل"
                >
                  <span className="material-symbols-rounded text-xl">visibility</span>
                </button>
                <button onClick={() => onVendorAction(v.id, "APPROVE")} className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-90" title="قبول">
                  <span className="material-symbols-rounded text-xl">check_circle</span>
                </button>
                <button onClick={() => setRejectingItem({ id: v.id, type: 'vendor' })} className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-90" title="رفض مع ذكر السبب">
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
             <span className="w-2 h-2 bg-[#C5A021] rounded-full animate-ping" />
             <h3 className="font-black text-[#0F172A] text-lg">مراجعة المنتجات الجديدة</h3>
          </div>
          <span className="bg-[#C5A021] text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-[#C5A021]/20">{pendingProducts.length}</span>
        </div>
        <div className="divide-y divide-gray-50/50">
          {pendingProducts.map(p => (
            <div key={p.id} className="p-8 flex items-center justify-between group hover:bg-gray-50 transition-all duration-300">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden border-2 border-white shadow-2xl shadow-gray-200 group-hover:scale-110 transition-transform">
                  {p.images && <img src={p.images.split(",")[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <p className="font-black text-[#0F172A] text-base leading-tight mb-1">{p.title}</p>
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#F29124]" />
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.vendor?.storeName || "بائع مستقل"}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 transition-all">
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="w-12 h-12 bg-[#F29124]/10 text-[#F29124] rounded-2xl flex items-center justify-center hover:bg-[#F29124] hover:text-white transition-all shadow-xl shadow-[#F29124]/10 active:scale-90"
                  title="عرض تفاصيل المنتج"
                >
                  <span className="material-symbols-rounded text-xl">visibility</span>
                </button>
                <button onClick={() => onProductAction(p.id, "APPROVE")} className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-90" title="قبول">
                  <span className="material-symbols-rounded text-xl">verified</span>
                </button>
                <button onClick={() => setRejectingItem({ id: p.id, type: 'product' })} className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-200/20 active:scale-90" title="رفض مع ذكر السبب">
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
    </>
  );
}
