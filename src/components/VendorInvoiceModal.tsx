"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, Download, MapPin, Phone, Store, CreditCard } from "lucide-react";

interface VendorInvoiceModalProps {
  isOpen: boolean;
  order: any;
  onClose: () => void;
  storeName?: string;
}

export default function VendorInvoiceModal({ isOpen, order, onClose, storeName }: VendorInvoiceModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => window.print();

  const subtotal = order.vendorItems?.reduce((sum: number, item: any) => sum + (item.priceAtTime * item.quantity), 0) || 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 print:p-0" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm print:hidden"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative z-10 print:rounded-none print:shadow-none print:max-w-full print:max-h-none print:overflow-visible flex flex-col font-sans"
        >
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between print:hidden shrink-0 bg-white sticky top-0 z-10">
            <div>
               <h2 className="text-lg font-black text-[#0F172A]">فاتورة مبيعات</h2>
               <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">#{order.id?.slice(-6).toUpperCase()}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-[#C5A021] text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-[#0F172A] transition-all"
              >
                <Printer size={16} />
                طباعة
              </button>
              <button onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* INVOICE CONTENT */}
          <div className="p-10 print:p-6 bg-white overflow-visible">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b-4 border-[#0F172A] pb-8 mb-8">
               <div>
                  <h1 className="text-3xl font-black text-[#0F172A] mb-2">{storeName || "متجري"}</h1>
                  <div className="flex items-center gap-2 text-[#C5A021]">
                     <Store size={14} />
                     <p className="text-xs font-black uppercase tracking-widest">عبر منصة مرسال</p>
                  </div>
               </div>
               <div className="text-left bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">رقم الفاتورة</p>
                  <p className="font-mono font-black text-xl text-[#0F172A]">#{order.id?.slice(-6).toUpperCase()}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">{new Date(order.createdAt).toLocaleDateString("ar-EG")}</p>
               </div>
            </div>

            {/* Billing Grid */}
            <div className="grid grid-cols-2 gap-8 mb-10">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <span className="w-2 h-2 bg-[#C5A021] rounded-full" />
                     المشتري
                  </p>
                  <p className="font-black text-[#0F172A] text-lg mb-2">{order.customerName}</p>
                  <div className="space-y-1.5">
                     <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone size={12} className="text-gray-300" />
                        <span dir="ltr">{order.phone}</span>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin size={12} className="text-gray-300" />
                        <span>{order.city} - {order.district || ""}</span>
                     </div>
                  </div>
               </div>
               <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">طريقة الدفع</p>
                  <div className="flex items-center gap-3">
                     <CreditCard className="text-[#C5A021]" size={20} />
                     <p className="font-black text-[#0F172A]">الدفع عند الاستلام (COD)</p>
                  </div>
               </div>
            </div>

            {/* Table */}
            <div className="mb-10">
               <table className="w-full text-right">
                  <thead>
                     <tr className="bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest">
                        <th className="px-6 py-4 rounded-tr-2xl">المنتج</th>
                        <th className="px-6 py-4 text-center">الكمية</th>
                        <th className="px-6 py-4 text-center">سعر الوحدة</th>
                        <th className="px-6 py-4 text-left rounded-tl-2xl">الإجمالي</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y border-x border-b rounded-b-2xl overflow-hidden">
                     {order.vendorItems?.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-4 font-black text-[#0F172A] text-sm">{item.productTitle}</td>
                           <td className="px-6 py-4 text-center font-bold text-gray-600">{item.quantity}</td>
                           <td className="px-6 py-4 text-center text-xs text-gray-400">{item.priceAtTime.toLocaleString()} ج.س</td>
                           <td className="px-6 py-4 text-left font-black text-[#C5A021]">{ (item.priceAtTime * item.quantity).toLocaleString() } ج.س</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end">
               <div className="w-full max-w-xs space-y-3 bg-[#0F172A] p-8 rounded-[2rem] text-white shadow-2xl">
                  <div className="flex justify-between items-center text-white/60">
                     <span className="text-xs font-bold">المجموع الفرعي</span>
                     <span className="font-bold">{subtotal.toLocaleString()} ج.س</span>
                  </div>
                  <div className="flex justify-between items-center text-white/60">
                     <span className="text-xs font-bold">رسوم التوصيل</span>
                     <span className="font-bold">0 ج.س</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                     <span className="text-sm font-black">الإجمالي الكلي</span>
                     <span className="text-2xl font-black text-[#C5A021]">{subtotal.toLocaleString()} ج.س</span>
                  </div>
               </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-12 pt-8 border-t border-dashed border-gray-200 text-center">
               <p className="text-xs font-bold text-gray-400 mb-1">شكراً لثقتك بمتجرنا!</p>
               <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em]">www.morsall.com</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
