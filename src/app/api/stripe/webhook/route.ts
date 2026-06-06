import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logSecurity, extractIp } from "@/lib/security-log";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const clientIp = extractIp(req);
  const userAgent = req.headers.get("user-agent") || "";
  try {
    if (!STRIPE_SECRET || !WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 200 });
    }

    const stripe = require("stripe")(STRIPE_SECRET);
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (e: any) {
      await logSecurity({
        type: "UNAUTHORIZED_ACCESS",
        severity: "WARN",
        ip: clientIp,
        userAgent,
        endpoint: "/api/stripe/webhook",
        method: "POST",
        message: `Stripe webhook invalid signature validation failure: ${e.message || "Invalid signature"}`,
        details: { signature, bodySnippet: body.slice(0, 500) },
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const vendorId = session.metadata?.vendorId;
        const planId = session.metadata?.planId;
        const planSlug = session.metadata?.planSlug;

        if (!vendorId || !planId || !planSlug) break;

        const plan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId },
        });

        if (!plan) break;

        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + plan.durationDays);

        await prisma.vendor.update({
          where: { id: vendorId },
          data: {
            tier: planSlug === "freemium" ? "FREEMIUM" :
                  planSlug === "premium-builder" ? "PREMIUM_BUILDER" :
                  "CUSTOM_DESIGN",
            planId,
            subscriptionEndsAt: endDate,
          },
        });

        await prisma.paymentTransaction.updateMany({
          where: { stripeSessionId: session.id },
          data: {
            status: "COMPLETED",
            stripePaymentIntentId: session.payment_intent,
            completedAt: now,
          },
        });

        // Log security PAYMENT_SUCCESS
        await logSecurity({
          type: "PAYMENT_SUCCESS",
          severity: "INFO",
          ip: clientIp,
          userAgent,
          vendorId,
          endpoint: "/api/stripe/webhook",
          method: "POST",
          message: `Stripe checkout subscription succeeded. Plan: ${plan.name}, Amount: ${session.amount_total / 100} ${session.currency}`,
          details: { sessionId: session.id, planSlug },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const customerId = invoice.customer;

        const vendor = await prisma.vendor.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!vendor || !vendor.planId) break;

        const plan = await prisma.subscriptionPlan.findUnique({
          where: { id: vendor.planId },
        });

        if (!plan) break;

        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + plan.durationDays);

        await prisma.vendor.update({
          where: { id: vendor.id },
          data: { subscriptionEndsAt: endDate },
        });

        await prisma.paymentTransaction.create({
          data: {
            vendorId: vendor.id,
            planId: vendor.planId,
            amount: invoice.amount_paid / 100,
            status: "COMPLETED",
            stripeSubscriptionId: subscriptionId,
            stripePaymentIntentId: invoice.payment_intent,
            paymentMethod: "stripe",
            completedAt: now,
          },
        });

        // Log security PAYMENT_SUCCESS
        await logSecurity({
          type: "PAYMENT_SUCCESS",
          severity: "INFO",
          ip: clientIp,
          userAgent,
          vendorId: vendor.id,
          userEmail: invoice.customer_email || null,
          endpoint: "/api/stripe/webhook",
          method: "POST",
          message: `Stripe recurring invoice payment succeeded. Amount: ${invoice.amount_paid / 100} ${invoice.currency}`,
          details: { invoiceId: invoice.id, subscriptionId },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const customerId = invoice.customer;

        const vendor = await prisma.vendor.findFirst({
          where: { stripeCustomerId: customerId },
        });

        // Log security PAYMENT_FAIL
        await logSecurity({
          type: "PAYMENT_FAIL",
          severity: "WARN",
          ip: clientIp,
          userAgent,
          vendorId: vendor?.id || null,
          userEmail: invoice.customer_email || null,
          endpoint: "/api/stripe/webhook",
          method: "POST",
          message: `Stripe invoice payment failed. Amount: ${invoice.amount_due / 100} ${invoice.currency}`,
          details: { invoiceId: invoice.id, subscriptionId, customerId },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const vendor = await prisma.vendor.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (vendor) {
          await prisma.vendor.update({
            where: { id: vendor.id },
            data: {
              tier: "FREEMIUM",
              planId: null,
              subscriptionEndsAt: new Date(),
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
