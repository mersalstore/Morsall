"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShippingLabel, { orderToShippingLabel } from "./ShippingLabel";

type PrintFormat = "thermal" | "a4";

interface PrintPolicyModalProps {
  isOpen: boolean;
  orders: any[];
  onClose: () => void;
}

// CSS injected per format — chosen at print time via body class
const PRINT_STYLES: Record<PrintFormat, string> = {
  thermal: `
    #morsall-print-holder { display: none; }
    @media print {
      body.morsall-printing > *:not(#morsall-print-holder) { display: none !important; }
      body.morsall-printing #morsall-print-holder { display: block !important; }
      body.morsall-printing #morsall-print-holder * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: 100mm auto; margin: 0; }
      #morsall-print-holder .label-wrapper {
        page-break-after: always;
        break-after: page;
      }
    }
  `,
  a4: `
    #morsall-print-holder { display: none; }
    @media print {
      body.morsall-printing > *:not(#morsall-print-holder) { display: none !important; }
      body.morsall-printing #morsall-print-holder { display: block !important; background: white; }
      body.morsall-printing #morsall-print-holder * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4 portrait; margin: 10mm; }
      /* Two labels per A4 page — flex-wrap handles overflow */
      #morsall-print-holder .a4-page {
        display: flex;
        flex-wrap: wrap;
        gap: 6mm;
        justify-content: flex-start;
        align-items: flex-start;
        page-break-after: always;
        break-after: page;
      }
      #morsall-print-holder .a4-page .label-wrapper {
        width: calc(50% - 4mm);
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  `,
};

export default function PrintPolicyModal({ isOpen, orders, onClose }: PrintPolicyModalProps) {
  const [format, setFormat] = useState<PrintFormat>("thermal");

  if (!isOpen || !orders || orders.length === 0) return null;

  const executePrint = (idsToInclude?: string[]) => {
    const printEl = document.getElementById("morsall-print-area");
    if (!printEl) { window.print(); return; }

    const old = document.getElementById("morsall-print-holder");
    if (old) old.remove();

    const holder = document.createElement("div");
    holder.id = "morsall-print-holder";

    if (format === "a4") {
      // Group labels into pairs for A4 layout
      const allWrappers = Array.from(
        printEl.querySelectorAll<HTMLElement>(".label-wrapper")
      ).filter((el) => {
        if (!idsToInclude) return true;
        return idsToInclude.some((id) => el.dataset.orderId === id);
      });
      const pages: HTMLElement[][] = [];
      for (let i = 0; i < allWrappers.length; i += 2) {
        pages.push(allWrappers.slice(i, i + 2));
      }
      pages.forEach((pair) => {
        const page = document.createElement("div");
        page.className = "a4-page";
        pair.forEach((w) => page.appendChild(w.cloneNode(true)));
        holder.appendChild(page);
      });
    } else {
      // Thermal: each label is its own page
      const allWrappers = Array.from(
        printEl.querySelectorAll<HTMLElement>(".label-wrapper")
      ).filter((el) => {
        if (!idsToInclude) return true;
        return idsToInclude.some((id) => el.dataset.orderId === id);
      });
      allWrappers.forEach((w) => holder.appendChild(w.cloneNode(true)));
    }

    document.body.appendChild(holder);
    document.body.classList.add("morsall-printing");

    const cleanup = () => {
      document.body.classList.remove("morsall-printing");
      const h = document.getElementById("morsall-print-holder");
      if (h && h.parentNode) h.parentNode.removeChild(h);
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);

    setTimeout(() => {
      window.print();
      setTimeout(cleanup, 1500);
    }, 220);
  };

  return (
    <AnimatePresence>
      {/* Dynamic print CSS — swapped when format changes */}
      <style key={format} dangerouslySetInnerHTML={{ __html: PRINT_STYLES[format] }} />

      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 print:p-0" dir="rtl">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm print:hidden"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-[2rem] shadow-2xl relative z-10 print:rounded-none print:shadow-none print:max-w-full print:max-h-none print:overflow-visible flex flex-col font-sans"
        >
          {/* ── Toolbar ── */}
          <div className="p-5 border-b border-gray-100 flex flex-col gap-3 print:hidden sticky top-0 bg-white z-20 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-[#0F172A]">طباعة بوليصات الشحن</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  عدد الطلبات: {orders.length}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => executePrint()}
                  className="flex items-center gap-2 bg-[#C5A021] text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-[#0F172A] transition-all"
                >
                  <span className="material-symbols-rounded text-base">print</span>
                  طباعة الكل
                </button>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <span className="material-symbols-rounded">close</span>
                </button>
              </div>
            </div>

            {/* Format selector */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black text-gray-400">حجم الطباعة:</span>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 text-[11px] font-black">
                <button
                  onClick={() => setFormat("thermal")}
                  className={`px-4 py-2 flex items-center gap-1.5 transition-all ${
                    format === "thermal"
                      ? "bg-[#0F172A] text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-rounded text-sm">receipt_long</span>
                  حراري (80mm)
                </button>
                <button
                  onClick={() => setFormat("a4")}
                  className={`px-4 py-2 flex items-center gap-1.5 transition-all border-r border-slate-200 ${
                    format === "a4"
                      ? "bg-[#0F172A] text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-rounded text-sm">description</span>
                  A4 (ورق عادي)
                </button>
              </div>
              <span className="text-[10px] text-gray-400">
                {format === "thermal"
                  ? "لفة رول حراري — بوليصة واحدة لكل صفحة"
                  : "A4 عادي — بوليصتان في الصفحة الواحدة"}
              </span>
            </div>
          </div>

          {/* ── LABELS PREVIEW ── */}
          <div
            id="morsall-print-area"
            className={`p-6 print:p-0 bg-gray-50 print:bg-white print-area flex flex-col items-center ${
              format === "a4" ? "gap-0" : "space-y-8"
            }`}
          >
            {format === "a4" ? (
              // A4: two-up preview
              <div className="flex flex-wrap gap-4 justify-center w-full">
                {orders.map((order) => {
                  const labelData = orderToShippingLabel(order);
                  const itemQty = (order.items || order.orderItems || []).reduce(
                    (sum: number, it: any) => sum + (Number(it.quantity) || 0),
                    0
                  );
                  const rawCount = itemQty || Number(order.quantity) || Number(order.packageCount) || 1;
                  const copies = Math.min(Math.max(1, Math.floor(rawCount)), 50);
                  return (
                    <div
                      key={order.id}
                      className="label-wrapper relative group"
                      data-order-id={order.id}
                    >
                      <ShippingLabel data={labelData} copies={copies} />
                      {/* Per-label print button */}
                      <button
                        onClick={() => executePrint([order.id])}
                        title="طباعة هذه البوليصة فقط"
                        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] text-white rounded-lg p-1 text-[10px] flex items-center gap-1 z-10 print:hidden"
                      >
                        <span className="material-symbols-rounded text-xs">print</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Thermal: stacked preview
              orders.map((order) => {
                const labelData = orderToShippingLabel(order);
                const itemQty = (order.items || order.orderItems || []).reduce(
                  (sum: number, it: any) => sum + (Number(it.quantity) || 0),
                  0
                );
                const rawCount = itemQty || Number(order.quantity) || Number(order.packageCount) || 1;
                const copies = Math.min(Math.max(1, Math.floor(rawCount)), 50);
                return (
                  <div
                    key={order.id}
                    className="label-wrapper relative group"
                    data-order-id={order.id}
                  >
                    <ShippingLabel data={labelData} copies={copies} />
                    {/* Per-label print button */}
                    <button
                      onClick={() => executePrint([order.id])}
                      title="طباعة هذه البوليصة فقط"
                      className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] text-white rounded-lg p-1 text-[10px] flex items-center gap-1 z-10 print:hidden"
                    >
                      <span className="material-symbols-rounded text-xs">print</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
