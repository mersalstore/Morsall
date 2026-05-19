import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driverId");

    if (!driverId) {
      return NextResponse.json({ error: "driverId مطلوب" }, { status: 400 });
    }

    // Verify driver exists
    const driver = await prisma.deliveryDriver.findUnique({ where: { id: driverId } });
    if (!driver) {
      return NextResponse.json({ error: "المندوب غير مسجل" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { 
        driverId,
        status: { in: ["SHIPPED", "DELAYED", "PACKING"] } // عرض الطلبات قيد التوصيل أو التجهيز
      },
      orderBy: { updatedAt: "desc" },
      include: {
        items: {
          include: {
            product: { select: { title: true } }
          }
        }
      }
    });

    return NextResponse.json({ driver, orders });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch delivery orders" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { driver: true }
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    if (status === "DELIVERED") {
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // 1. Update order status and set delivered timestamp
        const ord = await tx.order.update({
          where: { id: orderId },
          data: {
            status: "DELIVERED",
            deliveredAt: new Date(),
          }
        });

        // 2. If payment method is COD and order has a driver, update driver's cash balance
        if (order.paymentMethod === "COD" && order.driverId) {
          await tx.deliveryDriver.update({
            where: { id: order.driverId },
            data: {
              balance: { increment: order.totalAmount }
            }
          });

          // 3. Create driver wallet transaction entry for cash collected
          await tx.driverWalletTransaction.create({
            data: {
              driverId: order.driverId,
              amount: order.totalAmount,
              type: "CASH_COLLECTION",
              description: `تحصيل كاش قيمة الطلب #${orderId.slice(-6).toUpperCase()}`
            }
          });
        }

        return ord;
      });

      return NextResponse.json({ success: true, order: updatedOrder });
    }

    // Support other status updates if needed
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("Delivery status update error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}

