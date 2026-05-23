import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: "asc" },
    });

    const defaultPlans = [
      {
        slug: "freemium",
        name: "مجاني",
        price: 0,
        durationDays: 0,
        canUploadProducts: false,
        canUseBuilder: false,
        canCustomDesign: false,
        maxProducts: 0,
        maxBlocks: 0,
        features: ["تصفح المنصة", "إنشاء متجر مجاني", "إدارة الطلبات الأساسية"],
        isDefault: true,
      },
      {
        slug: "premium-builder",
        name: "منشئ المتاجر",
        price: 15000,
        durationDays: 30,
        canUploadProducts: true,
        canUseBuilder: true,
        canCustomDesign: false,
        maxProducts: 50,
        maxBlocks: 20,
        features: [
          "رفع المنتجات وبيعها",
          "منشئ مواقع بالسحب والإفلات",
          "قوالب جاهزة",
          "معرض متجر مخصص",
        ],
        isDefault: false,
      },
      {
        slug: "custom-design",
        name: "تصميم مخصص",
        price: 35000,
        durationDays: 30,
        canUploadProducts: true,
        canUseBuilder: true,
        canCustomDesign: true,
        maxProducts: 200,
        maxBlocks: 999,
        features: [
          "كل ميزات البريميوم",
          "فريق التصميم يصمم متجرك",
          "عدد غير محدود من المنتجات",
          "دعم فني مخصص",
        ],
        isDefault: false,
      },
    ];

    if (plans.length === 0) {
      return NextResponse.json({ plans: defaultPlans });
    }

    const mergedPlans = defaultPlans.map((dp) => {
      const dbPlan = plans.find((p) => p.slug === dp.slug);
      return dbPlan
        ? {
            ...dp,
            id: dbPlan.id,
            price: dbPlan.price,
            canUploadProducts: dbPlan.canUploadProducts,
            canUseBuilder: dbPlan.canUseBuilder,
            canCustomDesign: dbPlan.canCustomDesign,
            maxProducts: dbPlan.maxProducts,
            maxBlocks: dbPlan.maxBlocks,
            features: dbPlan.features as string[],
            stripePriceId: dbPlan.stripePriceId,
          }
        : dp;
    });

    return NextResponse.json({ plans: mergedPlans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
