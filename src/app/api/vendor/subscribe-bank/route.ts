import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logSecurity, extractIp, extractUserAgent, autoBlockIfAbusive, isIpBlocked } from "@/lib/security-log";

export async function POST(req: NextRequest) {
  const clientIp = extractIp(req);
  const userAgent = extractUserAgent(req);
  
  // 1. Check if IP is blocked
  if (await isIpBlocked(clientIp)) {
    await logSecurity({
      type: "UNAUTHORIZED_ACCESS",
      severity: "CRITICAL",
      ip: clientIp,
      userAgent,
      endpoint: "/api/vendor/subscribe-bank",
      method: "POST",
      message: "Blocked IP attempted bank-transfer subscription",
    });
    return NextResponse.json(
      { error: "تم تعطيل الوصول لهذا الـ IP بسبب نشاط مشبوه. للاستفسار تواصل مع الدعم." },
      { status: 403 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      logSecurity({
        type: "UNAUTHORIZED_ACCESS",
        severity: "WARN",
        ip: clientIp,
        userAgent,
        endpoint: "/api/vendor/subscribe-bank",
        method: "POST",
        message: "Anonymous attempted bank-transfer subscribe",
      });
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
      where: { userId },
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

        // Build aiData JSON to persist with the transaction
        const aiDataPayload = {
          ocrLength: result.ocrText?.length || 0,
          details: result.details,
          flags: result.flags,
          suggestion: result.suggestion,
          amountInReceipt: result.details?.amountInReceipt,
          expectedAmount: plan.price,
          senderNameInReceipt: result.details?.senderNameInReceipt,
          analyzedAt: new Date().toISOString(),
        };

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
              screenshotUrl: paymentScreenshot,
              aiConfidence: result.confidence,
              aiData: aiDataPayload as any,
              notes: "✅ تم التحقق تلقائياً بنسبة ثقة عالية",
            },
          });

          // Log security PAYMENT_SUCCESS
          await logSecurity({
            type: "PAYMENT_SUCCESS",
            severity: "INFO",
            ip: clientIp,
            userAgent,
            userId,
            userEmail: (session?.user as any)?.email ?? null,
            vendorId: vendor.id,
            endpoint: "/api/vendor/subscribe-bank",
            method: "POST",
            message: `Bank transfer subscription auto-activated. Plan: ${plan.name}, Price: ${plan.price} SDG. Confidence: ${result.confidence}%`,
            details: { planSlug },
          });

          try {
            const { createNotification } = await import("@/lib/notification");
            createNotification({
              userId: userId,
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

        // ===== REJECT: image is clearly NOT a valid receipt =====
        // Reject immediately if the amount isn't found at all, OR confidence is very low,
        // OR the engine's verdict is REJECT. This stops random/non-receipt images from
        // being accepted as "pending review".
        const amountMissing = !result.details?.amountFound;
        const veryLowConfidence = result.confidence < 45;
        const shouldReject = result.suggestion === "REJECT" || amountMissing || veryLowConfidence;

        if (shouldReject) {
          // Log fake/invalid receipt attempt — for security dashboard
          logSecurity({
            type: "FAKE_RECEIPT",
            severity: result.confidence < 20 ? "CRITICAL" : "ALERT",
            ip: clientIp,
            userAgent,
            userId,
            userEmail: (session?.user as any)?.email ?? null,
            vendorId: vendor.id,
            endpoint: "/api/vendor/subscribe-bank",
            method: "POST",
            message: `Invalid receipt submitted — confidence ${result.confidence}%`,
            details: {
              planSlug,
              expectedAmount: plan.price,
              confidence: result.confidence,
              suggestion: result.suggestion,
              amountFound: result.details?.amountFound,
              amountInReceipt: result.details?.amountInReceipt,
              bankNameFound: result.details?.bankNameFound,
              accountNameFound: result.details?.accountNameFound,
            },
          });
          
          // Log security PAYMENT_FAIL
          logSecurity({
            type: "PAYMENT_FAIL",
            severity: "WARN",
            ip: clientIp,
            userAgent,
            userId,
            userEmail: (session?.user as any)?.email ?? null,
            vendorId: vendor.id,
            endpoint: "/api/vendor/subscribe-bank",
            method: "POST",
            message: `Bank transfer subscription payment failed (invalid receipt)`,
            details: { planSlug, confidence: result.confidence },
          });

          autoBlockIfAbusive(clientIp, "FAKE_RECEIPT", 5, 24);

          // Build a clear reason list for the vendor
          const reasons: string[] = [];
          if (amountMissing) {
            reasons.push(`المبلغ المطلوب (${Math.round(plan.price).toLocaleString()} ج.س) غير موجود في الصورة`);
          } else if (!result.details?.amountMatch) {
            reasons.push("المبلغ في الإيصال لا يطابق سعر الباقة");
          }
          if (!result.details?.bankNameFound) {
            reasons.push("لم يتم التعرف على اسم بنك معروف في الصورة");
          }
          if (!result.details?.accountNameFound && !result.details?.accountNumberFound) {
            reasons.push("بيانات الحساب المستفيد غير موجودة في الإيصال");
          }
          if (reasons.length === 0) {
            reasons.push("الصورة لا تبدو كإيصال تحويل بنكي صحيح");
          }

          // Record a FAILED transaction for audit (so admin can still see attempts)
          try {
            await prisma.paymentTransaction.create({
              data: {
                vendorId: vendor.id,
                planId: plan.id,
                amount: plan.price,
                status: "FAILED",
                paymentMethod: "bank_transfer",
                screenshotUrl: paymentScreenshot,
                aiConfidence: result.confidence,
                aiData: aiDataPayload as any,
                notes: "❌ مرفوض تلقائياً: الإيصال غير صحيح",
              },
            });
          } catch {}

          return NextResponse.json(
            {
              success: false,
              rejected: true,
              confidence: result.confidence,
              reasons,
              flags: result.flags,
              error: `❌ الإيصال غير صحيح. ${reasons.join("، ")}. يرجى رفع صورة إيصال التحويل البنكي الصحيحة بوضوح.`,
            },
            { status: 400 },
          );
        }

        // ===== REVIEW: partially matched (45-85%) - save for admin review =====
        await prisma.paymentTransaction.create({
          data: {
            vendorId: vendor.id,
            planId: plan.id,
            amount: plan.price,
            status: "PENDING",
            paymentMethod: "bank_transfer",
            screenshotUrl: paymentScreenshot,
            aiConfidence: result.confidence,
            aiData: aiDataPayload as any,
            notes: "🔍 يحتاج مراجعة الإدارة - تطابق جزئي",
          },
        });

        try {
          const { createNotification } = await import("@/lib/notification");
          createNotification({
            role: "ADMIN",
            title: "🔍 طلب اشتراك يحتاج مراجعة",
            message: `طلب اشتراك باقة ${plan.name} من ${vendor.storeName} - نسبة المطابقة ${result.confidence}%`,
            type: "payment",
            link: "/admin/dashboard?tab=subscriptionRequests",
          });
        } catch {}

        return NextResponse.json({
          success: true,
          autoVerified: false,
          confidence: result.confidence,
          suggestion: result.suggestion,
          flags: result.flags,
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
