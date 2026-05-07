
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
      include: { plan: true }
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    }

    // 1. Total Sales (Gross from all order items)
    const orderItems = await prisma.orderItem.findMany({
      where: {
        vendorId: vendor.id,
        order: {
          status: { in: ["APPROVED", "PACKING", "SHIPPED", "DELIVERED"] }
        }
      },
      select: {
        priceAtTime: true,
        quantity: true
      }
    });

    const totalSales = orderItems.reduce((acc, item) => acc + (item.priceAtTime * item.quantity), 0);

    // 2. Net Profit (Subtracting platform commission)
    // Formula: totalSales * (1 - commissionRate / 100) - fixedFee
    const netProfit = totalSales * (1 - vendor.commissionRate / 100) - vendor.fixedFee;

    // 3. Active Orders Count (PENDING_APPROVAL, APPROVED, PACKING, SHIPPED)
    const activeOrdersCount = await prisma.order.count({
      where: {
        items: {
          some: { vendorId: vendor.id }
        },
        status: { in: ["PENDING_APPROVAL", "APPROVED", "PACKING", "SHIPPED"] }
      }
    });

    return NextResponse.json({
      totalSales,
      netProfit: Math.max(0, netProfit),
      activeOrdersCount,
      subscriptionEndsAt: vendor.subscriptionEndsAt,
      planName: vendor.plan?.name,
      slug: vendor.slug,
      currency: "ج.س",
      commissionRate: vendor.commissionRate,
      commissionType: vendor.commissionType,
    });
  } catch (error: any) {
    console.error("Vendor Stats API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
