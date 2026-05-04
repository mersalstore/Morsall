"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface EditOrderModalProps {
  isOpen: boolean;
  order: any;
  onClose: () => void;
  onSuccess: () => void;
  ORDER_STATUSES: any;
}

export default function EditOrderModal({ isOpen, order, onClose, onSuccess, ORDER_STATUSES }: EditOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(order?.status || "PENDING");

  if (!isOpen || !order) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert("فشل تحديث حالة الطلب");
      }
    } catch (err) {
      alert("حدث خطأ أثناء التحديث");
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" dir="rtl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#021D24]/40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#021D24]">تعديل الطلب #{order.id?.slice(-6).toUpperCase()}</h2>
            <button onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
          <div className="p-8 space-y-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">اسم العميل</p>
              <p className="font-bold text-sm text-[#021D24]">{order.customerName}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">تحديث حالة الطلب</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#1089A4] transition-all"
              >
                {Object.keys(ORDER_STATUSES).map(key => (
                  <option key={key} value={key}>{ORDER_STATUSES[key].label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="p-8 bg-gray-50 flex items-center gap-4">
            <button onClick={onClose} className="flex-1 bg-white border border-gray-200 text-gray-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">
              إلغاء
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-[#1089A4] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#1089A4]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
              {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
