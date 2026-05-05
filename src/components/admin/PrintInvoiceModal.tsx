"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PrintInvoiceModalProps {
  isOpen: boolean;
  order: any;
  onClose: () => void;
}

export default function PrintInvoiceModal({ isOpen, order, onClose }: PrintInvoiceModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => window.print();

  const subtotal = order.items?.reduce((sum: number, item: any) => sum + (item.priceAtTime * item.quantity), 0) || 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 print:p-0 print-modal-container" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#021D24]/80 backdrop-blur-sm print:hidden"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-[2rem] shadow-2xl relative z-10 print:rounded-none print:shadow-none print:max-w-full print:max-h-none print:overflow-visible"
        >
          {/* Print Toolbar - hidden when printing */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between print:hidden sticky top-0 bg-white z-20">
            <h2 className="text-lg font-black text-[#021D24]">
              بوليصة شحن - #{order.id?.slice(-8).toUpperCase()}
            </h2>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-[#1089A4] text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-[#021D24] transition-all"
              >
                <span className="material-symbols-rounded text-base">print</span>
                طباعة
              </button>
              <button onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
          </div>

          {/* WAYBILL CONTENT */}
          <div id="shipping-label-print" className="p-8 print:p-6">
            {/* Logo / Brand Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-4 border-[#021D24]">
              <div>
                <h1 className="text-3xl font-black text-[#021D24]">مـرسـال</h1>
                <p className="text-xs font-bold text-[#1089A4] uppercase tracking-widest">Morsall Logistics</p>
              </div>
              <div className="text-left">
                <div className="bg-[#021D24] text-white px-5 py-3 rounded-2xl print:rounded-lg">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">رقم الشحنة</p>
                  <p className="font-mono font-black text-2xl">{order.id?.slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Sender / Receiver Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Sender */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 bg-[#1089A4] rounded-full inline-block" />
                  المرسل / مرسال ستور
                </p>
                <p className="font-black text-[#021D24]">مرسال للتجارة الإلكترونية</p>
                <p className="text-sm text-gray-600 mt-1">الخرطوم، السودان</p>
                <p className="text-sm font-bold text-[#1089A4]">morsall.com</p>
              </div>

              {/* Receiver */}
              <div className="bg-[#021D24] p-5 rounded-2xl text-white">
                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 bg-[#F29124] rounded-full inline-block" />
                  المستلم
                </p>
                <p className="font-black text-xl text-white">{order.customerName || order.customer?.name}</p>
                <p className="text-[#F29124] font-bold mt-1" dir="ltr">{order.phone}</p>
                <p className="text-white/70 text-sm mt-1">{order.city} - {order.district}</p>
                {order.street && <p className="text-white/60 text-xs mt-0.5">{order.street}</p>}
              </div>
            </div>

            {/* Products Table */}
            <div className="mb-8">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">محتويات الشحنة</p>
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-[#021D24] text-white text-[10px] font-black uppercase tracking-widest">
                    <th className="px-4 py-3 rounded-tr-2xl">المنتج</th>
                    <th className="px-4 py-3 text-center">الكمية</th>
                    <th className="px-4 py-3 text-center">سعر الوحدة</th>
                    <th className="px-4 py-3 text-center rounded-tl-2xl">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-bold text-[#021D24] text-sm">{item.product?.title || "منتج"}</td>
                      <td className="px-4 py-3 text-center font-black text-[#021D24]">{item.quantity}</td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-gray-600">{item.priceAtTime?.toLocaleString()} ج.س</td>
                      <td className="px-4 py-3 text-center font-black text-[#021D24]">{(item.priceAtTime * item.quantity).toLocaleString()} ج.س</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-500">المجموع الفرعي</span>
                  <span className="font-black text-[#021D24]">{subtotal.toLocaleString()} ج.س</span>
                </div>
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-500">رسوم التوصيل</span>
                    <span className="font-black text-[#021D24]">{order.shippingCost?.toLocaleString()} ج.س</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-black text-[#021D24] text-lg">الإجمالي الكلي</span>
                  <span className="font-black text-[#1089A4] text-2xl">{order.totalAmount?.toLocaleString()} ج.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-500 text-sm">طريقة الدفع</span>
                  <span className="font-black text-sm text-[#021D24]">
                    {order.paymentMethod === "COD" ? "💵 الدفع عند الاستلام" : "🏦 تحويل بنكي"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-300">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase">تاريخ الإصدار</p>
                <p className="font-bold text-sm text-[#021D24]">{new Date(order.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              {order.estimatedDays && (
                <div className="text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase">وقت التوصيل المتوقع</p>
                  <p className="font-black text-[#F29124] text-lg">{order.estimatedDays} أيام</p>
                </div>
              )}
              <div className="text-left">
                <p className="text-[9px] font-black text-gray-400 uppercase">توقيع المستلم</p>
                <div className="w-32 h-8 border-b-2 border-gray-400 mt-2" />
              </div>
            </div>

            {/* Barcode placeholder */}
            <div className="mt-6 text-center">
              <p className="font-mono text-xs text-gray-300 tracking-[0.5em]">{order.id}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
