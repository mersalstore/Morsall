import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";
import { saveAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { barcode, driverId, branchId } = await req.json();

    if (!barcode) {
      return NextResponse.json({ error: "الباركود مطلوب" }, { status: 400 });
    }

    // 1. Check if the barcode matches a Driver (to set active driver)
    const matchedDriver = await prisma.deliveryDriver.findFirst({
      where: {
        OR: [
          { id: barcode },
          { phone: barcode },
          { name: { contains: barcode } }
        ]
      }
    });

    if (matchedDriver) {
      await saveAuditLog({
        userId: (session.user as any).id,
        action: "DRIVER_SCAN_ACTIVE",
        entityId: matchedDriver.id,
        details: `تم مسح باركود المندوب ${matchedDriver.name} وتعيينه كنشط للتوجيه.`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
      });

      return NextResponse.json({
        type: "DRIVER",
        driver: matchedDriver,
        message: `تم تعيين المندوب النشط: ${matchedDriver.name}`
      });
    }

    // 1.5. Check if the barcode matches a Branch (to set active branch)
    const matchedBranch = await prisma.branch.findFirst({
      where: {
        OR: [
          { id: barcode },
          { name: { contains: barcode } }
        ]
      }
    });

    if (matchedBranch) {
      await saveAuditLog({
        userId: (session.user as any).id,
        action: "BRANCH_SCAN_ACTIVE",
        entityId: matchedBranch.id,
        details: `تم مسح باركود الفرع ${matchedBranch.name} وتعيينه كنشط للتوجيه.`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
      });

      return NextResponse.json({
        type: "BRANCH",
        branch: matchedBranch,
        message: `تم تعيين الفرع النشط: ${matchedBranch.name}`
      });
    }

    // 2. Check if the barcode matches an Order
    const matchedOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id: barcode },
          { trackingNumber: barcode }
        ]
      },
      include: {
        driver: true
      }
    });

    if (!matchedOrder) {
      return NextResponse.json({ error: "لم يتم العثور على شحنة أو سائق أو فرع بهذا الباركود" }, { status: 404 });
    }

    // If a driverId is provided, assign the order to this driver immediately
    if (driverId) {
      const driver = await prisma.deliveryDriver.findUnique({ where: { id: driverId } });
      if (!driver) {
        return NextResponse.json({ error: "السائق المحدد غير موجود" }, { status: 404 });
      }

      const oldStatus = matchedOrder.status;

      const updatedOrder = await prisma.order.update({
        where: { id: matchedOrder.id },
        data: {
          driverId: driver.id,
          branchId: null,
          status: "SHIPPED",
          assignedAt: new Date()
        },
        include: { driver: true }
      });

      // Save Audit Trail Log
      await saveAuditLog({
        userId: (session.user as any).id,
        action: "ORDER_ASSIGNED_VIA_BARCODE",
        entityId: matchedOrder.id,
        details: `تم إسناد الطلب #${matchedOrder.id.slice(-6).toUpperCase()} للمندوب ${driver.name} عبر الباركود. تغيير الحالة من ${oldStatus} إلى SHIPPED.`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
      });

      return NextResponse.json({
        type: "ORDER",
        order: updatedOrder,
        assigned: true,
        message: `تم إسناد الشحنة #${matchedOrder.id.slice(-6).toUpperCase()} للمندوب ${driver.name} بنجاح!`
      });
    }

    // If a branchId is provided, assign the order to this branch immediately
    if (branchId) {
      const branch = await prisma.branch.findUnique({ where: { id: branchId } });
      if (!branch) {
        return NextResponse.json({ error: "الفرع المحدد غير موجود" }, { status: 404 });
      }

      const oldStatus = matchedOrder.status;

      const updatedOrder = await prisma.order.update({
        where: { id: matchedOrder.id },
        data: {
          branchId: branch.id,
          driverId: null,
          status: "AT_BRANCH",
          assignedAt: null
        },
        include: { driver: true }
      });

      // Save Audit Trail Log
      await saveAuditLog({
        userId: (session.user as any).id,
        action: "ORDER_ROUTED_TO_BRANCH_VIA_BARCODE",
        entityId: matchedOrder.id,
        details: `تم توجيه الطلب #${matchedOrder.id.slice(-6).toUpperCase()} للفرع ${branch.name} عبر الباركود. تغيير الحالة من ${oldStatus} إلى AT_BRANCH وإلغاء المندوب.`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
      });

      return NextResponse.json({
        type: "ORDER",
        order: updatedOrder,
        assigned: true,
        message: `تم توجيه الشحنة #${matchedOrder.id.slice(-6).toUpperCase()} للفرع ${branch.name} بنجاح!`
      });
    }

    // If no driverId is provided, just return the order as scanned / selected
    return NextResponse.json({
      type: "ORDER",
      order: matchedOrder,
      assigned: false,
      message: `تم التعرف على الشحنة #${matchedOrder.id.slice(-6).toUpperCase()}`
    });

  } catch (error: any) {
    console.error("Assign Barcode Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
