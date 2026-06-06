
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } }
      }
    });

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    }

    // Block unapproved vendors from uploading products
    if (vendor.status !== "APPROVED") {
      return NextResponse.json({
        error: "حسابك قيد المراجعة حالياً. لا يمكنك رفع منتجات حتى يتم قبول حسابك من قبل الإدارة.",
        code: "PENDING_APPROVAL",
      }, { status: 403 });
    }

    // SaaS Paywall: check if subscription/trial is active
    const tier = vendor.tier || "FREEMIUM";
    const isSubActive = (tier === "CUSTOM_DESIGN") || (vendor.subscriptionEndsAt
      ? new Date(vendor.subscriptionEndsAt) > new Date()
      : false);

    if (!isSubActive) {
      return NextResponse.json({
        error: "انتهت فترة اشتراكك أو الفترة التجريبية. يرجى تجديد الاشتراك أو الترقية لبدء البيع مجدداً.",
        code: "PLAN_UPGRADE_REQUIRED",
      }, { status: 403 });
    }

    // Count existing products to enforce maxProducts limit
    const productCount = await prisma.product.count({
      where: { vendorId: vendor.id },
    });

    // Fetch limits from SiteConfig
    const tmpTrial = await prisma.siteConfig.findUnique({ where: { key: "trialMaxProducts" } });
    const tmpPremium = await prisma.siteConfig.findUnique({ where: { key: "premiumMaxProducts" } });
    const trialMaxProducts = tmpTrial ? parseInt(tmpTrial.value) : 10;
    const premiumMaxProducts = tmpPremium ? parseInt(tmpPremium.value) : 50;

    if (tier === "FREEMIUM" && productCount >= trialMaxProducts) {
      return NextResponse.json({
        error: `لقد تجاوزت الحد الأقصى للمنتجات المسموح بها في الباقة التجريبية وهو ${trialMaxProducts} منتجات. يرجى الترقية إلى باقة Premium Builder للحصول على حد أعلى.`,
        code: "PLAN_UPGRADE_REQUIRED",
      }, { status: 403 });
    }

    if (tier === "PREMIUM_BUILDER" && productCount >= premiumMaxProducts) {
      return NextResponse.json({
        error: `لقد تجاوزت الحد الأقصى للمنتجات المسموح بها في الباقة الاحترافية وهو ${premiumMaxProducts} منتجات. يرجى الترقية إلى الباقة المخصصة للحصول على منتجات غير محدودة.`,
        code: "PLAN_UPGRADE_REQUIRED",
      }, { status: 403 });
    }

    const body = await req.json();
    const { 
      title, description, shortDescription, price, stock, images, categoryId, 
      sizes, colors, brand, range, type, sku, weight, length, width, height,
      bundleData, discountPrice, discountType
    } = body;

    const numericPrice = parseFloat(price);
    const numericStock = parseInt(stock);
    const numericWeight = weight ? parseFloat(weight) : null;
    const numericLength = length ? parseFloat(length) : null;
    const numericWidth = width ? parseFloat(width) : null;
    const numericHeight = height ? parseFloat(height) : null;
    const numericDiscountPrice = discountPrice ? parseFloat(discountPrice) : null;

    if (!title || isNaN(numericPrice)) {
      return NextResponse.json({ error: "الاسم مطلوب والسعر يجب أن يكون رقماً صالحاً" }, { status: 400 });
    }
    if (isNaN(numericStock)) {
      return NextResponse.json({ error: "الكمية يجب أن تكون رقماً صالحاً" }, { status: 400 });
    }

    console.log("Starting product creation for vendor:", vendor.id, "Title:", title);

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          title,
          description: description || "",
          shortDescription: shortDescription || null,
          price: numericPrice,
          stock: numericStock,
          images: Array.isArray(images) ? images.join(",") : images || "",
          brand: brand || null,
          range: range || null,
          type: type || "SIMPLE",
          sku: sku || null,
          weight: numericWeight,
          length: numericLength,
          width: numericWidth,
          height: numericHeight,
          discountPrice: numericDiscountPrice,
          discountType: discountType || null,
          bundleData: bundleData || null,
          vendorId: vendor.id,
          categoryId: categoryId || null,
          status: "PENDING"
        }
      });

      console.log("Product created:", p.id);

      // Handle specific attributes if provided
      if (body.productAttributes && Array.isArray(body.productAttributes) && body.productAttributes.length > 0) {
        console.log("Adding attributes:", body.productAttributes.length);
        await tx.productAttribute.createMany({
          data: body.productAttributes.map((attr: any) => ({
            productId: p.id,
            name: attr.name,
            values: attr.values
          }))
        });
      }

      // Handle variations if provided
      if (body.variations && Array.isArray(body.variations) && body.variations.length > 0) {
        console.log("Adding variations:", body.variations.length);
        await tx.productVariation.createMany({
          data: body.variations.map((v: any) => ({
            productId: p.id,
            sku: v.sku || null,
            price: v.price ? parseFloat(v.price) : numericPrice,
            stock: parseInt(v.stock) || 0,
            combination: JSON.stringify(v.combination || {}),
            image: Array.isArray(v.images) ? v.images[0] : v.image || null
          }))
        });
      }

      return p;
    });

    console.log("Successfully created product:", product.id);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("VENDOR PRODUCT CREATION ERROR:", error);
    return NextResponse.json({ 
      error: error.message || "حدث خطأ أثناء حفظ المنتج",
      details: error.code || null
    }, { status: 500 });
  }
}
