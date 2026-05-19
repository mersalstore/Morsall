import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
      subscriptionPlanId
    } = body;

    // 1. Find the existing user
    const user = await prisma.user.findUnique({
      where: { email: (session as any).user.email },
      include: { vendorProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Prevent duplicate vendor registration
    if (user.vendorProfile) {
      return NextResponse.json({ 
        error: "أنت مسجل كبائع بالفعل. يرجى التوجه للوحة التحكم." 
      }, { status: 400 });
    }

    // Find the plan or get/create a default one
    let targetPlanId = subscriptionPlanId || body.subscriptionPlan;
    let durationDays = 30;
    if (targetPlanId) {
      // First try to find by ID
      let plan = await prisma.subscriptionPlan.findFirst({
        where: {
          OR: [
            { id: targetPlanId },
            { name: { contains: targetPlanId } }
          ]
        }
      });
      if (plan) {
        targetPlanId = plan.id;
        durationDays = plan.durationDays;
      } else {
        // Create the plan with that name if it doesn't exist
        const newPlan = await prisma.subscriptionPlan.create({
          data: {
            name: targetPlanId === "ELITE" ? "باقة النخبة الفاخرة (Elite)" : targetPlanId === "PRO" ? "الباقة الاحترافية (Pro)" : "الباقة التجريبية (Free Trial)",
            price: targetPlanId === "ELITE" ? 75000 : targetPlanId === "PRO" ? 25000 : 0,
            durationDays: 30,
            isTrial: targetPlanId !== "ELITE" && targetPlanId !== "PRO"
          }
        });
        targetPlanId = newPlan.id;
        durationDays = 30;
      }
    } else {
      // Look for any trial plan
      const existingTrial = await prisma.subscriptionPlan.findFirst({ where: { isTrial: true } });
      if (existingTrial) {
        targetPlanId = existingTrial.id;
        durationDays = existingTrial.durationDays;
      } else {
        // Create a default trial plan
        const newTrial = await prisma.subscriptionPlan.create({
          data: {
            name: "الباقة التجريبية المجانية",
            price: 0,
            durationDays: 30,
            isTrial: true
          }
        });
        targetPlanId = newTrial.id;
        durationDays = 30;
      }
    }

    // 3. Create Vendor Profile and update User Role
    const vendor = await prisma.$transaction(async (tx: any) => {
      // Update User
      await tx.user.update({
        where: { id: user.id },
        data: { 
          role: "VENDOR",
          phone: phone || user.phone,
          name: name || user.name
        },
      });

      // Create Vendor
      const slug = storeName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-ء-ي0-9]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      return await tx.vendor.create({
        data: {
          userId: user.id,
          storeName,
          slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`,
          location: storeCity,
          bankStatementUrl: bankStatementUrl || "pending",
          commercialRegUrl: commercialRegUrl || null,
          shippingModel: shippingModel || "VENDOR_PACKS",
          status: "PENDING",
          commissionRate: 10.0,
          planId: targetPlanId,
          subscriptionEndsAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        },
      });
    });

    return NextResponse.json({ success: true, vendor });
  } catch (error: any) {
    console.error("Vendor registration error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    });

    if (error?.code === "P2002") {
      return NextResponse.json({ 
        error: "بيانات المتجر مستخدمة بالفعل. حاول اسم متجر آخر." 
      }, { status: 400 });
    }

    return NextResponse.json({ error: "خطأ في معالجة طلب التسجيل" }, { status: 500 });
  }
}
