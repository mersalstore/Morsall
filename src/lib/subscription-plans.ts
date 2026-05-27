import { prisma } from "./db";

export const PLAN_SLUGS = {
  FREEMIUM: "freemium",
  PREMIUM_BUILDER: "premium-builder",
  CUSTOM_DESIGN: "custom-design",
} as const;

export type PlanSlug = (typeof PLAN_SLUGS)[keyof typeof PLAN_SLUGS];

export const TIER_BY_SLUG: Record<PlanSlug, "FREEMIUM" | "PREMIUM_BUILDER" | "CUSTOM_DESIGN"> = {
  [PLAN_SLUGS.FREEMIUM]: "FREEMIUM",
  [PLAN_SLUGS.PREMIUM_BUILDER]: "PREMIUM_BUILDER",
  [PLAN_SLUGS.CUSTOM_DESIGN]: "CUSTOM_DESIGN",
};

async function readDesignPricing() {
  const dp = await prisma.siteConfig.findUnique({ where: { key: "designPricing" } });
  if (!dp) return null;
  try {
    return JSON.parse(dp.value);
  } catch {
    return null;
  }
}

export async function ensureBasePlans() {
  const pricing = await readDesignPricing();
  const premiumPrice = pricing?.premium?.price ?? 15000;
  const customPrice = pricing?.custom?.price ?? 35000;

  const defaults = [
    {
      slug: PLAN_SLUGS.FREEMIUM,
      name: "الباقة التجريبية المجانية",
      price: 0,
      durationDays: 14,
      isTrial: true,
      canUploadProducts: true,
      canUseBuilder: false,
      canCustomDesign: false,
      maxProducts: 10,
      maxBlocks: 0,
      features: ["تجربة مجانية 14 يوم", "حد أقصى 10 منتجات", "تصميم متجر افتراضي"],
    },
    {
      slug: PLAN_SLUGS.PREMIUM_BUILDER,
      name: "باقة Premium Builder",
      price: premiumPrice,
      durationDays: 30,
      isTrial: false,
      canUploadProducts: true,
      canUseBuilder: true,
      canCustomDesign: false,
      maxProducts: 50,
      maxBlocks: 6,
      features: ["محرر متجر SaaS كامل", "رفع بانر مخصص", "اختيار منتجات مميزة", "حد أقصى 50 منتج"],
    },
    {
      slug: PLAN_SLUGS.CUSTOM_DESIGN,
      name: "باقة Custom Design (Vixcell)",
      price: customPrice,
      durationDays: 30,
      isTrial: false,
      canUploadProducts: true,
      canUseBuilder: true,
      canCustomDesign: true,
      maxProducts: 99999,
      maxBlocks: 99,
      features: [
        "منتجات بلا حدود",
        "تصميم متجر مخصص بفريق Vixcell",
        "تواصل مباشر مع فريق التصميم",
        "كل ميزات Premium Builder",
      ],
    },
  ];

  for (const planData of defaults) {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { slug: planData.slug } });
    if (!existing) {
      await prisma.subscriptionPlan.create({
        data: {
          ...planData,
          features: planData.features as any,
        },
      });
    } else {
      await prisma.subscriptionPlan.update({
        where: { slug: planData.slug },
        data: {
          name: planData.name,
          price: planData.price,
          durationDays: planData.durationDays,
          isTrial: planData.isTrial,
          canUploadProducts: planData.canUploadProducts,
          canUseBuilder: planData.canUseBuilder,
          canCustomDesign: planData.canCustomDesign,
          maxProducts: planData.maxProducts,
          maxBlocks: planData.maxBlocks,
          features: planData.features as any,
        },
      });
    }
  }
}

export async function getPlanBySlug(slug: PlanSlug) {
  await ensureBasePlans();
  return prisma.subscriptionPlan.findUnique({ where: { slug } });
}

export function resolvePlanSlugFromInput(input?: string | null): PlanSlug {
  if (!input) return PLAN_SLUGS.FREEMIUM;
  const normalized = input.toLowerCase().trim();
  if (normalized === "premium-builder" || normalized === "premium" || normalized === "pro") {
    return PLAN_SLUGS.PREMIUM_BUILDER;
  }
  if (normalized === "custom-design" || normalized === "custom" || normalized === "elite" || normalized === "vixcell") {
    return PLAN_SLUGS.CUSTOM_DESIGN;
  }
  return PLAN_SLUGS.FREEMIUM;
}
