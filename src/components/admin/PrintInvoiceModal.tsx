"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReportView from "@/components/ReportView";

interface PrintInvoiceModalProps {
  isOpen: boolean;
  order: any;
  onClose: () => void;
}

export default function PrintInvoiceModal({ isOpen, order, onClose }: PrintInvoiceModalProps) {
  if (!isOpen || !order) return null;

  const data = order.items?.map((item: any) => ({
    productName: item.product?.title || "منتج",
    quantity: item.quantity,
    price: `${item.price} ج.س`,
    total: `${item.price * item.quantity} ج.س`
  })) || [];

  const columns = [
    { key: "productName", label: "المنتج" },
    { key: "quantity", label: "الكمية" },
    { key: "price", label: "سعر الوحدة" },
    { key: "total", label: "الإجمالي" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-6" dir="rtl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#021D24]/80 backdrop-blur-sm print:hidden" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative z-10 print:m-0 print:p-0 print:shadow-none print:max-w-full print:h-auto print:overflow-visible">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between print:hidden sticky top-0 bg-white/90 backdrop-blur-md z-20">
            <h2 className="text-2xl font-black text-[#021D24]">طباعة الفاتورة #{order.id?.slice(-6).toUpperCase()}</h2>
            <button onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
          
          <div className="p-8 print:p-0">
             <ReportView 
               title="فاتورة طلبية"
               subtitle={`فاتورة للعميل: ${order.customerName} - هاتف: ${order.phone}`}
               data={data}
               columns={columns}
             />
             <div className="mt-8 text-left bg-gray-50 p-6 rounded-2xl print:bg-transparent print:border">
                <p className="text-gray-400 font-bold mb-2">الإجمالي النهائي</p>
                <p className="text-4xl font-black text-[#021D24]">{order.totalAmount?.toLocaleString()} <span className="text-lg">ج.س</span></p>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
