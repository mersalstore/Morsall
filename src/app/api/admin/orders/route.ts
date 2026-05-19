import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";
import { saveAuditLog } from "@/lib/audit";

const db = prisma as any;

// GET — جلب كل الطلبات مع فلترة الحالة
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    // وضع اللوجستيات: يجلب طلبات AWAITING_PICKUP أيضاً
    const logistics = searchParams.get("logistics");

    const where: Record<string, any> = {};
    if (status && status !== "ALL") where.status = status;
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { phone: { contains: search } },
        { id: { contains: search } },
      ];
    }
    // الباب الأول: الطلبات العادية لا تُظهر AWAITING_PICKUP (مقفول للوجستيات)
    if (!logistics && !status) {
      where.NOT = { status: "AWAITING_PICKUP" };
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        driver: { select: { name: true, phone: true, vehicleType: true } },
        items: {
          include: {
            product: {
              select: {
                title: true,
                images: true,
                weight: true,
                height: true,
                length: true,
                width: true,
              },
            },
            vendor: { select: { storeName: true } },
            // جلب السمات المحددة للمتغير (الباب الخامس - المتطلب 2)
            variation: { select: { combination: true, sku: true, price: true } },
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

// PATCH — تغيير حالة طلب مع دعم تعديل العنوان المرن
export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  try {
    const body = await req.json();
    const {
      id, status, trackingNumber, driverId, branchId, trackingUrl,
      estimatedDays, shippingCost, notes,
      // الباب الأول - المتطلب 5: تعديل العنوان المرن أثناء الشحن
      street, district, city,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
    }

    const existingOrder = await db.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    if (existingOrder.status === "DELIVERED") {
      return NextResponse.json({ error: "لا يمكن تعديل حالة الطلب بعد التسليم النهائي" }, { status: 400 });
    }

    const updateData: any = {
      status: status || existingOrder.status,
      updatedAt: new Date(),
    };

    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (driverId !== undefined) updateData.driverId = driverId || null;
    if (branchId !== undefined) {
      updateData.branchId = branchId || null;
      if (branchId) {
        updateData.driverId = null;
      }
    }
    if (trackingUrl) updateData.trackingUrl = trackingUrl;
    if (estimatedDays) updateData.estimatedDays = parseInt(estimatedDays);
    if (shippingCost !== undefined) updateData.shippingCost = parseFloat(shippingCost);
    if (notes !== undefined) updateData.notes = notes;
    // تعديل العنوان المرن - الباب الأول المتطلب 5
    if (street !== undefined) updateData.street = street;
    if (district !== undefined) updateData.district = district;
    if (city !== undefined) updateData.city = city;

    // Check if the address was modified and we have a trackingNumber (AWB)
    const isAddressModified = street !== undefined || district !== undefined || city !== undefined;
    if (isAddressModified && existingOrder.trackingNumber) {
      try {
        const provider = await db.shippingProvider.findFirst({ where: { isActive: true } });
        if (provider) {
          await fetch(`${provider.baseUrl}/cancel`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${provider.apiKey}`,
            },
            body: JSON.stringify({
              orderId: id,
              trackingNumber: existingOrder.trackingNumber,
              reason: "تعديل عنوان العميل وإعادة توجيه الطلب للفرع"
            }),
          }).catch(() => {});
          
          updateData.trackingNumber = null;
          updateData.trackingUrl = null;
        }
      } catch (err) {
        console.error("Failed to cancel AWB with courier:", err);
      }
    }

    // Save Audit trail and history notes
    const logs: string[] = [];
    if (status && status !== existingOrder.status) {
      logs.push(`تغيير الحالة إلى ${status}`);
    }
    if (street !== undefined && street !== existingOrder.street) {
      logs.push(`تعديل الشارع إلى: ${street}`);
    }
    if (district !== undefined && district !== existingOrder.district) {
      logs.push(`تعديل الحي إلى: ${district}`);
    }
    if (city !== undefined && city !== existingOrder.city) {
      logs.push(`تعديل المدينة إلى: ${city}`);
    }
    if (driverId !== undefined && driverId !== existingOrder.driverId) {
      logs.push(`تعديل المندوب: ${driverId || "إلغاء التعيين"}`);
    }
    if (branchId !== undefined && branchId !== existingOrder.branchId) {
      logs.push(`تعديل الفرع: ${branchId || "إلغاء التوجيه"}`);
    }

    if (logs.length > 0) {
      await saveAuditLog({
        userId: (session.user as any).id,
        action: "ORDER_UPDATE",
        entityId: id,
        details: `تحديث الشحنة #${id.slice(-6).toUpperCase()}: ` + logs.join(" | "),
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
      });

      if (isAddressModified) {
        const historyNote = `\n[تحديث لوجستي - ${new Date().toLocaleString("ar-EG")}]: تم تعديل العنوان وإعادة توجيه الشحنة إلى الفرع لإعادة التوزيع.`;
        updateData.notes = (existingOrder.notes || "") + historyNote;
      }
    }

    const updated = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { title: true, images: true } },
            variation: { select: { combination: true, sku: true } },
          },
        },
      },
    });

    // الباب الثاني - المتطلب 3: إرسال تلقائي لشركة الشحن عند READY_FOR_SHIPPING
    if (status === "READY_FOR_SHIPPING") {
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
