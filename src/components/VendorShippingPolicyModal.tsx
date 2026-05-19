"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, MapPin, Phone, Store, User } from "lucide-react";
import Barcode from "react-barcode";

interface VendorShippingPolicyModalProps {
  isOpen: boolean;
  orders: any[]; // Supports multiple orders for bulk print
  onClose: () => void;
  storeName?: string;
}

export default function VendorShippingPolicyModal({ isOpen, orders, onClose, storeName }: VendorShippingPolicyModalProps) {
  if (!isOpen || !orders || orders.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

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
               <h2 className="text-lg font-black text-[#0F172A]">طباعة بوليصات الشحن</h2>
               <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">عدد الطلبات: {orders.length}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-[#C5A021] text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-[#0F172A] transition-all"
              >
                <Printer size={16} />
                طباعة الكل
              </button>
              <button onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* POLICIES CONTENT */}
          <div className="p-8 print:p-0 bg-white">
            {orders.map((order, idx) => (
              <div 
                key={order.id} 
                className={`border-2 border-dashed border-gray-200 p-8 rounded-3xl mb-8 last:mb-0 print:mb-0 print:border-solid print:border-b-2 print:border-gray-300 print:rounded-none print:h-screen print:flex print:flex-col print:justify-center ${idx > 0 ? 'print:break-before-page' : ''}`}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white">
                      <Store size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#0F172A]">{storeName || "متجري"}</h3>
                      <p className="text-[10px] text-gray-400 font-bold">بوليصة شحن عبر مرسال</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">رقم الطلب</p>
                    <p className="text-xl font-black text-[#C5A021]">#{order.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>

                {/* Main Label Body */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Recipient info */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 text-[#C5A021] mb-3">
                        <User size={16} />
                        <p className="text-[10px] font-black uppercase tracking-widest">المستلم</p>
                      </div>
                      <p className="text-lg font-black text-[#0F172A] mb-1">{order.customerName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Phone size={14} />
                        <span dir="ltr">{order.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={14} />
                        <span>{order.city} - {order.district || order.street || "—"}</span>
                      </div>
                    </div>

                    <div className="bg-[#0F172A] p-6 rounded-2xl text-white">
                      <p className="text-[10px] font-black text-white/40 uppercase mb-2">المبلغ المطلوب تحصيله (COD)</p>
                      <p className="text-3xl font-black text-[#C5A021]">{order.totalAmount.toLocaleString()} <span className="text-xs">ج.س</span></p>
                    </div>
                  </div>

                  {/* Barcode & Extra */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl p-6 bg-white">
                    <Barcode 
                      value={order.id.slice(-12).toUpperCase()} 
                      width={1.5} 
                      height={60} 
                      fontSize={12}
                      background="#ffffff"
                    />
                    <p className="text-[10px] text-gray-400 font-bold mt-4 text-center">قم بمسح الباركود للتأكد من حالة الطلب</p>
                  </div>
                </div>

                {/* Items Summary (Optional for label but good for vendor) */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">محتويات الشحنة</p>
                  <div className="space-y-2">
                    {order.vendorItems?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-600">{item.quantity}x {item.productTitle}</span>
                        <span className="text-gray-400">{item.priceAtTime.toLocaleString()} ج.س</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 text-center text-[8px] text-gray-300 font-black uppercase tracking-[0.4em]">
                  MORSALL LOGISTICS - منصة مرسال للتجارة الإلكترونية
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
