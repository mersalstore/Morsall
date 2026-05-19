import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "new";
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const ids = searchParams.get("ids");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const vendorId = searchParams.get("vendorId");
  const attributes = searchParams.get("attributes");

  try {
    let orderBy: any = { createdAt: "desc" };
    if (sort === "best") orderBy = { purchaseCount: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "rated") orderBy = { reviews: { _count: "desc" } };

    const where: any = { 
      status: "APPROVED",
      vendor: {
        status: "APPROVED"
      }
    };
    
    if (category) where.categoryId = category;
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { shortDescription: { contains: search } },
        { sku: { contains: search } }
      ];
    }
    
    if (vendorId) where.vendorId = vendorId;
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    if (attributes) {
      const attrs = attributes.split(',').map(a => a.trim()).filter(Boolean);
      if (attrs.length > 0) {
        const attrConditions = attrs.map(attr => ({
          OR: [
            { sizes: { contains: attr } },
            { colors: { contains: attr } }
          ]
        }));
        
        if (where.OR) {
          where.AND = [{ OR: where.OR }, ...attrConditions];
          delete where.OR;
        } else {
          where.AND = attrConditions;
        }
      }
    }

    if (ids) {
      const idArray = ids.split(',').map(id => id.trim()).filter(Boolean);
      if (idArray.length > 0) {
        where.id = { in: idArray };
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: {
          select: { storeName: true, location: true, slug: true }
        },
        category: {
          select: { name: true }
        }
      },
      orderBy,
      take: 40
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Products API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error?.message }, { status: 500 });
  }
}
