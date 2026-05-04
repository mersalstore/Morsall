import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "new";
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const ids = searchParams.get("ids");

  try {
    let orderBy: any = { createdAt: "desc" };
    if (sort === "best") orderBy = { purchaseCount: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };

    const where: any = { status: "APPROVED" };
    if (category) where.categoryId = category;
    if (search) where.title = { contains: search, mode: "insensitive" };
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
