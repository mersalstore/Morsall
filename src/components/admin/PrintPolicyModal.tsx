"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Barcode from "react-barcode";

interface PrintPolicyModalProps {
  isOpen: boolean;
  orders: any[];
  onClose: () => void;
}

export default function PrintPolicyModal({ isOpen, orders, onClose }: PrintPolicyModalProps) {
  if (!isOpen || !orders || orders.length === 0) return null;

  const handlePrint = () => {
    const printEl = document.getElementById("morsall-print-area");
    if (!printEl) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>طباعة بوليصات الشحن - مرسال</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              font-family: 'Segoe UI', Arial, sans-serif;
            }
            @page {
              size: 100mm 150mm;
              margin: 0;
            }
            .print-label-container {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
              page-break-after: always;
              break-after: page;
              padding: 0;
            }
            .print-label-container:last-child {
              page-break-after: avoid;
              break-after: avoid;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body dir="rtl">
          \${printEl.innerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 print:p-0" dir="rtl">
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
          <div className="p-5 border-b border-gray-100 flex items-center justify-between print:hidden sticky top-0 bg-white z-20 shrink-0">
            <div>
              <h2 className="text-lg font-black text-[#0F172A]">طباعة بوليصات الشحن</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                عدد الطلبات: {orders.length}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
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

          {/* ── LABELS ── */}
          <div id="morsall-print-area" className="p-6 print:p-0 bg-gray-50 print:bg-white space-y-8 print:space-y-0 print-area">
            {orders.map((order, idx) => {
              const orderId = (order.id || "ORD-000000").toUpperCase();
              const trackingNumber = (order.trackingNumber || order.id || "TRK-000000").toUpperCase();
              const trackingUrl = `https://morsall.com/track?id=${orderId}`;

              const items = order.items || order.orderItems || [];
              const content = items
                .map((it: any) => `${it.product?.title || it.productTitle || it.name || ""} (${it.quantity || 1})`)
                .join("، ") || orderId;

              // Calculate total weight and max dimensions dynamically from items if order attributes are empty
              let totalWeight = 0;
              let maxLength = 0;
              let maxWidth = 0;
              let maxHeight = 0;

              if (items && items.length > 0) {
                items.forEach((it: any) => {
                  const qty = it.quantity || 1;
                  const p = it.product || {};
                  
                  // Add weight
                  const w = parseFloat(p.weight || it.weight || 0);
                  totalWeight += w * qty;

                  // Get max of dimensions (standard packages approach)
                  const l = parseFloat(p.length || it.length || 0);
                  const wd = parseFloat(p.width || it.width || 0);
                  const h = parseFloat(p.height || it.height || 0);
                  
                  if (l > maxLength) maxLength = l;
                  if (wd > maxWidth) maxWidth = wd;
                  if (h > maxHeight) maxHeight = h;
                });
              }

              // Fallback to order properties if any
              const finalWeight = order.weight || totalWeight || "0";
              const finalLength = order.length || maxLength || "0";
              const finalWidth = order.width || maxWidth || "0";
              const finalHeight = order.height || maxHeight || "0";

              const paymentLabel =
                order.paymentMethod === "cod" ? "الدفع عند الاستلام" :
                order.paymentMethod === "bank_transfer" ? "تحويل بنكي" :
                order.paymentMethod === "prepaid" ? "مدفوع مسبقاً" :
                order.paymentMethod || "—";

              const isCod = order.paymentMethod === "cod";
              const collectionAmount = isCod
                ? `${(order.total || order.totalAmount || 0).toLocaleString()} SDG`
                : "0";

              const address = order.address || {};
              const receiverAddress = [
                address.street, address.area || address.district,
                address.postalCode ? `ر.ب ${address.postalCode}` : "",
                address.city || order.city, address.state
              ].filter(Boolean).join("، ") || order.city || "—";

              const dateStr = new Date(order.createdAt || Date.now())
                .toLocaleDateString("ar", { year: "numeric", month: "2-digit", day: "2-digit" }) +
                " " +
                new Date(order.createdAt || Date.now())
                .toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });

              return (
                <div
                  key={order.id}
                  className="print-label-container print:break-before-page"
                  style={{ background: "white" }}
                >
                  {/* LABEL BODY */}
                  <div
                    dir="rtl"
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      margin: "0 auto",
                      padding: "8px",
                      fontFamily: "'Segoe UI', 'Arial', sans-serif",
                      color: "#000",
                      background: "#fff",
                    }}
                  >
                    {/* 1. Header (Flex layout) */}
                    <div style={{ display: "flex", justifyContent: "between", alignItems: "center", borderBottom: "2px solid #000", paddingBottom: "6px", marginBottom: "6px" }}>
                      {/* Right side: Courier Logo */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                        <img
                          src="/footer-logo.png"
                          alt="Morsall"
                          style={{
                            height: "32px",
                            width: "auto",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                        <span style={{ fontSize: "7px", fontWeight: "bold", color: "#000", marginTop: "2px" }}>المشغل المرخص: مرسال للخدمات اللوجستية</span>
                      </div>
                      
                      {/* Left side: Large Barcode and Tracking Number */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "end", flexGrow: 1 }}>
                        <Barcode
                          value={trackingNumber}
                          width={1.2}
                          height={40}
                          fontSize={9}
                          background="transparent"
                          lineColor="#000"
                        />
                      </div>
                    </div>

                    {/* 2. Main Grid Table */}
                    <table style={{ width: "100%", borderCollapse: "collapse", border: "1.5px solid #000", fontSize: "9px" }}>
                      <tbody>
                        {/* Row 1: Date (Right) | Licensed Operator (Left) */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td style={{ width: "50%", borderLeft: "1px solid #000", padding: "4px", direction: "rtl", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>التاريخ (Date):</strong><br />
                            <span style={{ fontSize: "10px", fontWeight: "bold" }}>{dateStr}</span>
                          </td>
                          <td style={{ width: "50%", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>المشغل المرخص (Operator):</strong><br />
                            <span style={{ fontSize: "10px", fontWeight: "bold" }}>مرسال كير (Morsall Care)</span>
                          </td>
                        </tr>

                        {/* Row 2: From City (Right) | To City (Left) */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td style={{ width: "50%", borderLeft: "1px solid #000", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>من (From City):</strong><br />
                            <span style={{ fontSize: "14px", fontWeight: "900" }}>الخرطوم (Khartoum)</span>
                          </td>
                          <td style={{ width: "50%", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>إلى (To City):</strong><br />
                            <span style={{ fontSize: "16px", fontWeight: "900", background: "#000", color: "#fff", padding: "1px 6px", borderRadius: "2px", display: "inline-block" }}>
                              {order.city || address.city || "—"}
                            </span>
                          </td>
                        </tr>

                        {/* Row 3: Sender Name (Right) | Receiver Name (Left) */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td style={{ width: "50%", borderLeft: "1px solid #000", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>اسم المرسل (Sender Name):</strong><br />
                            <span style={{ fontSize: "11px", fontWeight: "bold" }}>مرسال ستور (Morsall Store)</span>
                          </td>
                          <td style={{ width: "50%", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>اسم المستقبل (Receiver Name):</strong><br />
                            <span style={{ fontSize: "11px", fontWeight: "bold" }}>{order.customerName || "—"}</span>
                          </td>
                        </tr>

                        {/* Row 4: Sender Region (Right) | Receiver Region (Left) */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td style={{ width: "50%", borderLeft: "1px solid #000", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>منطقة المرسل (Sender Region):</strong><br />
                            <span style={{ fontSize: "10px", fontWeight: "bold" }}>الخرطوم - حي الرياض</span>
                          </td>
                          <td style={{ width: "50%", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>منطقة المستقبل (Receiver Region):</strong><br />
                            <span style={{ fontSize: "10px", fontWeight: "bold" }}>{address.state || order.city || "—"}</span>
                          </td>
                        </tr>

                        {/* Row 5: Sender Detailed Address | Receiver Detailed Address */}
                        <tr style={{ borderBottom: "1px solid #000", height: "45px" }}>
                          <td style={{ width: "50%", borderLeft: "1px solid #000", padding: "4px", textAlign: "right", verticalAlign: "top" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>العنوان التفصيلي (Sender Address):</strong><br />
                            <span style={{ fontSize: "8px", lineHeight: "1.2" }}>شارع الستين، عمارة مرسال، الرياض، الخرطوم</span>
                          </td>
                          <td style={{ width: "50%", padding: "4px", textAlign: "right", verticalAlign: "top" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>العنوان التفصيلي (Receiver Address):</strong><br />
                            <span style={{ fontSize: "8px", lineHeight: "1.2" }}>{receiverAddress}</span>
                          </td>
                        </tr>

                        {/* Row 6: Sender Phone | Receiver Phone */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td style={{ width: "50%", borderLeft: "1px solid #000", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>هاتف المرسل (Sender Phone):</strong><br />
                            <span style={{ fontSize: "11px", fontWeight: "bold", direction: "ltr", display: "inline-block" }}>+249 912 345 678</span>
                          </td>
                          <td style={{ width: "50%", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>هاتف المستقبل (Receiver Phone):</strong><br />
                            <span style={{ fontSize: "12px", fontWeight: "950", direction: "ltr", display: "inline-block" }}>{order.phone || "—"}</span>
                          </td>
                        </tr>

                        {/* Row 7: Payment Type | COD Amount */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td style={{ width: "50%", borderLeft: "1px solid #000", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>نوع الدفع (Payment Type):</strong><br />
                            <span style={{ fontSize: "11px", fontWeight: "bold", background: "#000", color: "#fff", padding: "1px 4px", borderRadius: "2px", display: "inline-block" }}>
                              {paymentLabel}
                            </span>
                          </td>
                          <td style={{ width: "50%", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>قيمة التحصيل (COD Amount):</strong><br />
                            <span style={{ fontSize: "14px", fontWeight: "950", color: isCod ? "#000" : "#555" }}>{collectionAmount}</span>
                          </td>
                        </tr>

                        {/* Row 8: Service Type | Packages Count */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td style={{ width: "50%", borderLeft: "1px solid #000", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>نوع الخدمة (Service Type):</strong><br />
                            <span style={{ fontSize: "10px", fontWeight: "bold" }}>توصيل قياسي (Standard)</span>
                          </td>
                          <td style={{ width: "50%", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>الطرود (Packages):</strong><br />
                            <span style={{ fontSize: "11px", fontWeight: "bold" }}>1 of 1</span>
                          </td>
                        </tr>

                        {/* Row 9: Volumetric Weight | Actual Weight */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td style={{ width: "50%", borderLeft: "1px solid #000", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>الوزن الحجمي (Volumetric):</strong><br />
                            <span style={{ fontSize: "10px", fontWeight: "bold" }}>—</span>
                          </td>
                          <td style={{ width: "50%", padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>الوزن الفعلي (Weight):</strong><br />
                            <span style={{ fontSize: "11px", fontWeight: "bold" }}>{finalWeight} kg</span>
                          </td>
                        </tr>

                        {/* Row 10: Delivery Attempts */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td colSpan={2} style={{ padding: "4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>عدد محاولات التوصيل (Attempts):</strong>
                            <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                              {[1, 2, 3].map(i => (
                                <div key={i} style={{ width: "16px", height: "16px", border: "1px solid #000", borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: "bold" }}>{i}</div>
                              ))}
                            </div>
                          </td>
                        </tr>

                        {/* Full Width Row 1: Content */}
                        <tr style={{ borderBottom: "1px solid #000" }}>
                          <td colSpan={2} style={{ padding: "5px 4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>المحتوى (Items Content):</strong><br />
                            <div style={{ fontSize: "9px", fontWeight: "bold", direction: "rtl" }}>
                              {items.map((it: any, i: number) => {
                                const details = [];
                                if (it.sku) details.push(`SKU: ${it.sku}`);
                                if (it.color) details.push(`Color: ${it.color}`);
                                if (it.size) details.push(`Size: ${it.size}`);
                                const attrsStr = details.length > 0 ? ` [${details.join(" | ")}]` : "";
                                return (
                                  <div key={i} style={{ borderBottom: i < items.length - 1 ? "1px dashed #ddd" : "none", paddingBottom: "2px", marginBottom: "2px" }}>
                                    - {it.product?.title || it.productTitle || it.name || ""} ({it.quantity || 1}){attrsStr}
                                  </div>
                                );
                              })}
                              {items.length === 0 && <span>{content}</span>}
                            </div>
                          </td>
                        </tr>

                        {/* Full Width Row 2: Notes */}
                        <tr>
                          <td colSpan={2} style={{ padding: "5px 4px", textAlign: "right" }}>
                            <strong style={{ fontSize: "7px", color: "#555" }}>الملاحظات (Notes):</strong><br />
                            <span style={{ fontSize: "9px", fontWeight: "bold" }}>{order.notes || "لا توجد ملاحظات"}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* 3. Footer */}
                    <div style={{ display: "flex", border: "1.5px solid #000", borderTop: "none", minHeight: "80px", alignItems: "center" }}>
                      {/* Left: QR Code */}
                      <div style={{ width: "80px", borderLeft: "1px solid #000", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(trackingUrl)}`}
                          alt="QR"
                          style={{ width: "70px", height: "70px", display: "block", imageRendering: "pixelated" }}
                        />
                      </div>
                      
                      {/* Center: Dimensions */}
                      <div style={{ flex: 1, padding: "6px", display: "flex", flexDirection: "column", gap: "4px", borderLeft: "1px solid #000" }}>
                        <strong style={{ fontSize: "7px", color: "#555" }}>الأبعاد والوزن (Dimensions):</strong>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", fontSize: "8px", fontWeight: "bold" }}>
                          <span>الطول: {finalLength} cm</span>
                          <span>العرض: {finalWidth} cm</span>
                          <span>الارتفاع: {finalHeight} cm</span>
                          <span>الوزن: {finalWeight} kg</span>
                        </div>
                      </div>

                      {/* Right: Reference Number with small barcode */}
                      <div style={{ width: "160px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                        <strong style={{ fontSize: "7px", color: "#555", marginBottom: "2px" }}>الرقم المرجعي (Ref No):</strong>
                        <Barcode
                          value={orderId}
                          width={1.0}
                          height={28}
                          fontSize={8}
                          displayValue={true}
                          background="transparent"
                          lineColor="#000"
                        />
                      </div>
                    </div>
                  </div>
                  {/* end label body */}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
