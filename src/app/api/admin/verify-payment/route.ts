import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";
import { prisma } from "@/lib/db";
import { verifyTransfer } from "@/lib/custom-ai-verify";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const { orderId, imageUrl } = await req.json();
    if (!orderId || !imageUrl) {
      return NextResponse.json({ error: "orderId و imageUrl مطلوبان" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });
    if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

    const settings = await prisma.settings.findUnique({ where: { id: "global" } });

    let expectedAccounts: Array<{ accountName?: string; accountNumber?: string; bankName?: string }> = [];
    try {
      if (settings?.bankAccounts) {
        const parsed = JSON.parse(settings.bankAccounts);
        if (Array.isArray(parsed)) expectedAccounts = parsed;
      }
    } catch {
      if (settings?.bankAccountNumber) {
        expectedAccounts = [{
          accountNumber: settings.bankAccountNumber,
          accountName: settings.bankAccountName,
          bankName: settings.bankName,
        }];
      }
    }

    const customerName = order.customerName || order.customer?.name || "";

    // Use our custom AI verification engine (pure local, no external APIs)
    const result = await verifyTransfer(
      imageUrl,
      Math.round(order.totalAmount),
      customerName,
      expectedAccounts
    );

    // Auto-verify when confidence is high (>= 85%)
    if (result.confidence >= 85) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentVerified: true,
          status: "CONFIRMED",
          paymentNote: `✓ تلقائي | محرك AI مخصص: ${result.confidence}% — ${result.flags.join(" | ")}`,
        },
      });

      try {
        const { notifyVendorByUserId } = await import("@/lib/notification");
        notifyVendorByUserId(
          order.customerId,
          "✅ تم التحقق من الدفع تلقائياً",
          `تم تأكيد الدفع للطلب #${orderId.slice(-8)} بقيمة ${order.totalAmount.toLocaleString()} ج.س`,
          "payment",
          `/orders/${orderId}`
        );
      } catch {}
    } else if (result.confidence >= 50) {
      try {
        const { notifyAdmins } = await import("@/lib/notification");
        notifyAdmins(
          "🔍 طلب تحويل يحتاج مراجعة",
          `طلب #${orderId.slice(-8)} بمبلغ ${order.totalAmount.toLocaleString()} ج.س`,
          "payment",
          "/admin/dashboard"
        );
      } catch {}
    }

    return NextResponse.json({
      success: true,
      confidence: result.confidence,
      analysis: {
        ocrText: result.ocrText,
        flags: result.flags,
        details: result.details,
      },
      suggestion: result.suggestion,
      orderAmount: Math.round(order.totalAmount),
      ocrText: result.ocrText.substring(0, 500),
      autoVerified: result.confidence >= 85,
      engine: "custom-ai-v1",
    });
  } catch (error: any) {
    console.error("Verify Payment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const { orderId, verified, note } = await req.json();
    if (!orderId) return NextResponse.json({ error: "orderId مطلوب" }, { status: 400 });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentVerified: verified,
        paymentNote: note || (verified ? "تم التحقق يدوياً" : "تم الرفض يدوياً"),
        ...(verified ? { status: "CONFIRMED" } : {}),
      },
      include: { customer: true },
    });

    try {
      const { notifyVendorByUserId } = await import("@/lib/notification");
      notifyVendorByUserId(
        updatedOrder.customerId,
        verified ? "✅ تم تأكيد الدفع للطلب" : "❌ تم رفض إيصال الدفع",
        `الطلب #${orderId.slice(-8)} - ${verified ? "تم تأكيد الدفع بنجاح" : "يرجى إعادة رفع إيصال صحيح"}`,
        "payment",
        `/orders/${orderId}`
      );
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
