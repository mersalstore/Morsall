import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { saveAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { updates } = await req.json();
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid updates format" }, { status: 400 });
    }

    const results = await Promise.all(
      updates.map(async (u) => {
        try {
          // Fetch existing order to log changes
          const existingOrder = await prisma.order.findUnique({
            where: { id: u.id },
            include: { driver: true }
          });

          if (!existingOrder) return null;

          const updated = await prisma.order.update({
            where: { id: u.id },
            data: {
              ...(u.status && { status: u.status }),
              ...(u.trackingNumber && { trackingNumber: u.trackingNumber }),
              ...(u.driverId !== undefined && { driverId: u.driverId }),
              ...(u.branchId !== undefined && { branchId: u.branchId }),
              ...(u.codCollected !== undefined && { codCollected: u.codCollected }),
              ...(u.city && { city: u.city }),
              ...(u.district && { district: u.district }),
              ...(u.street && { street: u.street }),
            },
            include: { driver: true }
          });

          // Log detailed Audit Trail entry
          const logs: string[] = [];
          if (u.status && u.status !== existingOrder.status) {
            logs.push(`تغيير الحالة من ${existingOrder.status} إلى ${u.status}`);
          }
          if (u.driverId !== undefined && u.driverId !== existingOrder.driverId) {
            logs.push(`تعيين المندوب: ${updated.driver?.name || "إلغاء التعيين"}`);
          }
          if (u.branchId !== undefined && u.branchId !== existingOrder.branchId) {
            logs.push(`توجيه للفرع: ${u.branchId || "إلغاء التوجيه"}`);
          }
          if (u.codCollected !== undefined && u.codCollected !== existingOrder.codCollected) {
            logs.push(`تسوية الكاش: ${u.codCollected ? "تم التحصيل" : "معلق"}`);
          }
          if (u.city && u.city !== existingOrder.city) {
            logs.push(`تعديل المدينة إلى: ${u.city}`);
          }

          if (logs.length > 0) {
            await saveAuditLog({
              userId: (session.user as any).id,
              action: "ORDER_BULK_UPDATE",
              entityId: u.id,
              details: `تحديث الشحنة #${u.id.slice(-6).toUpperCase()}: ` + logs.join(" | "),
              ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
            });
          }

          return updated;
        } catch (err) {
          console.error(`Failed to update order ${u.id}:`, err);
          return null;
        }
      })
    );

    const successfulCount = results.filter(r => r !== null).length;

    return NextResponse.json({ success: true, updated: successfulCount });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

