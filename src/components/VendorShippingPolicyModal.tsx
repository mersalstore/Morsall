"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer } from "lucide-react";

interface VendorShippingPolicyModalProps {
  isOpen: boolean;
  orders: any[];
  onClose: () => void;
  storeName?: string;
}

function BarcodeStripes({ value, height = 50 }: { value: string; height?: number }) {
  const bars: { width: number; isBar: boolean }[] = [];
  let toggle = true;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const w = (code % 3) + 1;
    bars.push({ width: w * 2, isBar: toggle });
    toggle = !toggle;
    bars.push({ width: 1.5, isBar: !toggle });
    toggle = !toggle;
  }
  const totalW = bars.reduce((s, b) => s + b.width, 0);
  let x = 0;
  return (
    <svg width={Math.max(totalW, 120)} height={height} xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      {bars.map((b, i) => {
        const cx = x;
        x += b.width;
        return b.isBar ? <rect key={i} x={cx} y={0} width={b.width} height={height} fill="#000" /> : null;
      })}
    </svg>
  );
}

function orderToLabelData(order: any, storeName?: string) {
  const items = order.vendorItems || order.items || order.orderItems || [];
  const content = items
    .map((item: any) => `${item.productTitle || item.name || item.productName || ""} x${item.quantity || 1}`)
    .join(" | ") || order.id;

  return {
    tracking_number: order.id || `ORD-${Date.now()}`,
    date_time: order.createdAt
      ? new Date(order.createdAt).toLocaleString("ar-SA")
      : new Date().toLocaleString("ar-SA"),
    sender: {
      name: storeName || "متجري",
      phone: order.storePhone || "+249 000 000 000",
      city: "الخرطوم",
      region: "الخرطوم",
      detailed_address: "السودان - الخرطوم",
    },
    receiver: {
      name: order.customerName || "—",
      phone: order.phone || "—",
      city: order.city || "الخرطوم",
      region: order.district || order.city || "—",
      detailed_address: [order.district, order.street, order.address].filter(Boolean).join("، ") || "—",
    },
    payment: {
      type: "الدفع عند الاستلام",
      cod_amount: `${order.totalAmount?.toLocaleString() || 0} SDG`,
    },
    package_details: {
      service_type: "Standard",
      packages_count: "1 of 1",
      actual_weight: "0",
      delivery_attempts: "0",
      content,
    },
    dimensions: {
      length: "0",
      width: "0",
      height: "0",
      weight: "0",
    },
  };
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
          className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative z-10 print:rounded-none print:shadow-none print:max-w-full print:max-h-none print:overflow-visible flex flex-col"
        >
          <style>{`
            @page { size: A6 landscape; margin: 4mm; }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
              .label-page { page-break-after: always; }
              .label-page:last-child { page-break-after: avoid; }
            }
            .shipping-label * { box-sizing: border-box; font-family: 'Segoe UI', 'Arial', sans-serif; }
            .shipping-label table { border-collapse: collapse; width: 100%; }
            .shipping-label td, .shipping-label th { border: 1px solid #222; padding: 3px 5px; vertical-align: top; }
            .label-header-logo { font-weight: 900; font-size: 22px; letter-spacing: -1px; color: #111; text-align: center; line-height: 1.1; }
            .label-header-logo span { color: #e03c2b; }
            .field-label { font-size: 9px; color: #555; display: block; margin-bottom: 1px; }
            .field-value { font-size: 11px; font-weight: 600; color: #111; display: block; word-break: break-all; }
            .city-badge { font-size: 18px; font-weight: 900; background: #111; color: #fff; padding: 2px 10px; display: inline-block; border-radius: 3px; margin-bottom: 2px; }
            .section-title { font-size: 9px; font-weight: 700; background: #f0f0f0; padding: 2px 5px; border-bottom: 1px solid #ccc; color: #333; text-transform: uppercase; letter-spacing: 0.5px; }
            .payment-badge { font-size: 12px; font-weight: 800; background: #222; color: #fff; padding: 3px 8px; border-radius: 3px; display: inline-block; }
            .cod-amount { font-size: 16px; font-weight: 900; color: #e03c2b; }
          `}</style>

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

          <div className="p-4 print:p-0 bg-white">
            {orders.map((order, idx) => {
              const data = orderToLabelData(order, storeName);
              return (
                <div key={order.id} className="label-page shipping-label" style={{
                  width: "148mm", minHeight: "105mm", border: "1.5px solid #333",
                  background: "#fff", padding: "3mm", marginBottom: "8px", fontSize: "11px", position: "relative",
                  marginLeft: "auto", marginRight: "auto"
                }}>
                  {/* HEADER */}
                  <table style={{ marginBottom: "2px" }}>
                    <tbody>
                      <tr>
                        <td style={{ border: "none", width: "55%", paddingLeft: 0 }}>
                          <BarcodeStripes value={data.tracking_number} height={50} />
                          <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", marginTop: "2px" }}>
                            {data.tracking_number}
                          </div>
                        </td>
                        <td style={{ border: "none", textAlign: "center", verticalAlign: "middle" }}>
                          <div className="label-header-logo">مر<span>سال</span></div>
                          <div style={{ fontSize: "8px", color: "#666", marginTop: "4px" }}>MORSALL EXPRESS</div>
                          <div style={{ fontSize: "9px", marginTop: "6px", background: "#f5f5f5", padding: "2px 4px", borderRadius: "3px" }}>
                            {data.date_time}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* SENDER / RECEIVER */}
                  <table>
                    <tbody>
                      <tr>
                        <td style={{ width: "50%", padding: 0 }}>
                          <div className="section-title">📦 المستلم – Receiver</div>
                          <div style={{ padding: "4px" }}>
                            <div className="city-badge">{data.receiver.city}</div>
                            <span className="field-label">الاسم</span>
                            <span className="field-value" style={{ fontSize: "13px" }}>{data.receiver.name}</span>
                            <span className="field-label" style={{ marginTop: "3px" }}>المنطقة</span>
                            <span className="field-value">{data.receiver.region}</span>
                            <span className="field-label" style={{ marginTop: "3px" }}>العنوان</span>
                            <span className="field-value" style={{ fontSize: "9px" }}>{data.receiver.detailed_address}</span>
                            <span className="field-label" style={{ marginTop: "3px" }}>الهاتف</span>
                            <span className="field-value" style={{ direction: "ltr", textAlign: "right" }}>{data.receiver.phone}</span>
                          </div>
                        </td>
                        <td style={{ width: "50%", padding: 0 }}>
                          <div className="section-title">🏪 المرسل – Sender</div>
                          <div style={{ padding: "4px" }}>
                            <div className="city-badge" style={{ background: "#555" }}>{data.sender.city}</div>
                            <span className="field-label">الاسم</span>
                            <span className="field-value">{data.sender.name || "—"}</span>
                            <span className="field-label" style={{ marginTop: "3px" }}>المنطقة</span>
                            <span className="field-value">{data.sender.region}</span>
                            <span className="field-label" style={{ marginTop: "3px" }}>العنوان</span>
                            <span className="field-value" style={{ fontSize: "9px" }}>{data.sender.detailed_address}</span>
                            <span className="field-label" style={{ marginTop: "3px" }}>الهاتف</span>
                            <span className="field-value" style={{ direction: "ltr", textAlign: "right" }}>{data.sender.phone || "—"}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* PAYMENT & PACKAGE */}
                  <table style={{ marginTop: "2px" }}>
                    <tbody>
                      <tr>
                        <td style={{ width: "25%", textAlign: "center" }}>
                          <span className="field-label">نوع الدفع</span>
                          <span className="payment-badge">{data.payment.type}</span>
                        </td>
                        <td style={{ width: "25%", textAlign: "center" }}>
                          <span className="field-label">قيمة التحصيل</span>
                          <span className="cod-amount">{data.payment.cod_amount}</span>
                        </td>
                        <td style={{ width: "25%", textAlign: "center" }}>
                          <span className="field-label">نوع الخدمة</span>
                          <span className="field-value">{data.package_details.service_type}</span>
                        </td>
                        <td style={{ width: "25%", textAlign: "center" }}>
                          <span className="field-label">الطرود</span>
                          <span className="field-value" style={{ fontSize: "13px", fontWeight: "900" }}>{data.package_details.packages_count}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ textAlign: "center" }}>
                          <span className="field-label">الوزن الحجمي</span>
                          <span className="field-value">—</span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="field-label">الوزن الفعلي</span>
                          <span className="field-value">{data.package_details.actual_weight} kg</span>
                        </td>
                        <td colSpan={2} style={{ textAlign: "center" }}>
                          <span className="field-label">محاولات التوصيل</span>
                          <span className="field-value" style={{ fontSize: "14px" }}>
                            {Array.from({ length: 3 }).map((_, i) => (
                              <span key={i} style={{
                                display: "inline-block", width: "16px", height: "16px",
                                border: "1.5px solid #333", borderRadius: "3px", margin: "0 1px",
                                background: i < parseInt(data.package_details.delivery_attempts) ? "#222" : "#fff",
                                verticalAlign: "middle"
                              }} />
                            ))}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* CONTENT */}
                  <table style={{ marginTop: "2px" }}>
                    <tbody>
                      <tr>
                        <td>
                          <span className="field-label">المحتوى</span>
                          <span className="field-value" style={{ fontSize: "10px" }}>{data.package_details.content}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* FOOTER */}
                  <table style={{ marginTop: "2px" }}>
                    <tbody>
                      <tr>
                        <td style={{ textAlign: "center" }}>
                          <span className="field-label" style={{ marginBottom: "3px" }}>الرقم المرجعي – Reference</span>
                          <BarcodeStripes value={data.tracking_number} height={45} />
                          <div style={{ fontSize: "8px", marginTop: "2px", direction: "ltr" }}>
                            {data.tracking_number}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
