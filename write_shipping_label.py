# -*- coding: utf-8 -*-
import os

tsx = '''\
"use client";

import React from "react";
import Barcode from "react-barcode";

interface ShippingLabelData {
  tracking_number: string;
  order_number?: string;
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
    is_cod?: boolean;
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

const toSafeString = (value: unknown) =>
  value === null || value === undefined ? "" : String(value).trim();

const toPositiveNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return 0;
  const parsed =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\\d.-]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const firstPresent = (...values: unknown[]) => {
  for (const value of values) {
    const text = toSafeString(value);
    if (text && text !== "0" && text !== "-") return text;
  }
  return "";
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 2 }).format(value);

const formatMoney = (value: number) =>
  `${formatNumber(value)} \u062c.\u0633`;

const compactOrderNumber = (order: any) =>
  firstPresent(
    order.orderNumber,
    order.orderNo,
    order.order_number,
    order.customerReference
  ) ||
  (order.id
    ? order.id.slice(-8).toUpperCase()
    : `ORD-${Date.now().toString().slice(-8)}`);

const getItemProduct = (item: any) => item?.product || item;

const getPackageMetrics = (order: any, items: any[]) => {
  const products = items.map(getItemProduct).filter(Boolean);
  const sumWeight = products.reduce(
    (sum: number, product: any, idx: number) => {
      const qty = toPositiveNumber(items[idx]?.quantity) || 1;
      return sum + toPositiveNumber(product?.weight) * qty;
    },
    0
  );
  const safeMax = (arr: number[]) => (arr.length > 0 ? Math.max(0, ...arr) : 0);
  const length =
    toPositiveNumber(firstPresent(order.length, order.dimLength)) ||
    safeMax(products.map((p: any) => toPositiveNumber(p?.length)));
  const width =
    toPositiveNumber(firstPresent(order.width, order.dimWidth)) ||
    safeMax(products.map((p: any) => toPositiveNumber(p?.width)));
  const height =
    toPositiveNumber(firstPresent(order.height, order.dimHeight)) ||
    safeMax(products.map((p: any) => toPositiveNumber(p?.height)));
  const weight =
    toPositiveNumber(firstPresent(order.weight, order.actualWeight)) || sumWeight;
  const volumetricWeight =
    toPositiveNumber(order.volumetricWeight) ||
    (length && width && height ? (length * width * height) / 5000 : 0);
  return { length, width, height, weight, volumetricWeight };
};

const normalizePayment = (order: any) => {
  const rawPayment = toSafeString(order.paymentMethod || order.payment_method);
  const pm = rawPayment.toLowerCase();
  const explicitCodAmount = toPositiveNumber(
    firstPresent(order.codAmount, order.cod_amount, order.collectionAmount, order.amountToCollect, order.amount_to_collect)
  );
  const totalAmount = toPositiveNumber(
    firstPresent(order.totalAmount, order.total, order.totalPrice, order.grandTotal)
  );
  const amountToCollect = explicitCodAmount || totalAmount;
  const methodSaysCod =
    pm === "cod" || pm === "cash_on_delivery" || pm === "pay_on_delivery" ||
    rawPayment === "\u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645" ||
    rawPayment === "\u0643\u0627\u0634";
  if (methodSaysCod) {
    if (amountToCollect > 0) {
      return { type: "\u062a\u062d\u0635\u064a\u0644 \u0639\u0646\u062f \u0627\u0644\u062a\u0633\u0644\u064a\u0645 (COD)", isCod: true, amount: amountToCollect };
    }
    return { type: "\u0628\u062f\u0648\u0646 \u062a\u062d\u0635\u064a\u0644", isCod: false, amount: 0 };
  }
  if (pm === "bank" || pm === "bank_transfer") {
    return { type: "\u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a", isCod: false, amount: 0 };
  }
  if (pm === "card" || pm === "online" || pm === "prepaid" || pm === "stripe") {
    return { type: "\u0645\u062f\u0641\u0648\u0639 \u0645\u0633\u0628\u0642\u0627\u064b", isCod: false, amount: 0 };
  }
  return { type: rawPayment && rawPayment !== "COD" ? rawPayment : "\u0628\u062f\u0648\u0646 \u062a\u062d\u0635\u064a\u0644", isCod: false, amount: 0 };
};

// QR Code using external API - no library needed, works anywhere
function QRImg({ value, size }: { value: string; size: number }) {
  const encoded = encodeURIComponent(value || "MORSALL");
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=svg`}
      width={size}
      height={size}
      alt="QR"
      style={{ display: "block" }}
    />
  );
}

const BORDER = "1.5px solid #000";
const INNER_BORDER = "1px solid #000";

function SplitRow({
  labelRight,
  valueRight,
  labelLeft,
  valueLeft,
  valueRightStyle,
  valueLeftStyle,
}: {
  labelRight: string;
  valueRight: React.ReactNode;
  labelLeft: string;
  valueLeft: React.ReactNode;
  valueRightStyle?: React.CSSProperties;
  valueLeftStyle?: React.CSSProperties;
}) {
  return (
    <tr>
      {/* Right side value (Column 1) */}
      <td style={{ border: INNER_BORDER, padding: "2px 5px", width: "35%", textAlign: "right", verticalAlign: "middle" }}>
        <div style={{ fontSize: "9.5px", fontWeight: "bold", ...valueRightStyle }}>{valueRight || "-"}</div>
      </td>
      {/* Right side label (Column 2) */}
      <td style={{ border: INNER_BORDER, padding: "2px 5px", width: "15%", textAlign: "left", verticalAlign: "middle" }}>
        <div style={{ fontSize: "7px", fontWeight: "bold", color: "#000" }}>{labelRight}</div>
      </td>
      {/* Left side value (Column 3) */}
      <td style={{ border: INNER_BORDER, padding: "2px 5px", width: "35%", textAlign: "right", verticalAlign: "middle" }}>
        <div style={{ fontSize: "9.5px", fontWeight: "bold", ...valueLeftStyle }}>{valueLeft || "-"}</div>
      </td>
      {/* Left side label (Column 4) */}
      <td style={{ border: INNER_BORDER, padding: "2px 5px", width: "15%", textAlign: "left", verticalAlign: "middle" }}>
        <div style={{ fontSize: "7px", fontWeight: "bold", color: "#000" }}>{labelLeft}</div>
      </td>
    </tr>
  );
}

function HalfRow({
  labelRight,
  valueRight,
  labelLeft,
  valueLeft,
  height,
  valueRightStyle,
  valueLeftStyle,
}: {
  labelRight: string;
  valueRight: React.ReactNode;
  labelLeft: string;
  valueLeft: React.ReactNode;
  height?: string;
  valueRightStyle?: React.CSSProperties;
  valueLeftStyle?: React.CSSProperties;
}) {
  return (
    <tr>
      {/* Right half cell (colSpan 2) */}
      <td
        colSpan={2}
        style={{
          border: INNER_BORDER,
          padding: "2px 5px",
          width: "50%",
          height: height,
          verticalAlign: "top",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "5px",
            top: "2px",
            fontSize: "7px",
            fontWeight: "bold",
            color: "#000",
          }}
        >
          {labelRight}
        </div>
        <div
          style={{
            fontSize: "9.5px",
            fontWeight: "bold",
            paddingTop: "9px",
            textAlign: "right",
            ...valueRightStyle,
          }}
        >
          {valueRight || "-"}
        </div>
      </td>
      {/* Left half cell (colSpan 2) */}
      <td
        colSpan={2}
        style={{
          border: INNER_BORDER,
          padding: "2px 5px",
          width: "50%",
          height: height,
          verticalAlign: "top",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "5px",
            top: "2px",
            fontSize: "7px",
            fontWeight: "bold",
            color: "#000",
          }}
        >
          {labelLeft}
        </div>
        <div
          style={{
            fontSize: "9.5px",
            fontWeight: "bold",
            paddingTop: "9px",
            textAlign: "right",
            ...valueLeftStyle,
          }}
        >
          {valueLeft || "-"}
        </div>
      </td>
    </tr>
  );
}

export function ShippingLabel({ data, copies = 1 }: ShippingLabelProps) {
  const mainBarcodeValue = data.order_number || data.tracking_number;
  const referenceBarcodeValue = data.footer.reference_barcode || data.tracking_number;
  const hasReferenceBarcode = !!referenceBarcodeValue;

  const LABEL_STYLE: React.CSSProperties = {
    width: "100mm",
    minHeight: "145mm",
    background: "#fff",
    fontFamily: "'Cairo', 'Tajawal', 'Arial', sans-serif",
    direction: "rtl",
    position: "relative",
    boxSizing: "border-box",
    border: BORDER,
    pageBreakAfter: "always",
    breakAfter: "page",
  };

  return (
    <>
      {Array.from({ length: copies }).map((_, copyIdx) => (
        <div key={copyIdx} style={LABEL_STYLE}>

          {/* HEADER: barcode left, logo right */}
          <div style={{ display: "flex", alignItems: "stretch", borderBottom: INNER_BORDER }}>
            <div style={{ flex: "1 1 56%", borderLeft: INNER_BORDER, padding: "3px 4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "6px", color: "#555", fontWeight: "bold", alignSelf: "flex-end", marginBottom: "1px" }}>
                \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628
              </div>
              <Barcode value={mainBarcodeValue} format="CODE128" height={40} width={1.3} displayValue={true} fontSize={9} margin={0} textAlign="center" />
            </div>
            <div style={{ flex: "0 0 42%", padding: "4px 6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/footer-logo.png?v=9" alt="\u0645\u0631\u0633\u0627\u0644" style={{ width: "100%", maxWidth: "88px", objectFit: "contain" }} />
            </div>
          </div>

          {/* INFO GRID */}
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "35%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "35%" }} />
              <col style={{ width: "15%" }} />
            </colgroup>
            <tbody>
              {/* Row 1: date (right) | licensed_operator (left) */}
              <HalfRow
                labelRight="\u0627\u0644\u062a\u0627\u0631\u064a\u062e:"
                valueRight={data.date_time}
                labelLeft="\u0627\u0644\u0645\u0634\u063a\u0644 \u0627\u0644\u0645\u0631\u062e\u0635:"
                valueLeft={data.licensed_operator || "\u0645\u0631\u0633\u0627\u0644 \u0644\u0644\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0644\u0648\u062c\u0633\u062a\u064a\u0629"}
              />

              {/* Row 2: from | to */}
              <SplitRow
                labelRight="\u0645\u0646:"
                valueRight={data.sender.city || data.sender.region}
                labelLeft="\u0625\u0644\u0649:"
                valueLeft={data.receiver.city || data.receiver.region}
              />

              {/* Row 3: sender name | receiver name */}
              <SplitRow
                labelRight="\u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u0633\u0644:"
                valueRight={data.sender.name}
                labelLeft="\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u0642\u0628\u0644:"
                valueLeft={data.receiver.name}
              />

              {/* Row 4: sender region | receiver region */}
              <SplitRow
                labelRight="\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u0637\u0642\u0629:"
                valueRight={data.sender.region}
                labelLeft="\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u0637\u0642\u0629:"
                valueLeft={data.receiver.region}
              />

              {/* Row 5: sender detailed_address | receiver detailed_address */}
              <HalfRow
                labelRight="\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062a\u0641\u0635\u064a\u0644\u064a:"
                valueRight={data.sender.detailed_address}
                labelLeft="\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062a\u0641\u0635\u064a\u0644\u064a:"
                valueLeft={data.receiver.detailed_address}
                height="15mm"
                valueRightStyle={{ fontSize: "8px", whiteSpace: "pre-wrap" }}
                valueLeftStyle={{ fontSize: "8px", whiteSpace: "pre-wrap" }}
              />

              {/* Row 6: sender phone | receiver phone */}
              <HalfRow
                labelRight="\u0627\u0644\u0647\u0627\u062a\u0641:"
                valueRight={<span style={{ direction: "ltr", display: "inline-block" }}>{data.sender.phone}</span>}
                labelLeft="\u0627\u0644\u0647\u0627\u062a\u0641:"
                valueLeft={<span style={{ direction: "ltr", display: "inline-block" }}>{data.receiver.phone}</span>}
              />

              {/* Row 7: payment type | cod amount */}
              <SplitRow
                labelRight="\u0646\u0648\u0639 \u0627\u0644\u062f\u0641\u0639:"
                valueRight={
                  <span style={{ background: data.payment.is_cod ? "#dc2626" : "#16a34a", color: "#fff", padding: "1px 5px", borderRadius: "2px", fontSize: "8px", fontWeight: "900", display: "inline-block" }}>
                    {data.payment.type}
                  </span>
                }
                labelLeft="\u0642\u064a\u0645\u0629 \u0627\u0644\u062a\u062d\u0635\u064a\u0644:"
                valueLeft={
                  <span style={{ fontSize: "10.5px", fontWeight: "900", color: data.payment.is_cod ? "#dc2626" : "#16a34a" }}>
                    {data.payment.is_cod ? data.payment.cod_amount : "\u0644\u0627 \u064a\u0648\u062c\u062f \u062a\u062d\u0635\u064a\u0644"}
                  </span>
                }
              />

              {/* Row 8: service type | packages count */}
              <SplitRow
                labelRight="\u0646\u0648\u0639 \u0627\u0644\u062e\u062f\u0645\u0629:"
                valueRight={data.package_details.service_type || "Standard"}
                labelLeft="\u0627\u0644\u0637\u0631\u0648\u062f:"
                valueLeft={data.package_details.packages_count}
              />

              {/* Row 9: volumetric weight | actual weight */}
              <SplitRow
                labelRight="\u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u062d\u062c\u0645\u064a:"
                valueRight={data.package_details.volumetric_weight || "-"}
                labelLeft="\u0627\u0644\u0648\u0632\u0646:"
                valueLeft={data.package_details.actual_weight && data.package_details.actual_weight !== "-" ? `${data.package_details.actual_weight} \u0643\u062c\u0645` : "-"}
              />

              {/* Row 10: Content */}
              <tr>
                <td colSpan={4} style={{ border: INNER_BORDER, padding: "2px 5px", position: "relative", height: "10mm", verticalAlign: "top" }}>
                  <div style={{ position: "absolute", left: "5px", top: "2px", fontSize: "7px", fontWeight: "bold", color: "#000" }}>
                    \u0627\u0644\u0645\u062d\u062a\u0648\u0649:
                  </div>
                  <div style={{ fontSize: "9px", fontWeight: "bold", paddingTop: "10px", textAlign: "right" }}>
                    {data.package_details.content || "-"}
                  </div>
                </td>
              </tr>

              {/* Row 11: Notes */}
              <tr>
                <td colSpan={4} style={{ border: INNER_BORDER, padding: "2px 5px", position: "relative", height: "12mm", verticalAlign: "top" }}>
                  <div style={{ position: "absolute", left: "5px", top: "2px", fontSize: "7px", fontWeight: "bold", color: "#000" }}>
                    \u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a:
                  </div>
                  <div style={{ fontSize: "9px", fontWeight: "bold", paddingTop: "10px", textAlign: "right", color: data.package_details.notes ? "#b45309" : "#bbb" }}>
                    {data.package_details.notes || ""}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* FOOTER */}
          <div style={{ borderTop: INNER_BORDER, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 5px", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <QRImg value={data.footer.qr_code_data || mainBarcodeValue} size={58} />
              <div style={{ fontSize: "7px", lineHeight: "1.8" }}>
                <div><strong>{"\u0627\u0644\u0648\u0632\u0646: "}</strong>{data.footer.dimensions.weight || "0"}</div>
                <div><strong>{"\u0627\u0644\u0627\u0631\u062a\u0641\u0627\u0639: "}</strong>{data.footer.dimensions.height || "0"}</div>
              </div>
            </div>
            <div style={{ fontSize: "7px", lineHeight: "1.8", textAlign: "center" }}>
              <div><strong>{"\u0627\u0644\u0639\u0631\u0636"}</strong> {data.footer.dimensions.width || "0"}</div>
              <div><strong>{"\u0627\u0644\u0637\u0648\u0644:"}</strong> {data.footer.dimensions.length || "0"}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <div style={{ fontSize: "6px", color: "#555", fontWeight: "bold" }}>{"\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0645\u0631\u062c\u0639\u064a"}</div>
              {hasReferenceBarcode ? (
                <Barcode value={referenceBarcodeValue} format="CODE128" height={28} width={0.8} displayValue={true} fontSize={7} margin={0} />
              ) : (
                <div style={{ fontSize: "8px", fontFamily: "monospace", direction: "ltr" }}>{data.tracking_number}</div>
              )}
            </div>
          </div>

          {copies > 1 && (
            <div style={{ position: "absolute", top: "3px", left: "3px", fontSize: "7px", background: "#eee", padding: "1px 4px", borderRadius: "2px", color: "#666" }}>
              {"\u0646\u0633\u062e\u0629"} {copyIdx + 1} / {copies}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export function orderToShippingLabel(order: any, copyIndex?: number): ShippingLabelData {
  const now = new Date();
  const dateStr =
    now.toLocaleDateString("ar-SA", { year: "numeric", month: "2-digit", day: "2-digit" }) +
    " " + now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  const items = order.items || order.orderItems || [];
  const content =
    items.map((item: any) => `${item.name || item.productName || item.product?.title || order.packageContent || ""} x${item.quantity || 1}`).join(" | ") ||
    order.packageContent || order.id;
  const orderNumber = compactOrderNumber(order);
  const trackingVal =
    firstPresent(order.trackingNumber, order.consignmentNumber, order.providerConsignmentNumber, order.shipmentNumber, order.awb) || orderNumber;
  const payment = normalizePayment(order);
  const metrics = getPackageMetrics(order, items);
  const firstVendor = (items && items[0]?.vendor) || (order.items && order.items[0]?.vendor) || (order.orderItems && order.orderItems[0]?.vendor);
  const storeNameVal = order.storeName || order.vendorName || firstVendor?.storeName || "\u0645\u062a\u062c\u0631 \u0645\u0631\u0633\u0627\u0644";
  const storeAddressVal = order.storeAddress || firstVendor?.address || "\u0627\u0644\u062e\u0631\u0637\u0648\u0645 - \u0627\u0644\u0633\u0648\u062f\u0627\u0646";
  const storePhoneVal = order.storePhone || firstVendor?.phone || "+249 000 000 000";
  return {
    tracking_number: trackingVal,
    order_number: orderNumber,
    date_time: order.createdAt ? new Date(order.createdAt).toLocaleString("ar-SA") : dateStr,
    licensed_operator: "\u0645\u0631\u0633\u0627\u0644 \u0644\u0644\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0644\u0648\u062c\u0633\u062a\u064a\u0629",
    sender: {
      city: "\u0627\u0644\u062e\u0631\u0637\u0648\u0645",
      name: storeNameVal,
      region: "\u0627\u0644\u062e\u0631\u0637\u0648\u0645",
      detailed_address: storeAddressVal,
      phone: storePhoneVal,
    },
    receiver: {
      city: order.city || order.address?.city || "\u0627\u0644\u062e\u0631\u0637\u0648\u0645",
      name: order.customerName || order.name || "-",
      region: order.region || order.address?.state || order.city || "-",
      detailed_address:
        [order.address?.street, order.address?.area || order.address?.district,
         order.address?.postalCode ? `\u0635.\u0628 ${order.address.postalCode}` : "",
         order.address?.city, order.address?.state].filter(Boolean).join("\u060c ") ||
        order.address || "-",
      phone: order.phone || order.customerPhone || "-",
    },
    payment: {
      type: payment.type,
      is_cod: payment.isCod,
      cod_amount: payment.isCod ? formatMoney(payment.amount) : "",
    },
    package_details: {
      service_type: order.serviceType || order.shipmentType || "Standard",
      packages_count: "1 of 1",
      volumetric_weight: metrics.volumetricWeight ? `${formatNumber(metrics.volumetricWeight)} kg` : "-",
      actual_weight: metrics.weight ? formatNumber(metrics.weight) : "-",
      delivery_attempts: String(order.deliveryAttempts || order.pendingAttempts || 0),
      content,
      notes: order.notes || order.customerNote || "",
    },
    footer: {
      qr_code_data: orderNumber,
      reference_barcode: trackingVal !== orderNumber ? trackingVal : firstPresent(order.id, trackingVal),
      dimensions: {
        length: metrics.length ? formatNumber(metrics.length) : "0",
        width: metrics.width ? formatNumber(metrics.width) : "0",
        height: metrics.height ? formatNumber(metrics.height) : "0",
        weight: metrics.weight ? formatNumber(metrics.weight) : "0",
      },
    },
  };
}

export default ShippingLabel;
'''

out_path = r'd:\New-folder\matger2\src\components\admin\ShippingLabel.tsx'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(tsx)
print("Written OK, size:", os.path.getsize(out_path))
