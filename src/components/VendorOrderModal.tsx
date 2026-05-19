"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { X, Save, User, MapPin, CreditCard, Package, Truck, Clock, CheckCircle2 } from "lucide-react";

interface VendorOrderModalProps {
  isOpen: boolean;
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}

const ORDER_STATUS_MAP: Record<string, { label: string; icon: string; color: string }> = {
  "PENDING": { label: "قيد الانتظار", icon: "pending", color: "from-yellow-400 to-yellow-600" },
  "PROCESSING": { label: "قيد التجهيز", icon: "sync", color: "from-blue-400 to-blue-600" },
  "SHIPPED": { label: "تم الشحن", icon: "local_shipping", color: "from-purple-400 to-purple-600" },
  "DELIVERED": { label: "تم التوصيل", icon: "check_circle", color: "from-green-400 to-green-600" },
  "CANCELLED": { label: "ملغي", icon: "cancel", color: "from-red-400 to-red-600" },
};

export default function VendorOrderModal({ isOpen, order, onClose, onSuccess }: VendorOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("PENDING");

  useEffect(() => {
    if (order) {
      setStatus(order.status || "PENDING");
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "فشل تحديث حالة الطلب");
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm" 
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col font-sans"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-xl font-black text-[#0F172A]">
                تفاصيل الطلب <span className="text-[#C5A021] font-mono">#{order.id?.slice(-6).toUpperCase()}</span>
              </h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                {new Date(order.createdAt).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Customer & Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-lg bg-[#C5A021]/10 text-[#C5A021] flex items-center justify-center">
                      <User size={16} />
                   </div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">بيانات العميل</p>
                </div>
                <p className="font-black text-[#0F172A]">{order.customerName}</p>
                <p className="text-xs text-gray-400 mt-1 font-bold" dir="ltr">{order.phone}</p>
              </div>

              <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
                      <MapPin size={16} />
                   </div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">العنوان</p>
                </div>
                <p className="font-bold text-[#0F172A] text-sm">{order.city}</p>
                <p className="text-xs text-gray-400 mt-1">{order.district || "—"}</p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Package size={16} />
                 </div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المنتجات المطلوبة</p>
              </div>
              <div className="space-y-2">
                {order.vendorItems?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                    <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0">
                       {item.image ? (
                         <img src={item.image} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-200">
                           <Package size={24} />
                         </div>
                       )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-black text-[#0F172A] text-sm truncate group-hover:text-[#C5A021] transition-colors">{item.productTitle}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold">الكمية: {item.quantity}</span>
                        {item.size && <span className="text-xs bg-[#C5A021]/10 text-[#C5A021] px-2 py-0.5 rounded-md font-bold">المقاس: {item.size}</span>}
                        {item.color && <span className="text-xs bg-[#F29124]/10 text-[#F29124] px-2 py-0.5 rounded-md font-bold">اللون: {item.color}</span>}
                        {item.variationCombination && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-bold">{item.variationCombination}</span>}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-black text-[#0F172A] text-sm">{(item.priceAtTime * item.quantity).toLocaleString()} ج.س</p>
                      <p className="text-[10px] text-gray-400">{item.priceAtTime.toLocaleString()} للقطعة</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F29124]/10 text-[#F29124] flex items-center justify-center">
                     <Clock size={16} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تحديث حالة الطلب</p>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(ORDER_STATUS_MAP).map(([key, s]) => (
                    <button
                      key={key}
                      onClick={() => setStatus(key)}
                      className={cn(
                        "p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                        status === key 
                          ? "bg-[#C5A021] border-[#C5A021] text-white shadow-lg shadow-[#C5A021]/20" 
                          : "bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50"
                      )}
                    >
                       <span className="material-symbols-rounded text-lg">{s.icon}</span>
                       <span className="text-[10px] font-black whitespace-nowrap">{s.label}</span>
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 border-t flex items-center gap-4 shrink-0">
            <button onClick={onClose} className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all">
              إغاء
            </button>
            <button 
              onClick={handleUpdateStatus} 
              disabled={loading}
              className="flex-[2] bg-[#C5A021] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-[#C5A021]/20 hover:bg-[#0F172A] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  حفظ التعديلات
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
