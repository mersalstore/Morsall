import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  PLAN_SLUGS,
  TIER_BY_SLUG,
  getPlanBySlug,
  resolvePlanSlugFromInput,
} from "@/lib/subscription-plans";
import { notifyAdmins } from "@/lib/notification";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!(session as any)?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      storeName,
      storeCity,
      bankStatementUrl,
      commercialRegUrl,
      shippingModel,
      subscriptionPlanId,
      subscriptionPlan,
    } = body;

    const user = await prisma.user.findUnique({
      where: { email: (session as any).user.email },
      include: { vendorProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.vendorProfile) {
      return NextResponse.json(
        { error: "أنت مسجل كبائع بالفعل. يرجى التوجه للوحة التحكم." },
        { status: 400 },
      );
    }

    const requestedSlug = resolvePlanSlugFromInput(subscriptionPlanId || subscriptionPlan);
    const plan = await getPlanBySlug(requestedSlug);

    if (!plan) {
      return NextResponse.json(
        { error: "تعذّر تحميل بيانات الباقة. حاول مرة أخرى." },
        { status: 500 },
      );
    }

    const tier = TIER_BY_SLUG[requestedSlug];
    const subscriptionEndsAt = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

    const slugBase = storeName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-ء-ي0-9]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const vendor = await prisma.$transaction(async (tx: any) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          phone: phone || user.phone,
          name: name || user.name,
        },
      });

      return await tx.vendor.create({
        data: {
          userId: user.id,
          storeName,
          slug: `${slugBase}-${Math.random().toString(36).substring(2, 7)}`,
          location: storeCity,
          bankStatementUrl: bankStatementUrl || "pending",
          commercialRegUrl: commercialRegUrl || null,
          shippingModel: shippingModel || "VENDOR_PACKS",
          status: "PENDING",
          commissionRate: 10.0,
          planId: plan.id,
          tier,
          subscriptionEndsAt,
        },
      });
    });

    try {
      await notifyAdmins(
        "تاجر جديد بانتظار المراجعة",
        `${storeName} طلب التسجيل بباقة "${plan.name}". اضغط للمراجعة.`,
        "vendor",
        "/admin/dashboard?tab=subscriptionRequests",
      );
    } catch (notifyErr) {
      console.error("notifyAdmins failed:", notifyErr);
    }

    return NextResponse.json({ success: true, vendor, plan: { slug: plan.slug, name: plan.name } });
  } catch (error: any) {
    console.error("Vendor registration error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });

    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "بيانات المتجر مستخدمة بالفعل. حاول اسم متجر آخر." },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "خطأ في معالجة طلب التسجيل" }, { status: 500 });
  }
}
