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
    const range = searchParams.get("range") || "all";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();
    if (range === "today") {
      const start = new Date(now); start.setHours(0,0,0,0);
      const end = new Date(now); end.setHours(23,59,59,999);
      dateFilter = { createdAt: { gte: start, lte: end } };
    } else if (range === "week") {
      const start = new Date(now); start.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { gte: start } };
    } else if (range === "month") {
      const start = new Date(now); start.setDate(now.getDate() - 30);
      dateFilter = { createdAt: { gte: start } };
    } else if (range === "custom" && from && to) {
      dateFilter = { createdAt: { gte: new Date(from), lte: new Date(to + "T23:59:59") } };
    }

    const where: Record<string, any> = {
      ...dateFilter
    };

    if (status && status !== "ALL" && status !== "all" && status !== "الكل") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { phone: { contains: search } },
        { id: { contains: search } },
      ];
    }
    // V2 §1.2: الطلبات في عهدة اللوجستيات (PENDING_PICKUP, AT_BRANCH, SHIPPED) تختفي تماماً من شاشة الإدارة العامة للطلبات.
    if (!logistics && !status) {
      where.NOT = {
        status: {
          in: ["AWAITING_PICKUP", "PENDING_PICKUP", "AT_BRANCH", "SHIPPED"]
        }
      };
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      // Cap the result set: loading every order (with product images) at once can
      // exceed Hostinger's request timeout and return a 408 on the admin dashboard.
      take: 500,
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
            vendor: { select: { storeName: true, address: true, phone: true } },
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
      // مراجعة الدفع بالتحويل البنكي
      paymentVerified, paymentNote,
      // V2 §2.1/§2.2: استلام الرجيع من المندوب وتحويل العهدة للفرع + عدّاد المحاولات
      receiveReturn, failureReason,
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
    // مراجعة الدفع بالتحويل البنكي - قبول/رفض الإيصال
    if (paymentVerified !== undefined) updateData.paymentVerified = !!paymentVerified;
    if (paymentNote !== undefined) updateData.paymentNote = paymentNote || null;
    // تعديل العنوان المرن - الباب الأول المتطلب 5
    if (street !== undefined) updateData.street = street;
    if (district !== undefined) updateData.district = district;
    if (city !== undefined) updateData.city = city;

    // V2 §4: تسجيل بصمة تتبع تلقائية عند التعديل اللوجستي
    const stamp = new Date().toLocaleString("ar-EG", { timeZone: "Asia/Khartoum" });
    let trackingNote = "";

    // If driver is being assigned, fetch driver name
    let driverName = "";
    if (driverId && driverId !== existingOrder.driverId) {
      const drv = await db.deliveryDriver.findUnique({ where: { id: driverId } });
      if (drv) driverName = drv.name;
    }

    // If branch is being assigned, fetch branch name
    let branchName = "";
    const currentBranchId = branchId !== undefined ? branchId : existingOrder.branchId;
    if (currentBranchId) {
      const br = await db.branch.findUnique({ where: { id: currentBranchId } });
      if (br) branchName = br.name;
    }

    const adminName = (session?.user as any)?.name || "موظف الإدارة";

    // 1. Branch assignment
    if (branchId && branchId !== existingOrder.branchId) {
      trackingNote += `\n[استلام في الفرع - ${stamp}]: تم استلام الشحنة في الفرع (${branchName || branchId}) بواسطة الموظف (${adminName}).`;
    }

    // 2. Driver assignment
    if (driverId && driverId !== existingOrder.driverId) {
      trackingNote += `\n[تعيين السائق - ${stamp}]: تم تعيين المندوب (${driverName || driverId}) لتسليم الشحنة.`;
    }

    // 3. Status changes
    const newStatus = status || existingOrder.status;
    if (newStatus !== existingOrder.status) {
      if (newStatus === "AT_BRANCH") {
        trackingNote += `\n[استلام في الفرع - ${stamp}]: تم استلام الشحنة وتفريغها في الفرع (${branchName || "المستودع"}).`;
      } else if (newStatus === "SHIPPED") {
        const targetDriverId = driverId !== undefined ? driverId : existingOrder.driverId;
        let targetDriverName = driverName;
        if (!targetDriverName && targetDriverId) {
          const drv = await db.deliveryDriver.findUnique({ where: { id: targetDriverId } });
          if (drv) targetDriverName = drv.name;
        }
        trackingNote += `\n[الاستلام من السائق - ${stamp}]: بدء محاولة خروج الشحنة للتوصيل مع المندوب (${targetDriverName || "المندوب المعين"}).`;
      } else if (newStatus === "DELIVERED") {
        trackingNote += `\n[تسليم الشحنة - ${stamp}]: تم تسليم الشحنة بنجاح وإغلاق الدورة والتحصيل المالي.`;
      }
    }

    if (trackingNote) {
      updateData.notes = (updateData.notes ?? existingOrder.notes ?? "") + trackingNote;
    }

    // V2 §2.1/§2.2: آلية استلام الرجيع اللوجستية + أتمتة عدّاد محاولات التوصيل
    // عند استلام الشحنة الراجعة من المندوب: يجب تحديد الفرع، تُحوَّل العهدة
    // (المالية والفيزيائية) من المندوب إلى الفرع، وتُحتسب محاولة توصيل جديدة تلقائياً.
    let returnAttempt = 0;
    if (receiveReturn) {
      const targetBranchId = branchId || existingOrder.branchId;
      if (!targetBranchId) {
        return NextResponse.json(
          { error: "يجب تحديد الفرع (المستودع المستهدف) لاستلام الرجيع" },
          { status: 400 }
        );
      }
      returnAttempt = (existingOrder.attemptCounter || 0) + 1;
      updateData.status = "AT_BRANCH"; // راجعة للمستودع / في الفرع
      updateData.branchId = targetBranchId;
      updateData.driverId = null; // تحويل العهدة من المندوب إلى الفرع
      updateData.attemptCounter = returnAttempt;
      if (failureReason) updateData.failureReason = failureReason;
      const stamp = new Date().toLocaleString("ar-EG");
      const note = `\n[استلام رجيع - ${stamp}]: تم استلام الشحنة من المندوب وتحويل العهدة إلى الفرع — محاولة التوصيل رقم ${returnAttempt}.${failureReason ? " السبب: " + failureReason : ""}`;
      updateData.notes = (updateData.notes ?? existingOrder.notes ?? "") + note;
    }

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
    if (receiveReturn) {
      logs.push(`استلام رجيع من المندوب وتحويل العهدة للفرع — محاولة #${returnAttempt}`);
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

    // Automatically create return record if status is RETURNED (المرتجع تلقائي)
    if (updated.status === "RETURNED") {
      try {
        const existingReturn = await db.return.findFirst({
          where: { orderId: updated.id }
        });
        if (!existingReturn) {
          const firstItem = updated.items?.[0];
          const vendorId = firstItem?.vendorId || null;
          await db.return.create({
            data: {
              orderId: updated.id,
              customerId: updated.customerId,
              vendorId,
              reason: "تغيير حالة الطلب إلى مرتجع تلقائياً",
              status: "REQUESTED",
              items: {
                create: (updated.items || []).map((item: any) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                }))
              }
            }
          });
        }
      } catch (err) {
        console.error("Failed to auto-create Return record:", err);
      }
    }

    // إشعار العميل عند قبول/رفض إيصال التحويل البنكي
    if (paymentVerified !== undefined && existingOrder.customerId) {
      try {
        const { createNotification } = await import("@/lib/notification");
        const shortId = id.slice(-6).toUpperCase();
        if (paymentVerified) {
          await createNotification({
            userId: existingOrder.customerId,
            title: "✅ تم تأكيد دفع طلبك",
            message: `تم تأكيد التحويل البنكي لطلبك #${shortId} وجاري تجهيزه.`,
            type: "payment",
            link: "/orders",
          });
        } else {
          await createNotification({
            userId: existingOrder.customerId,
            title: "❌ لم يتم تأكيد التحويل",
            message: paymentNote
              ? `طلبك #${shortId}: ${paymentNote}`
              : `لم نتمكن من تأكيد التحويل البنكي لطلبك #${shortId}. يرجى التواصل أو إعادة رفع إيصال صحيح.`,
            type: "payment",
            link: "/orders",
          });
        }
      } catch (e) {
        console.error("payment notification failed:", e);
      }
    }

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
