import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const transactions = await prisma.paymentTransaction.findMany({
      include: {
        vendor: { select: { storeName: true, phone: true, userId: true } },
        plan: { select: { name: true, price: true, durationDays: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Fetch subscription transactions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const { transactionId, status } = await req.json();
    if (!transactionId || !status) {
      return NextResponse.json({ error: "transactionId و status مطلوبان" }, { status: 400 });
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { vendor: true, plan: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "المعاملة غير موجودة" }, { status: 404 });
    }

    if (status === "COMPLETED") {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + (transaction.plan?.durationDays || 30));

      await prisma.vendor.update({
        where: { id: transaction.vendorId },
        data: {
          tier: transaction.plan?.slug === "premium-builder" ? "PREMIUM_BUILDER" : "CUSTOM_DESIGN",
          planId: transaction.planId,
          subscriptionEndsAt: endDate,
        },
      });

      await prisma.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      try {
        const { notifyVendorByUserId } = await import("@/lib/notification");
        if (transaction.vendor?.userId) {
          notifyVendorByUserId(
            transaction.vendor.userId,
            "✅ تم تفعيل اشتراكك في مرسال",
            `تم تفعيل باقة ${transaction.plan?.name || "الاشتراك"} بنجاح`,
            "payment",
            "/vendor/dashboard"
          );
        }
      } catch {}
    } else {
      await prisma.paymentTransaction.update({
        where: { id: transactionId },
        data: { status: "FAILED" },
      });

      try {
        const { notifyVendorByUserId } = await import("@/lib/notification");
        if (transaction.vendor?.userId) {
          notifyVendorByUserId(
            transaction.vendor.userId,
            "❌ لم يتم تأكيد اشتراكك",
            `لم يتم تأكيد دفع باقة ${transaction.plan?.name || "الاشتراك"}، يرجى التواصل مع الدعم`,
            "payment",
            "/vendor/dashboard"
          );
        }
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update subscription transaction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
