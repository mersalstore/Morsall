import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const now = new Date();
    const isActive = vendor.subscriptionEndsAt
      ? new Date(vendor.subscriptionEndsAt) > now
      : vendor.tier === "FREEMIUM";

    const tmpTrial = await prisma.siteConfig.findUnique({ where: { key: "trialMaxProducts" } });
    const tmpPremium = await prisma.siteConfig.findUnique({ where: { key: "premiumMaxProducts" } });
    const trialMaxProducts = tmpTrial ? parseInt(tmpTrial.value) : 10;
    const premiumMaxProducts = tmpPremium ? parseInt(tmpPremium.value) : 50;

    const planFeatures = vendor.plan
      ? {
          canUploadProducts: vendor.plan.canUploadProducts,
          canUseBuilder: vendor.plan.canUseBuilder,
          canCustomDesign: vendor.plan.canCustomDesign,
          maxProducts: vendor.plan.maxProducts,
          maxBlocks: vendor.plan.maxBlocks,
        }
      : {
          canUploadProducts: true,
          canUseBuilder: vendor.tier === "PREMIUM_BUILDER" || vendor.tier === "CUSTOM_DESIGN",
          canCustomDesign: vendor.tier === "CUSTOM_DESIGN",
          maxProducts: vendor.tier === "FREEMIUM" ? trialMaxProducts : vendor.tier === "PREMIUM_BUILDER" ? premiumMaxProducts : 99999,
          maxBlocks: vendor.tier === "FREEMIUM" ? 0 : vendor.tier === "PREMIUM_BUILDER" ? 20 : 999,
        };

    return NextResponse.json({
      tier: vendor.tier,
      planId: vendor.planId,
      planName: vendor.plan?.name ||
        (vendor.tier === "FREEMIUM" ? "مجاني" :
         vendor.tier === "PREMIUM_BUILDER" ? "منشئ المتاجر" : "تصميم مخصص"),
      isActive,
      subscriptionEndsAt: vendor.subscriptionEndsAt,
      ...planFeatures,
    });
  } catch (error) {
    console.error("Error fetching vendor plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
