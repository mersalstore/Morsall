import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { searchParams } = new URL(req.url);
    const history = searchParams.get("history");
    const driverId = searchParams.get("driverId");

    if (history) {
      const list = await prisma.driverSettlement.findMany({
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json(list);
    }

    if (driverId) {
      // Fetch unsettled orders for driver (either SHIPPED or DELIVERED, codCollected = false, COD method)
      const driverOrders = await prisma.order.findMany({
        where: {
          driverId,
          codCollected: false,
          status: { in: ["SHIPPED", "DELIVERED"] },
          paymentMethod: { in: ["COD", "cod"] }
        },
        orderBy: { createdAt: "desc" }
      });
      return NextResponse.json(driverOrders);
    }

    // Default: list vendors and drivers
    const vendors = await prisma.vendor.findMany({
      include: { user: true },
      orderBy: { storeName: 'asc' }
    });

    const drivers = await prisma.deliveryDriver.findMany({
      orderBy: { name: 'asc' }
    });

    // Calculate unsettled cash for each driver
    const unsettledCashes = await prisma.order.groupBy({
      by: ['driverId'],
      where: {
        driverId: { not: null },
        codCollected: false,
        status: { in: ['SHIPPED', 'DELIVERED'] },
        paymentMethod: { in: ['COD', 'cod'] }
      },
      _sum: {
        totalAmount: true
      }
    });

    const driversWithCash = drivers.map(d => {
      const unsettled = unsettledCashes.find(u => u.driverId === d.id);
      return {
        ...d,
        unsettledCash: unsettled?._sum?.totalAmount || 0
      };
    });

    const unsettledOrdersCount = await prisma.order.count({
      where: {
        driverId: { not: null },
        codCollected: false,
        status: { in: ['SHIPPED', 'DELIVERED'] },
        paymentMethod: { in: ['COD', 'cod'] }
      }
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const shippingProfitTodayAgg = await prisma.order.aggregate({
      where: {
        status: 'DELIVERED',
        deliveredAt: { gte: todayStart }
      },
      _sum: {
        shippingCost: true
      }
    });

    return NextResponse.json({ 
      vendors, 
      drivers: driversWithCash,
      unsettledOrdersCount,
      shippingProfitToday: shippingProfitTodayAgg._sum?.shippingCost || 0
    });
  } catch (error: any) {
    console.error("Fetch Settlements Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const body = await req.json();
    const { type, id, amount, actualCash, orderIds, notes } = body;

    if (!type || !id || amount === undefined) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    if (type === 'VENDOR') {
      const updated = await prisma.vendor.update({
        where: { id },
        data: {
          walletBalance: { decrement: Number(amount) }
        },
        include: { user: true }
      });
      return NextResponse.json({ success: true, vendor: updated });
    } else if (type === 'DRIVER') {
      const updated = await prisma.$transaction(async (tx) => {
        const driver = await tx.deliveryDriver.update({
          where: { id },
          data: { balance: { decrement: Number(amount) } }
        });
        await tx.driverWalletTransaction.create({
          data: {
            driverId: id,
            amount: -Number(amount),
            type: 'SETTLEMENT',
            description: 'تسوية مالية من الإدارة (دفع المستحقات)'
          }
        });
        return driver;
      });
      return NextResponse.json({ success: true, driver: updated });
    } else if (type === 'DRIVER_RECONCILIATION') {
      const actual = Number(actualCash);
      const expected = Number(amount);
      if (isNaN(actual) || actual < 0) {
        return NextResponse.json({ error: "المبلغ الفعلي غير صالح" }, { status: 400 });
      }
      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return NextResponse.json({ error: "لم يتم اختيار أي شحنات" }, { status: 400 });
      }

      const updatedDriver = await prisma.$transaction(async (tx) => {
        // 1. Update orders status and set codCollected = true
        await tx.order.updateMany({
          where: {
            id: { in: orderIds }
          },
          data: {
            status: "DELIVERED",
            codCollected: true,
            deliveredAt: new Date()
          }
        });

        // 2. Decrement driver balance by the actual cash turned in
        const driver = await tx.deliveryDriver.update({
          where: { id },
          data: {
            balance: { decrement: actual }
          }
        });

        // 3. Create driver wallet transaction record
        await tx.driverWalletTransaction.create({
          data: {
            driverId: id,
            amount: -actual,
            type: 'SETTLEMENT',
            description: notes || `تسوية عهدة كاش لعدد ${orderIds.length} شحنة`
          }
        });

        // 4. Create DriverSettlement record
        const difference = actual - expected;
        const employeeId = (session.user as any)?.id || 'admin';
        await tx.driverSettlement.create({
          data: {
            driverId: id,
            totalCash: expected,
            actualCash: actual,
            difference: difference,
            notes: notes || `تصفية عهدة كاش للطلبات: ${orderIds.join(', ')}`,
            settledBy: employeeId,
            orderIds: JSON.stringify(orderIds),
            status: difference === 0 ? "SETTLED" : "DISPUTED"
          }
        });

        return driver;
      });

      return NextResponse.json({ success: true, driver: updatedDriver });
    } else if (type === 'BULK_DRIVER_RECONCILIATION') {
      const employeeId = (session.user as any)?.id || 'admin';
      
      const result = await prisma.$transaction(async (tx) => {
        // Find all orders that need COD collection
        const orders = await tx.order.findMany({
          where: {
            driverId: { not: null },
            codCollected: false,
            status: { in: ['SHIPPED', 'DELIVERED'] },
            paymentMethod: { in: ['COD', 'cod'] }
          }
        });

        if (orders.length === 0) {
          return { settledCount: 0, totalAmount: 0 };
        }

        // Group by driverId
        const driverGroups: Record<string, { orderIds: string[], total: number }> = {};
        orders.forEach(o => {
          const dId = o.driverId!;
          if (!driverGroups[dId]) {
            driverGroups[dId] = { orderIds: [], total: 0 };
          }
          driverGroups[dId].orderIds.push(o.id);
          driverGroups[dId].total += o.totalAmount;
        });

        // Process each driver
        for (const [dId, data] of Object.entries(driverGroups)) {
          // Decrement balance
          await tx.deliveryDriver.update({
            where: { id: dId },
            data: {
              balance: { decrement: data.total }
            }
          });

          // Create transaction record
          await tx.driverWalletTransaction.create({
            data: {
              driverId: dId,
              amount: -data.total,
              type: 'SETTLEMENT',
              description: `تسوية جماعية لعدد ${data.orderIds.length} شحنة`
            }
          });

          // Create settlement log
          await tx.driverSettlement.create({
            data: {
              driverId: dId,
              totalCash: data.total,
              actualCash: data.total,
              difference: 0,
              notes: notes || `تسوية جماعية من لوحة التحكم لعدد ${data.orderIds.length} شحنة`,
              settledBy: employeeId,
              orderIds: JSON.stringify(data.orderIds),
              status: "SETTLED"
            }
          });
        }

        // Update all orders
        const allOrderIds = orders.map(o => o.id);
        await tx.order.updateMany({
          where: {
            id: { in: allOrderIds }
          },
          data: {
            status: "DELIVERED",
            codCollected: true,
            deliveredAt: new Date()
          }
        });

        const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        return { settledCount: orders.length, totalAmount };
      });

      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: "نوع غير صالح" }, { status: 400 });
  } catch (error: any) {
    console.error("Settlement POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
