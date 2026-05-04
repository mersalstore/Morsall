import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const [pendingVendors, pendingProducts] = await Promise.all([
      prisma.vendor.findMany({
        where: { status: "PENDING" },
        include: { user: { select: { name: true, email: true, phone: true } } },
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.findMany({
        where: { status: "PENDING" },
        include: { vendor: { select: { storeName: true } } },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return NextResponse.json({
      vendors: pendingVendors,
      products: pendingProducts
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
