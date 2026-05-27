import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_TIERS_BY_VENDOR_TIER: Record<string, string[]> = {
  FREEMIUM: ["basic"],
  PREMIUM_BUILDER: ["basic", "premium"],
  CUSTOM_DESIGN: ["basic", "premium", "custom"],
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { vendorProfile: true },
  });

  if (!user?.vendorProfile)
    return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

  let design: any = null;
  if (user.vendorProfile.storeDesign) {
    try {
      design = JSON.parse(user.vendorProfile.storeDesign);
    } catch {
      design = null;
    }
  }

  const dp = await prisma.siteConfig.findUnique({ where: { key: "designPricing" } });
  const designPricing = dp
    ? JSON.parse(dp.value)
    : {
        basic: { price: 0, label: "مجاني", sections: 4 },
        premium: { price: 15000, label: "بريميوم", sections: 10 },
        custom: { price: 35000, label: "مخصص", sections: 20 },
      };

  return NextResponse.json({ design, designPricing, vendor: user.vendorProfile });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { vendorProfile: true },
  });

  if (!user?.vendorProfile)
    return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

  const vendor = user.vendorProfile;
  const vendorTier = (vendor.tier as keyof typeof ALLOWED_TIERS_BY_VENDOR_TIER) || "FREEMIUM";

  if (vendorTier === "FREEMIUM") {
    return NextResponse.json(
      {
        error: "تخصيص المتجر متاح فقط لباقات Premium Builder و Custom Design. يرجى ترقية الاشتراك.",
        code: "PLAN_UPGRADE_REQUIRED",
      },
      { status: 403 },
    );
  }

  const body = await req.json();
  const {
    sections,
    designTier,
    featuredProductIds,
    blocks,
    welcomeText,
    bannerUrl,
  } = body as {
    sections?: any[];
    designTier?: string;
    featuredProductIds?: string[];
    blocks?: any[];
    welcomeText?: string;
    bannerUrl?: string;
  };

  const allowedTiers = ALLOWED_TIERS_BY_VENDOR_TIER[vendorTier] || ["basic"];
  const requestedTier = designTier && allowedTiers.includes(designTier) ? designTier : allowedTiers[allowedTiers.length - 1];

  if (designTier === "custom" && vendorTier !== "CUSTOM_DESIGN") {
    return NextResponse.json(
      {
        error: "تيير custom متاح فقط لباقة Custom Design.",
        code: "PLAN_UPGRADE_REQUIRED",
      },
      { status: 403 },
    );
  }

  let validatedFeaturedIds: string[] = [];
  if (Array.isArray(featuredProductIds) && featuredProductIds.length > 0) {
    const products = await prisma.product.findMany({
      where: {
        id: { in: featuredProductIds },
        vendorId: vendor.id,
      },
      select: { id: true },
    });
    const maxFeatured = vendorTier === "CUSTOM_DESIGN" ? 12 : 6;
    validatedFeaturedIds = products.map((p) => p.id).slice(0, maxFeatured);
  }

  const sanitizedBlocks =
    vendorTier === "CUSTOM_DESIGN" && Array.isArray(blocks)
      ? blocks.filter((b: any) => b && typeof b.type === "string").slice(0, 30)
      : [];

  try {
    const updateData: any = {
      storeDesign: JSON.stringify({
        sections: sections ?? [],
        designTier: requestedTier,
        featuredProductIds: validatedFeaturedIds,
        blocks: sanitizedBlocks,
        updatedAt: new Date().toISOString(),
      }),
    };

    if (welcomeText !== undefined) {
      updateData.storeDescription = welcomeText.toString().slice(0, 2000);
    }

    if (bannerUrl !== undefined) {
      updateData.storeBanner = bannerUrl?.toString() || null;
    }

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
