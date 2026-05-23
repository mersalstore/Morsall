import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planSlug, paymentScreenshot } = await req.json();

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      return NextResponse.json({ error: "الباقة غير موجودة" }, { status: 404 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
    }

    // Get bank accounts from settings
    const settings = await prisma.settings.findUnique({ where: { id: "global" } });
    let bankAccounts: any[] = [];
    try {
      if (settings?.bankAccounts) {
        const parsed = JSON.parse(settings.bankAccounts);
        if (Array.isArray(parsed)) bankAccounts = parsed;
      }
    } catch {
      if (settings?.bankAccountNumber) {
        bankAccounts = [{
          bankName: settings.bankName,
          accountName: settings.bankAccountName,
          accountNumber: settings.bankAccountNumber,
        }];
      }
    }

    if (paymentScreenshot) {
      // AI verify the screenshot
      try {
        const { verifyTransfer } = await import("@/lib/custom-ai-verify");
        const result = await verifyTransfer(
          paymentScreenshot,
          Math.round(plan.price),
          vendor.storeName,
          bankAccounts
        );

        if (result.confidence >= 85) {
          // Auto-activate
          const now = new Date();
          const endDate = new Date(now);
          endDate.setDate(endDate.getDate() + plan.durationDays);

          await prisma.vendor.update({
            where: { id: vendor.id },
            data: {
              tier: planSlug === "premium-builder" ? "PREMIUM_BUILDER" : "CUSTOM_DESIGN",
              planId: plan.id,
              subscriptionEndsAt: endDate,
            },
          });

          await prisma.paymentTransaction.create({
            data: {
              vendorId: vendor.id,
              planId: plan.id,
              amount: plan.price,
              status: "COMPLETED",
              paymentMethod: "bank_transfer",
              completedAt: now,
            },
          });

          try {
            const { createNotification } = await import("@/lib/notification");
            createNotification({
              userId: session.user.id,
              title: "✅ تم تفعيل الاشتراك تلقائياً",
              message: `تم تأكيد الدفع وتفعيل باقة ${plan.name}`,
              type: "payment",
              link: "/vendor/dashboard",
            });
          } catch {}

          return NextResponse.json({
            success: true,
            autoVerified: true,
            confidence: result.confidence,
            tier: planSlug === "premium-builder" ? "PREMIUM_BUILDER" : "CUSTOM_DESIGN",
            subscriptionEndsAt: endDate,
            message: "✅ تم التحقق من الدفع وتفعيل الاشتراك تلقائياً!",
          });
        }

        // Not enough confidence - save for admin review
        await prisma.paymentTransaction.create({
          data: {
            vendorId: vendor.id,
            planId: plan.id,
            amount: plan.price,
            status: "PENDING",
            paymentMethod: "bank_transfer",
          },
        });

        // Save payment screenshot note on vendor
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: {
            bankStatementUrl: paymentScreenshot,
          },
        });

        try {
          const { createNotification } = await import("@/lib/notification");
          createNotification({
            role: "ADMIN",
            title: "🔍 طلب اشتراك يحتاج مراجعة",
            message: `طلب اشتراك باقة ${plan.name} من ${vendor.storeName} - نسبة المطابقة ${result.confidence}%`,
            type: "payment",
            link: "/admin/dashboard",
          });
        } catch {}

        return NextResponse.json({
          success: true,
          autoVerified: false,
          confidence: result.confidence,
          message: "📤 تم استلام طلب الاشتراك، سيتم مراجعته من الإدارة قريباً.",
        });
      } catch (aiErr) {
        console.error("AI verification error:", aiErr);
      }
    }

    // Save pending transaction without screenshot
    await prisma.paymentTransaction.create({
      data: {
        vendorId: vendor.id,
        planId: plan.id,
        amount: plan.price,
        status: "PENDING",
        paymentMethod: "bank_transfer",
      },
    });

    return NextResponse.json({
      success: true,
      message: "يرجى رفع صورة التحويل البنكي لإتمام الاشتراك",
      bankAccounts,
      plan: {
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
      },
    });
  } catch (error: any) {
    console.error("Bank Subscribe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
