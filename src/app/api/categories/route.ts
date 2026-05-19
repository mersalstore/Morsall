import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — Public categories for product listing and vendor usage
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // جلب قسم واحد مع منتجاته
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            include: { vendor: { select: { storeName: true, location: true } } },
            where: { status: "APPROVED" },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      return NextResponse.json(category);
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
