export type PaymentTone = "green" | "amber" | "blue" | "slate";

export interface PaymentDisplay {
  label: string;
  tone: PaymentTone;
}

/**
 * Human-friendly Arabic payment status for a shipment/order.
 * - Bank transfer the team has verified (checked the receipt) → "مدفوع مسبقاً"
 * - Bank transfer not yet verified                           → "تحويل بنكي (بانتظار المراجعة)"
 * - Cash / COD                                               → "نقدي عند الاستلام"
 */
export function paymentDisplay(
  method?: string | null,
  verified?: boolean,
  shipmentType?: string | null
): PaymentDisplay {
  const m = (method || "").toString().trim();
  const st = (shipmentType || "").toString();

  // Imported shipments may carry an explicit type from the source file.
  if (/مدفوع|مسبق|prepaid/i.test(st)) return { label: "مدفوع مسبقاً", tone: "green" };
  if (/تحصيل|عند الاستلام|cod/i.test(st)) return { label: "نقدي عند الاستلام", tone: "blue" };

  const isBank = /bank|transfer|حوالة|تحويل|بنك/i.test(m);
  const isCash = /cod|cash|نقد|كاش|تحصيل/i.test(m);

  if (isBank) {
    return verified
      ? { label: "مدفوع مسبقاً", tone: "green" }
      : { label: "تحويل بنكي (بانتظار المراجعة)", tone: "amber" };
  }
  if (isCash) return { label: "نقدي عند الاستلام", tone: "blue" };
  return { label: m || "—", tone: "slate" };
}
