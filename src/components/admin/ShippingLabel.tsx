"use client";

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ShippingLabelData {
  tracking_number: string;
  date_time: string;
  licensed_operator?: string;
  sender: {
    city: string;
    name: string;
    region: string;
    detailed_address: string;
    phone: string;
  };
  receiver: {
    city: string;
    name: string;
    region: string;
    detailed_address: string;
    phone: string;
  };
  payment: {
    type: string;
    cod_amount: string;
  };
  package_details: {
    service_type?: string;
    packages_count: string;
    volumetric_weight?: string;
    actual_weight: string;
    delivery_attempts: string;
    content: string;
    notes?: string;
  };
  footer: {
    qr_code_data?: string;
    reference_barcode?: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
      weight: string;
    };
  };
}

interface ShippingLabelProps {
  data: ShippingLabelData;
  copies?: number;
}

// ─── Helper: SVG Barcode (Code128-style visual) ───────────────────────────────
function BarcodeStripes({ value, height = 60 }: { value: string; height?: number }) {
  // Deterministic pattern from string characters
  const bars: { width: number; isBar: boolean }[] = [];
  let toggle = true;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const w = (code % 3) + 1;
    bars.push({ width: w * 2, isBar: toggle });
    toggle = !toggle;
    // narrow space
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
        return b.isBar ? (
          <rect key={i} x={cx} y={0} width={b.width} height={height} fill="#000" />
        ) : null;
      })}
    </svg>
  );
}

// ─── Helper: QR Code placeholder (canvas-based or simple grid) ────────────────
function QRCodePlaceholder({ value, size = 80 }: { value?: string; size?: number }) {
  // Simple visual placeholder; replace with a real QR lib (e.g. qrcode.react) if desired
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "2px solid #000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      <svg width={size - 8} height={size - 8} viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
        {/* Finder patterns */}
        <rect x="0" y="0" width="7" height="7" fill="none" stroke="#000" strokeWidth="1" />
        <rect x="2" y="2" width="3" height="3" fill="#000" />
        <rect x="14" y="0" width="7" height="7" fill="none" stroke="#000" strokeWidth="1" />
        <rect x="16" y="2" width="3" height="3" fill="#000" />
        <rect x="0" y="14" width="7" height="7" fill="none" stroke="#000" strokeWidth="1" />
        <rect x="2" y="16" width="3" height="3" fill="#000" />
        {/* Data cells – deterministic from value */}
        {Array.from(value || "MORSALL").map((ch, i) => {
          const code = ch.charCodeAt(0);
          const row = Math.floor(i / 4) + 8;
          const col = (i % 4) + 8;
          return code % 2 === 0 ? (
            <rect key={i} x={col} y={row} width="1" height="1" fill="#000" />
          ) : null;
        })}
      </svg>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ShippingLabel({ data, copies = 1 }: ShippingLabelProps) {
  const labelArray = Array.from({ length: copies }, (_, i) => i);

  return (
    <>
      <style>{`
        @page { size: A6 landscape; margin: 4mm; }
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .label-page { page-break-after: always; }
          .label-page:last-child { page-break-after: avoid; }
        }
        .shipping-label * {
          box-sizing: border-box;
          font-family: 'Segoe UI', 'Arial', sans-serif;
        }
        .shipping-label table {
          border-collapse: collapse;
          width: 100%;
        }
        .shipping-label td, .shipping-label th {
          border: 1px solid #222;
          padding: 3px 5px;
          vertical-align: top;
        }
        .label-header-logo {
          font-weight: 900;
          font-size: 22px;
          letter-spacing: -1px;
          color: #111;
          text-align: center;
          line-height: 1.1;
        }
        .label-header-logo span {
          color: #e03c2b;
        }
        .field-label {
          font-size: 9px;
          color: #555;
          display: block;
          margin-bottom: 1px;
        }
        .field-value {
          font-size: 11px;
          font-weight: 600;
          color: #111;
          display: block;
          word-break: break-all;
        }
        .city-badge {
          font-size: 18px;
          font-weight: 900;
          background: #111;
          color: #fff;
          padding: 2px 10px;
          display: inline-block;
          border-radius: 3px;
          margin-bottom: 2px;
        }
        .section-title {
          font-size: 9px;
          font-weight: 700;
          background: #f0f0f0;
          padding: 2px 5px;
          border-bottom: 1px solid #ccc;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .payment-badge {
          font-size: 12px;
          font-weight: 800;
          background: #222;
          color: #fff;
          padding: 3px 8px;
          border-radius: 3px;
          display: inline-block;
        }
        .cod-amount {
          font-size: 16px;
          font-weight: 900;
          color: #e03c2b;
        }
      `}</style>

      {labelArray.map((_, copyIdx) => (
        <div
          key={copyIdx}
          className="label-page shipping-label"
          dir="rtl"
          style={{
            width: "148mm",
            minHeight: "105mm",
            border: "1.5px solid #333",
            background: "#fff",
            padding: "3mm",
            marginBottom: "8px",
            fontSize: "11px",
            position: "relative",
          }}
        >
          {/* ── HEADER ── */}
          <table style={{ marginBottom: "2px" }}>
            <tbody>
              <tr>
                {/* Barcode + Tracking */}
                <td style={{ border: "none", width: "55%", paddingLeft: 0 }}>
                  <BarcodeStripes value={data.tracking_number} height={50} />
                  <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", marginTop: "2px" }}>
                    {data.tracking_number}
                  </div>
                </td>
                {/* Logo + Date */}
                <td style={{ border: "none", textAlign: "center", verticalAlign: "middle" }}>
                  <div className="label-header-logo">
                    مر<span>سال</span>
                  </div>
                  <div style={{ fontSize: "8px", color: "#666", marginTop: "4px" }}>MORSALL EXPRESS</div>
                  <div style={{ fontSize: "9px", marginTop: "6px", background: "#f5f5f5", padding: "2px 4px", borderRadius: "3px" }}>
                    {data.date_time}
                  </div>
                  {data.licensed_operator && (
                    <div style={{ fontSize: "8px", color: "#888", marginTop: "2px" }}>
                      المشغل: {data.licensed_operator}
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── SENDER / RECEIVER ── */}
          <table>
            <tbody>
              <tr>
                {/* Receiver (right in RTL = left visually) */}
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
                {/* Sender */}
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

          {/* ── PAYMENT & PACKAGE DETAILS ── */}
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
                  <span className="field-value">{data.package_details.service_type || "Standard"}</span>
                </td>
                <td style={{ width: "25%", textAlign: "center" }}>
                  <span className="field-label">الطرود</span>
                  <span className="field-value" style={{ fontSize: "13px", fontWeight: "900" }}>{data.package_details.packages_count}</span>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "center" }}>
                  <span className="field-label">الوزن الحجمي</span>
                  <span className="field-value">{data.package_details.volumetric_weight || "—"}</span>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className="field-label">الوزن الفعلي</span>
                  <span className="field-value">{data.package_details.actual_weight} kg</span>
                </td>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  <span className="field-label">محاولات التوصيل</span>
                  <span className="field-value" style={{ fontSize: "14px" }}>
                    {"⬜".repeat(3).split("").map((_, i) => (
                      <span key={i} style={{
                        display: "inline-block",
                        width: "16px",
                        height: "16px",
                        border: "1.5px solid #333",
                        borderRadius: "3px",
                        margin: "0 1px",
                        background: i < parseInt(data.package_details.delivery_attempts) ? "#222" : "#fff",
                        verticalAlign: "middle"
                      }} />
                    ))}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── CONTENT & NOTES ── */}
          <table style={{ marginTop: "2px" }}>
            <tbody>
              <tr>
                <td>
                  <span className="field-label">المحتوى</span>
                  <span className="field-value" style={{ fontSize: "10px", direction: "ltr" }}>{data.package_details.content}</span>
                </td>
              </tr>
              {data.package_details.notes && (
                <tr>
                  <td>
                    <span className="field-label">ملاحظات التوصيل</span>
                    <span className="field-value" style={{ fontSize: "10px" }}>{data.package_details.notes}</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── FOOTER ── */}
          <table style={{ marginTop: "2px" }}>
            <tbody>
              <tr>
                {/* QR Code + Dimensions */}
                <td style={{ width: "40%", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
                    <QRCodePlaceholder value={data.footer.qr_code_data || data.tracking_number} size={72} />
                    <div style={{ fontSize: "8px", textAlign: "right", lineHeight: "1.6" }}>
                      <div>الطول: <strong>{data.footer.dimensions.length}</strong> cm</div>
                      <div>العرض: <strong>{data.footer.dimensions.width}</strong> cm</div>
                      <div>الارتفاع: <strong>{data.footer.dimensions.height}</strong> cm</div>
                      <div>الوزن: <strong>{data.footer.dimensions.weight}</strong> kg</div>
                    </div>
                  </div>
                </td>
                {/* Reference Barcode */}
                <td style={{ textAlign: "center" }}>
                  <span className="field-label" style={{ marginBottom: "3px" }}>الرقم المرجعي – Reference</span>
                  <BarcodeStripes value={data.footer.reference_barcode || data.tracking_number} height={45} />
                  <div style={{ fontSize: "8px", marginTop: "2px", direction: "ltr" }}>
                    {data.footer.reference_barcode || data.tracking_number}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Copy indicator for multiple copies */}
          {copies > 1 && (
            <div style={{
              position: "absolute",
              top: "3px",
              left: "3px",
              fontSize: "8px",
              background: "#eee",
              padding: "1px 4px",
              borderRadius: "2px",
              color: "#666"
            }}>
              نسخة {copyIdx + 1} / {copies}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

// ─── Mapper: Order → ShippingLabelData ────────────────────────────────────────
export function orderToShippingLabel(order: any, copyIndex?: number): ShippingLabelData {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }) + " " + now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

  const items = order.items || order.orderItems || [];
  const content = items
    .map((item: any) => `${item.name || item.productName || ""} x${item.quantity || 1}`)
    .join(" | ")
    || order.id;

  return {
    tracking_number: order.id || `ORD-${Date.now()}`,
    date_time: order.createdAt
      ? new Date(order.createdAt).toLocaleString("ar-SA")
      : dateStr,
    licensed_operator: "مرسال للتوصيل",
    sender: {
      city: "الخرطوم",
      name: order.storeName || order.vendorName || "مرسال ستور",
      region: "الخرطوم",
      detailed_address: order.storeAddress || "السودان - الخرطوم",
      phone: order.storePhone || "+249 000 000 000",
    },
    receiver: {
      city: order.city || order.address?.city || "الخرطوم",
      name: order.customerName || order.name || "—",
      region: order.region || order.address?.state || order.city || "—",
      detailed_address: [
        order.address?.street,
        order.address?.area || order.address?.district,
        order.address?.postalCode ? `ر.ب ${order.address.postalCode}` : "",
        order.address?.city,
        order.address?.state,
      ].filter(Boolean).join("، ") || order.address || "—",
      phone: order.phone || order.customerPhone || "—",
    },
    payment: {
      type: order.paymentMethod === "cod"
        ? "الدفع عند الاستلام"
        : order.paymentMethod === "bank_transfer"
        ? "تحويل بنكي"
        : order.paymentMethod === "prepaid"
        ? "مدفوع مسبقاً"
        : order.paymentMethod || "—",
      cod_amount: order.paymentMethod === "cod"
        ? `${order.total || order.totalAmount || 0} SDG`
        : "0",
    },
    package_details: {
      service_type: "Standard",
      packages_count: `1 of 1`,
      volumetric_weight: "—",
      actual_weight: order.weight || "0",
      delivery_attempts: "0",
      content,
      notes: order.notes || order.customerNote || "",
    },
    footer: {
      qr_code_data: order.id,
      reference_barcode: order.id,
      dimensions: {
        length: "0",
        width: "0",
        height: "0",
        weight: order.weight || "0",
      },
    },
  };
}
