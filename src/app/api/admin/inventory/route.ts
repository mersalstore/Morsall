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

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { vendor: { storeName: { contains: search, mode: "insensitive" } } },
      ];
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
      const { title, description, price, stock, categoryId, vendorId, images, sku } = body;
      const product = await prisma.product.create({
        data: {
          title,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          categoryId,
          vendorId,
          images,
          sku,
          status: "APPROVED" // Admin created products are auto-approved
        }
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

    const { id, title, description, price, stock, categoryId, vendorId, images, sku } = await req.json();

    if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        categoryId,
        vendorId,
        images,
        sku
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Inventory PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}
