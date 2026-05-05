import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — Public categories for product listing and vendor usage
export async function GET() {
  try {
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
