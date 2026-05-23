import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planSlug } = await req.json();

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
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
        email: session.user.email,
        metadata: { vendorId: vendor.id, userId: session.user.id },
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
