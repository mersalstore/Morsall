import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

// GET — Fetch all products for the inventory dashboard
export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const vendorId = searchParams.get("vendorId");

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { vendor: { storeName: { contains: search } } },
      ];
    }
    if (vendorId) {
      whereClause.vendorId = vendorId;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        vendor: { select: { storeName: true } },
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Inventory GET error:", error);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}

// POST — Create single or Bulk update products
export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const body = await req.json();

    // If it's a single product creation (no products array)
    if (!body.products && body.title) {
      const { 
        title, description, price, stock, categoryId, vendorId, images, sku,
        brand, range, type, weight, length, width, height,
        bundleData, discountPrice, discountType, status,
        productAttributes, variations, specifications
      } = body;
      
      const numPrice = parseFloat(price);
      const numStock = parseInt(stock);
      const numWeight = weight ? parseFloat(weight) : null;
      const numLength = length ? parseFloat(length) : null;
      const numWidth = width ? parseFloat(width) : null;
      const numHeight = height ? parseFloat(height) : null;
      const numDiscountPrice = discountPrice ? parseFloat(discountPrice) : null;

      if (isNaN(numPrice)) {
        return NextResponse.json({ error: "السعر يجب أن يكون رقماً صالحاً" }, { status: 400 });
      }
      if (isNaN(numStock)) {
        return NextResponse.json({ error: "الكمية يجب أن تكون رقماً صالحاً" }, { status: 400 });
      }

      const product = await prisma.$transaction(async (tx) => {
        const p = await tx.product.create({
          data: {
            title,
            description: description || "",
            shortDescription: body.shortDescription || null,
            price: numPrice,
            stock: numStock,
            categoryId: categoryId || null,
            vendorId,
            images: images || "",
            sku: sku || null,
            brand: brand || null,
            range: range || null,
            type: type || "SIMPLE",
            weight: numWeight,
            length: numLength,
            width: numWidth,
            height: numHeight,
            discountPrice: numDiscountPrice,
            discountType: discountType || null,
            bundleData: bundleData || null,
            specifications: specifications ? (typeof specifications === 'string' ? specifications : JSON.stringify(specifications)) : null,
            status: status || "APPROVED"
          }
        });

        // Handle specific attributes if provided
        if (productAttributes && Array.isArray(productAttributes) && productAttributes.length > 0) {
          await tx.productAttribute.createMany({
            data: productAttributes.map((attr: any) => ({
              productId: p.id,
              name: attr.name,
              values: attr.values
            }))
          });
        }

        // Handle variations if provided
        if (variations && Array.isArray(variations) && variations.length > 0) {
          await tx.productVariation.createMany({
            data: variations.map((v: any) => ({
              productId: p.id,
              sku: v.sku || null,
              price: v.price ? parseFloat(v.price) : numPrice,
              stock: parseInt(v.stock) || 0,
              combination: typeof v.combination === "string" ? v.combination : JSON.stringify(v.combination || {}),
              image: Array.isArray(v.images) ? v.images[0] : v.image || null
            }))
          });
        }

        return p;
      });

      return NextResponse.json(product);
    }

    const { products } = body;
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "مصفوفة المنتجات غير صالحة أو فارغة" }, { status: 400 });
    }

    let updatedCount = 0;
    const errors: string[] = [];

    for (const p of products) {
      if (!p.id) {
        errors.push(`منتج بدون ID: ${p.title || 'Unknown'}`);
        continue;
      }

      try {
        const updateData: any = {};
        if (p.title !== undefined) updateData.title = p.title;
        if (p.price !== undefined) updateData.price = parseFloat(p.price);
        if (p.stock !== undefined) updateData.stock = parseInt(p.stock, 10);
        if (p.status !== undefined) updateData.status = p.status;
        if (p.images !== undefined) updateData.images = p.images;
        if (p.brand !== undefined) updateData.brand = p.brand;
        if (p.range !== undefined) updateData.range = p.range;
        if (p.type !== undefined) updateData.type = p.type;
        if (p.sku !== undefined) updateData.sku = p.sku;
        if (p.shortDescription !== undefined) updateData.shortDescription = p.shortDescription;
        if (p.weight !== undefined) updateData.weight = parseFloat(p.weight) || null;
        if (p.length !== undefined) updateData.length = parseFloat(p.length) || null;
        if (p.width !== undefined) updateData.width = parseFloat(p.width) || null;
        if (p.height !== undefined) updateData.height = parseFloat(p.height) || null;
        if (p.ram !== undefined) updateData.ram = p.ram;
        if (p.storage !== undefined) updateData.storage = p.storage;
        if (p.screenSize !== undefined) updateData.screenSize = p.screenSize;
        if (p.bundleData !== undefined) updateData.bundleData = p.bundleData;
        if (p.discountPrice !== undefined) updateData.discountPrice = parseFloat(p.discountPrice) || null;
        if (p.discountType !== undefined) updateData.discountType = p.discountType;

        await prisma.product.update({
          where: { id: p.id },
          data: updateData
        });
        updatedCount++;
      } catch (err: any) {
        errors.push(`فشل تحديث (${p.id}): ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error("Inventory POST error:", error);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const body = await req.json();
    const { 
      id, title, description, price, stock, categoryId, vendorId, images, sku, 
      shortDescription, discountPrice, discountType, status,
      brand, range, type, weight, length, width, height, bundleData, specifications
    } = body;

    if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && description !== "" && { description }),
          ...(shortDescription !== undefined && { shortDescription }),
          ...(price !== undefined && { price: parseFloat(price) }),
          ...(stock !== undefined && { stock: parseInt(stock) }),
          ...(categoryId !== undefined && { categoryId: categoryId || null }),
          ...(vendorId !== undefined && { vendorId }),
          ...(images !== undefined && { images }),
          ...(sku !== undefined && { sku }),
          ...(brand !== undefined && { brand }),
          ...(range !== undefined && { range }),
          ...(type !== undefined && { type }),
          ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
          ...(length !== undefined && { length: length ? parseFloat(length) : null }),
          ...(width !== undefined && { width: width ? parseFloat(width) : null }),
          ...(height !== undefined && { height: height ? parseFloat(height) : null }),
          ...(discountPrice !== undefined && { discountPrice: discountPrice ? parseFloat(discountPrice) : null }),
          ...(discountType !== undefined && { discountType }),
          ...(status !== undefined && { status }),
          ...(bundleData !== undefined && { bundleData }),
          ...(specifications !== undefined && { specifications: specifications ? (typeof specifications === 'string' ? specifications : JSON.stringify(specifications)) : null })
        }
      });

      // Update attributes if provided
      if (body.productAttributes !== undefined && Array.isArray(body.productAttributes)) {
        await tx.productAttribute.deleteMany({ where: { productId: id } });
        if (body.productAttributes.length > 0) {
          await tx.productAttribute.createMany({
            data: body.productAttributes.map((attr: any) => ({
              productId: id,
              name: attr.name,
              values: attr.values
            }))
          });
        }
      }

      // Update variations if provided
      if (body.variations !== undefined && Array.isArray(body.variations)) {
        await tx.productVariation.deleteMany({ where: { productId: id } });
        if (body.variations.length > 0) {
          await tx.productVariation.createMany({
            data: body.variations.map((v: any) => ({
              productId: id,
              sku: v.sku || null,
              price: v.price ? parseFloat(v.price) : p.price,
              stock: parseInt(v.stock) || 0,
              combination: typeof v.combination === "string" ? v.combination : JSON.stringify(v.combination || {}),
              image: Array.isArray(v.images) ? v.images[0] : v.image || null
            }))
          });
        }
      }

      return p;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Inventory PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}
