import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — Public categories for product listing and vendor usage
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // جلب قسم واحد مع منتجاته ومنتجات أقسامه الفرعية
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            include: { vendor: { select: { storeName: true, location: true } } },
            where: { status: "APPROVED", vendor: { status: "APPROVED" } },
            orderBy: { createdAt: "desc" },
          },
          children: {
            include: {
              products: {
                include: { vendor: { select: { storeName: true, location: true } } },
                where: { status: "APPROVED", vendor: { status: "APPROVED" } },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });

      if (!category) {
        return NextResponse.json(null, { status: 404 });
      }

      // دمج منتجات الأقسام الفرعية مع منتجات القسم الرئيسي
      const childProducts = (category as any).children?.flatMap((c: any) => c.products || []) || [];
      const allProducts = [...(category as any).products, ...childProducts];

      return NextResponse.json({ ...category, products: allProducts });
    }

    const categories = await prisma.category.findMany({
      include: { 
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true } }
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (err: any) {
    console.error("Public Categories GET Error:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
