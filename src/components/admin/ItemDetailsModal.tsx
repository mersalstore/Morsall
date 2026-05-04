"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ItemDetailsModalProps {
  isOpen: boolean;
  type: "users" | "vendors";
  item: any;
  onClose: () => void;
}

export default function ItemDetailsModal({ isOpen, type, item, onClose }: ItemDetailsModalProps) {
  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" dir="rtl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#021D24]/40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#021D24]">
              {type === "users" ? "تفاصيل العميل" : "تفاصيل المورد"}
            </h2>
            <button onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1089A4]/10 to-[#021D24]/10 text-[#021D24] flex items-center justify-center font-black text-3xl shadow-inner border border-white">
                {(item.name || item.storeName || "?")[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-black text-[#021D24]">{item.name || item.storeName}</h3>
                <p className="text-gray-400 text-sm font-bold mt-1">{item.email || (item.user?.email)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">رقم الهاتف</span>
                <span className="text-sm font-bold text-[#021D24]" dir="ltr">{item.phone || "غير متوفر"}</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  {type === "users" ? "تاريخ التسجيل" : "المدينة"}
                </span>
                <span className="text-sm font-bold text-[#021D24]">
                  {type === "users" 
                    ? new Date(item.createdAt).toLocaleDateString("ar-EG") 
                    : item.location || item.city || "غير متوفر"}
                </span>
              </div>
              {type === "vendors" && (
                <div className="bg-gray-50 rounded-2xl p-4 col-span-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">حالة المتجر</span>
                  <span className="text-sm font-bold text-[#021D24]">{item.status === 'APPROVED' ? 'متجر معتمد' : item.status}</span>
                </div>
              )}
              {type === "users" && (
                <div className="bg-gray-50 rounded-2xl p-4 col-span-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">الصلاحية (الرتبة)</span>
                  <span className="text-sm font-bold text-[#021D24]">{item.role}</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-8 bg-gray-50 flex items-center justify-end">
            <button onClick={onClose} className="bg-white border border-gray-200 text-gray-600 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
