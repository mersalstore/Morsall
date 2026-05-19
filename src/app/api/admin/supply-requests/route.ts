import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";
import { saveAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const requests = await prisma.supplyRequest.findMany({
      include: {
        vendor: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("Fetch Supply Requests Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { vendorId, items } = await req.json();

    if (!vendorId || !items || !items.length) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    const totalItems = items.reduce((acc: number, item: any) => acc + Number(item.expectedQty), 0);

    const supplyRequest = await prisma.supplyRequest.create({
      data: {
        vendorId,
        totalItems,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            expectedQty: Number(item.expectedQty)
          }))
        }
      },
      include: {
        vendor: true,
        items: { include: { product: true } }
      }
    });

    // Log supply request creation
    await saveAuditLog({
      userId: (session.user as any).id,
      action: "SUPPLY_REQUEST_CREATE",
      entityId: supplyRequest.id,
      details: `تم إنشاء طلب توريد جديد #${supplyRequest.id.slice(-6).toUpperCase()} للمورد ${supplyRequest.vendor.storeName} بإجمالي ${totalItems} قطعة.`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
    });

    return NextResponse.json(supplyRequest);
  } catch (error: any) {
    console.error("Create Supply Request Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { id, status, items } = await req.json();

    const updated = await prisma.$transaction(async (tx) => {
      if (items && items.length) {
        for (const item of items) {
          await tx.supplyRequestItem.update({
            where: { id: item.id },
            data: {
              receivedQty: Number(item.receivedQty),
              damagedQty: Number(item.damagedQty)
            }
          });
        }
      }

      const reqUpdate = await tx.supplyRequest.update({
        where: { id },
        data: { status },
        include: {
          vendor: true,
          items: { include: { product: true } }
        }
      });

      if (status === "RECEIVED" && items && items.length) {
        for (const item of items) {
          if (Number(item.receivedQty) > 0) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: Number(item.receivedQty) } }
            });
          }
        }
      }

      return reqUpdate;
    });

    // Log supply request receipt
    const totalReceived = items?.reduce((acc: number, it: any) => acc + Number(it.receivedQty || 0), 0) || 0;
    const totalDamaged = items?.reduce((acc: number, it: any) => acc + Number(it.damagedQty || 0), 0) || 0;

    await saveAuditLog({
      userId: (session.user as any).id,
      action: "SUPPLY_REQUEST_RECEIVE",
      entityId: id,
      details: `استلام شحنة التوريد #${id.slice(-6).toUpperCase()}: تم إدخال ${totalReceived} قطعة سليمة للمخزون، و ${totalDamaged} قطعة تالفة. الحالة المحدثة: ${status}.`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update Supply Request Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

