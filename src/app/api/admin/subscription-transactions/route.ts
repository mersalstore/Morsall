import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";
import { prisma } from "@/lib/db";
import { notifyVendorByUserId } from "@/lib/notification";
import { TIER_BY_SLUG, PLAN_SLUGS, type PlanSlug } from "@/lib/subscription-plans";

type RequestKind = "REGISTRATION" | "BANK_TRANSFER";

interface UnifiedRequest {
  id: string;
  kind: RequestKind;
  vendorId: string;
  vendor: {
    storeName: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    bankStatementUrl: string | null;
    commercialRegUrl: string | null;
    status: string;
    createdAt: string;
  };
  plan: {
    id: string;
    name: string;
    slug: string;
    price: number;
    durationDays: number;
    isTrial: boolean;
  } | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  method: string;
  screenshotUrl: string | null;
  aiConfidence: number | null;
  aiData: any;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function mapStatus(raw: string): "PENDING" | "APPROVED" | "REJECTED" {
  if (raw === "COMPLETED" || raw === "APPROVED") return "APPROVED";
  if (raw === "FAILED" || raw === "REJECTED" || raw === "REFUNDED") return "REJECTED";
  return "PENDING";
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const transactions = await prisma.paymentTransaction.findMany({
      include: {
        vendor: { include: { user: true } },
        plan: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const pendingVendors = await prisma.vendor.findMany({
      where: { status: "PENDING" },
      include: {
        user: true,
        plan: true,
        paymentTransactions: { take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    const vendorIdsWithTx = new Set(
      pendingVendors.filter((v) => v.paymentTransactions.length > 0).map((v) => v.id),
    );

    const registrationRequests: UnifiedRequest[] = pendingVendors
      .filter((v) => !vendorIdsWithTx.has(v.id))
      .map((v) => ({
        id: `vendor:${v.id}`,
        kind: "REGISTRATION",
        vendorId: v.id,
        vendor: {
          storeName: v.storeName,
          name: v.user?.name ?? null,
          email: v.user?.email ?? null,
          phone: v.phone ?? v.user?.phone ?? null,
          location: v.location ?? null,
          bankStatementUrl: v.bankStatementUrl ?? null,
          commercialRegUrl: v.commercialRegUrl ?? null,
          status: v.status,
          createdAt: v.createdAt.toISOString(),
        },
        plan: v.plan
          ? {
              id: v.plan.id,
              name: v.plan.name,
              slug: v.plan.slug,
              price: v.plan.price,
              durationDays: v.plan.durationDays,
              isTrial: v.plan.isTrial,
            }
          : null,
        status: "PENDING",
        method: v.plan?.isTrial ? "trial" : "registration",
        screenshotUrl: null,
        aiConfidence: null,
        aiData: null,
        notes: null,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
      }));

    const transactionRequests: UnifiedRequest[] = transactions.map((tx) => ({
      id: `tx:${tx.id}`,
      kind: "BANK_TRANSFER",
      vendorId: tx.vendorId,
      vendor: {
        storeName: tx.vendor?.storeName ?? "—",
        name: tx.vendor?.user?.name ?? null,
        email: tx.vendor?.user?.email ?? null,
        phone: tx.vendor?.phone ?? tx.vendor?.user?.phone ?? null,
        location: tx.vendor?.location ?? null,
        bankStatementUrl: tx.vendor?.bankStatementUrl ?? null,
        commercialRegUrl: tx.vendor?.commercialRegUrl ?? null,
        status: tx.vendor?.status ?? "UNKNOWN",
        createdAt: tx.vendor?.createdAt?.toISOString() ?? tx.createdAt.toISOString(),
      },
      plan: tx.plan
        ? {
            id: tx.plan.id,
            name: tx.plan.name,
            slug: tx.plan.slug,
            price: tx.plan.price,
            durationDays: tx.plan.durationDays,
            isTrial: tx.plan.isTrial,
          }
        : null,
      status: mapStatus(tx.status),
      method: tx.paymentMethod ?? "bank_transfer",
      screenshotUrl: null,
      aiConfidence: null,
      aiData: null,
      notes: null,
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.completedAt?.toISOString() ?? tx.createdAt.toISOString(),
    }));

    return NextResponse.json({
      registrations: registrationRequests,
      transactions: transactionRequests,
      all: [...registrationRequests, ...transactionRequests].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    });
  } catch (error) {
    console.error("Fetch subscription transactions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const body = await req.json();
    const { transactionId, status, reason } = body as {
      transactionId: string;
      status: "APPROVED" | "REJECTED" | "COMPLETED" | "FAILED";
      reason?: string;
    };

    if (!transactionId || !status) {
      return NextResponse.json({ error: "transactionId و status مطلوبان" }, { status: 400 });
    }

    const normalizedStatus =
      status === "APPROVED" || status === "COMPLETED"
        ? "APPROVED"
        : status === "REJECTED" || status === "FAILED"
        ? "REJECTED"
        : null;

    if (!normalizedStatus) {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }

    let vendorId: string | null = null;
    let txRecordId: string | null = null;

    if (transactionId.startsWith("vendor:")) {
      vendorId = transactionId.slice("vendor:".length);
    } else if (transactionId.startsWith("tx:")) {
      txRecordId = transactionId.slice("tx:".length);
    } else {
      txRecordId = transactionId;
    }

    if (txRecordId) {
      const tx = await prisma.paymentTransaction.findUnique({
        where: { id: txRecordId },
        include: { vendor: true, plan: true },
      });
      if (!tx) {
        return NextResponse.json({ error: "المعاملة غير موجودة" }, { status: 404 });
      }
      vendorId = tx.vendorId;
    }

    if (!vendorId) {
      return NextResponse.json({ error: "تعذّر تحديد التاجر" }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { plan: true, user: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: "التاجر غير موجود" }, { status: 404 });
    }

    if (normalizedStatus === "APPROVED") {
      const planSlug = (vendor.plan?.slug as PlanSlug | undefined) ?? PLAN_SLUGS.FREEMIUM;
      const tier = TIER_BY_SLUG[planSlug] ?? "FREEMIUM";
      const durationDays = vendor.plan?.durationDays ?? 14;
      const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

      await prisma.$transaction([
        prisma.vendor.update({
          where: { id: vendorId },
          data: {
            status: "APPROVED",
            tier,
            subscriptionEndsAt: endDate,
            rejectionReason: null,
          },
        }),
        prisma.user.update({
          where: { id: vendor.userId },
          data: { role: "VENDOR" },
        }),
        ...(txRecordId
          ? [
              prisma.paymentTransaction.update({
                where: { id: txRecordId },
                data: { status: "COMPLETED", completedAt: new Date() },
              }),
            ]
          : []),
      ]);

      try {
        await notifyVendorByUserId(
          vendor.userId,
          "✅ تم تفعيل اشتراكك في مرسال",
          `تم قبول متجرك "${vendor.storeName}" بباقة ${vendor.plan?.name ?? "الاشتراك"}.`,
          "payment",
          "/vendor/dashboard",
        );
      } catch {}

      return NextResponse.json({ success: true, status: "APPROVED" });
    }

    await prisma.$transaction([
      prisma.vendor.update({
        where: { id: vendorId },
        data: {
          status: "REJECTED",
          rejectionReason: reason || null,
        },
      }),
      ...(txRecordId
        ? [
            prisma.paymentTransaction.update({
              where: { id: txRecordId },
              data: { status: "FAILED" },
            }),
          ]
        : []),
    ]);

    try {
      await notifyVendorByUserId(
        vendor.userId,
        "❌ تم رفض طلب الاشتراك",
        reason
          ? `سبب الرفض: ${reason}`
          : `لم يتم قبول طلب الاشتراك لمتجر "${vendor.storeName}". يرجى التواصل مع الدعم.`,
        "vendor",
        "/vendor/dashboard",
      );
    } catch {}

    return NextResponse.json({ success: true, status: "REJECTED" });
  } catch (error) {
    console.error("Update subscription transaction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
