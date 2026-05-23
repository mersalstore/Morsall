import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      include: { plan: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const now = new Date();
    const isActive = vendor.subscriptionEndsAt
      ? new Date(vendor.subscriptionEndsAt) > now
      : vendor.tier === "FREEMIUM";

    const planFeatures = vendor.plan
      ? {
          canUploadProducts: vendor.plan.canUploadProducts,
          canUseBuilder: vendor.plan.canUseBuilder,
          canCustomDesign: vendor.plan.canCustomDesign,
          maxProducts: vendor.plan.maxProducts,
          maxBlocks: vendor.plan.maxBlocks,
        }
      : {
          canUploadProducts: vendor.tier === "PREMIUM_BUILDER" || vendor.tier === "CUSTOM_DESIGN",
          canUseBuilder: vendor.tier === "PREMIUM_BUILDER" || vendor.tier === "CUSTOM_DESIGN",
          canCustomDesign: vendor.tier === "CUSTOM_DESIGN",
          maxProducts: vendor.tier === "FREEMIUM" ? 0 : vendor.tier === "PREMIUM_BUILDER" ? 50 : 200,
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
