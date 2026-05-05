
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

    const body = await req.json();
    const { 
      title, description, shortDescription, price, stock, images, categoryId, 
      sizes, colors, brand, range, type, sku, weight, length, width, height,
      ram, storage, screenSize, bundleData, discountPrice, discountType
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
          ram: ram || null,
          storage: storage || null,
          screenSize: screenSize || null,
          bundleData: bundleData || null,
          vendorId: vendor.id,
          categoryId: categoryId || null,
          status: "PENDING"
        }
      });

      // Handle specific attributes if provided
      if (body.productAttributes && Array.isArray(body.productAttributes)) {
        await tx.productAttribute.createMany({
          data: body.productAttributes.map((attr: any) => ({
            productId: p.id,
            name: attr.name,
            values: attr.values
          }))
        });
      }

      // Handle variations if provided
      if (body.variations && Array.isArray(body.variations)) {
        await tx.productVariation.createMany({
          data: body.variations.map((v: any) => ({
            productId: p.id,
            sku: v.sku || null,
            price: v.price ? parseFloat(v.price) : null,
            stock: parseInt(v.stock) || 0,
            combination: JSON.stringify(v.combination),
            image: v.image || null
          }))
        });
      }

      return p;
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Product Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
