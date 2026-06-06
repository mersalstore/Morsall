import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractIp, isIpBlocked, logSecurity, scanForAttacks, autoBlockIfAbusive } from "@/lib/security-log";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

export async function POST(req: Request) {
  try {
    const clientIp = extractIp(req);

    // 1. Check if IP is blocked
    if (await isIpBlocked(clientIp)) {
      await logSecurity({
        type: "UNAUTHORIZED_ACCESS",
        severity: "CRITICAL",
        ip: clientIp,
        endpoint: "/api/vendor/subscribe",
        method: "POST",
        message: "Blocked IP attempted vendor subscription",
      });
      return NextResponse.json(
        { error: "تم تعطيل الوصول لهذا الـ IP بسبب نشاط مشبوه. للاستفسار تواصل مع الدعم." },
        { status: 403 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 2. Scan body for security threats (XSS / SQL injection)
    const attack = scanForAttacks(body);
    if (attack) {
      await logSecurity({
        type: attack,
        severity: "CRITICAL",
        ip: clientIp,
        userId,
        endpoint: "/api/vendor/subscribe",
        method: "POST",
        message: `Threat payload detected: ${JSON.stringify(body).slice(0, 1000)}`,
        details: { body },
      });
      await autoBlockIfAbusive(clientIp, attack, 3, 24);
      return NextResponse.json(
        { error: "تم رفض الطلب لوجود محتوى غير صالح أو محاولة اختراق." },
        { status: 400 }
      );
    }

    const { planSlug } = body;

    // Log subscription attempt
    await logSecurity({
      type: "ADMIN_ACTION",
      severity: "INFO",
      ip: clientIp,
      userId,
      endpoint: "/api/vendor/subscribe",
      method: "POST",
      message: `Vendor subscription session requested for plan: ${planSlug}`,
    });

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // If no Stripe configured, do direct upgrade (for testing/local)
    if (!STRIPE_SECRET) {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + plan.durationDays);

      await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          tier: planSlug === "freemium" ? "FREEMIUM" :
                planSlug === "premium-builder" ? "PREMIUM_BUILDER" :
                "CUSTOM_DESIGN",
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
          paymentMethod: "wallet",
          completedAt: now,
        },
      });

      return NextResponse.json({
        success: true,
        tier: planSlug === "freemium" ? "FREEMIUM" :
              planSlug === "premium-builder" ? "PREMIUM_BUILDER" :
              "CUSTOM_DESIGN",
        subscriptionEndsAt: endDate,
        message: "تم الترقية بنجاح!",
      });
    }

    // Stripe flow
    const stripe = require("stripe")(STRIPE_SECRET);

    let stripeCustomerId = vendor.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session?.user?.email || undefined,
        metadata: { vendorId: vendor.id, userId: userId },
      });
      stripeCustomerId = customer.id;
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { stripeCustomerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/vendor/dashboard?tab=plans&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/vendor/dashboard?tab=plans&canceled=true`,
      metadata: {
        vendorId: vendor.id,
        planId: plan.id,
        planSlug,
      },
    });

    // Save pending transaction
    await prisma.paymentTransaction.create({
      data: {
        vendorId: vendor.id,
        planId: plan.id,
        amount: plan.price,
        status: "PENDING",
        stripeSessionId: checkoutSession.id,
        paymentMethod: "stripe",
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
