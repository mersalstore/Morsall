"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer } from "lucide-react";
import ShippingLabel, { orderToShippingLabel } from "./admin/ShippingLabel";

interface VendorShippingPolicyModalProps {
  isOpen: boolean;
  orders: any[];
  onClose: () => void;
  storeName?: string;
}

export default function VendorShippingPolicyModal({ isOpen, orders, onClose, storeName }: VendorShippingPolicyModalProps) {
  if (!isOpen || !orders || orders.length === 0) return null;

  const handlePrint = () => {
    const printEl = document.getElementById("morsall-print-area");
    if (!printEl) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Get all style and link tags from parent document to apply CSS rules
    const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((el) => el.outerHTML)
      .join("\n");

    printWindow.document.write(`
      <html>
        <head>
          <base href="${window.location.origin}">
          <title>طباعة بوليصات الشحن - مرسال</title>
          ${styles}
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              font-family: 'Segoe UI', Arial, sans-serif;
            }
            @page {
              size: A6 portrait;
              margin: 4mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body class="print-area" dir="rtl">
          ${printEl.innerHTML}
          <script>
            function doPrint() {
              if (window.hasPrinted) return;
              window.hasPrinted = true;
              window.print();
              window.close();
            }
            window.onload = function() {
              setTimeout(doPrint, 500);
            };
            setTimeout(doPrint, 2500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
          className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative z-10 print:rounded-none print:shadow-none print:max-w-full print:max-h-none print:overflow-visible flex flex-col"
        >
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between no-print shrink-0 bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-lg font-black text-[#0F172A]">طباعة بوليصات الشحن</h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">عدد الطلبات: {orders.length}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handlePrint} className="flex items-center gap-2 bg-[#C5A021] text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-[#0F172A] transition-all">
                <Printer size={16} />
                طباعة الكل
              </button>
              <button onClick={onClose} className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
            </div>
          </div>

          <div id="morsall-print-area" className="p-4 print:p-0 bg-white">
            {orders.map((order) => {
              const labelData = orderToShippingLabel({ ...order, storeName });
              return <ShippingLabel key={order.id} data={labelData} />;
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
