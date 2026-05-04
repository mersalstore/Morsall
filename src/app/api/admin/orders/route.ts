import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

const db = prisma as any;

// GET — جلب كل الطلبات مع فلترة الحالة
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, any> = {};
    if (status && status !== "ALL") where.status = status;
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { id: { contains: search } },
      ];
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        driver: { select: { name: true, phone: true, vehicleType: true } },
        items: {
          include: {
            product: { select: { title: true, images: true } },
            vendor: { select: { storeName: true } },
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("GET Admin Orders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — تغيير حالة طلب
export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  try {
    const body = await req.json();
    const { id, status, trackingNumber, driverId, trackingUrl, estimatedDays, shippingCost } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id و status مطلوبان" }, { status: 400 });
    }

    const existingOrder = await db.order.findUnique({ where: { id } });
    if (existingOrder?.status === "DELIVERED") {
      return NextResponse.json({ error: "لا يمكن تعديل حالة الطلب بعد التسليم النهائي" }, { status: 400 });
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (driverId) updateData.driverId = driverId;
    if (trackingUrl) updateData.trackingUrl = trackingUrl;
    if (estimatedDays) updateData.estimatedDays = parseInt(estimatedDays);
    if (shippingCost !== undefined) updateData.shippingCost = parseFloat(shippingCost);

    const updated = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { title: true, images: true } },
          },
        },
      },
    });

    // لو الطلب اتأكد → نحاول نبعت لشركة الشحن تلقائياً
    if (status === "APPROVED") {
      try {
        const provider = await db.shippingProvider.findFirst({ where: { isActive: true } });
        if (provider) {
          await fetch(provider.baseUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${provider.apiKey}`,
            },
            body: JSON.stringify({
              orderId: updated.id,
              customerName: updated.customerName || (updated.customer as any)?.name,
              customerPhone: updated.phone,
              customerEmail: updated.customerEmail || (updated.customer as any)?.email,
              city: updated.city,
              district: updated.district,
              street: updated.street,
              items: (updated.items || []).map((i: any) => ({
                name: i.product?.title || "منتج",
                qty: i.quantity,
                price: i.priceAtTime,
              })),
              totalAmount: updated.totalAmount,
              paymentMethod: updated.paymentMethod,
            }),
          }).then(async (r) => {
            if (r.ok) {
              const data = await r.json();
              if (data.trackingNumber) {
                await db.order.update({
                  where: { id },
                  data: { trackingNumber: data.trackingNumber },
                });
              }
            }
          }).catch(() => {});
        }
      } catch (err) {
        console.error("Shipping Provider Error:", err);
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH Admin Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

