import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveAuditLog } from "@/lib/audit";

// GET — list all returns (المرتجعات)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 });
    }
    const user = session.user as any;
    const userId = user.id;
    const role = user.role;
    const userEmail = user.email?.trim().toLowerCase();
    const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];

    const isAdmin = (userEmail && SUPER_ADMINS.includes(userEmail)) || ["ADMIN", "PACKING", "SHIPPING", "CUSTOMER_SERVICE", "INVENTORY", "DRIVER"].includes(role);
    const isVendor = role === "VENDOR";

    if (!isAdmin && !isVendor) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    let whereClause = {};
    if (isVendor) {
      const vendor = await prisma.vendor.findUnique({
        where: { userId },
      });
      if (!vendor) {
        return NextResponse.json({ error: "لم يتم العثور على ملف التاجر" }, { status: 404 });
      }
      whereClause = { vendorId: vendor.id };
    }

    const returns = await prisma.return.findMany({
      where: whereClause,
      include: {
        order: {
          select: { id: true, customerName: true, phone: true, city: true, totalAmount: true, status: true },
        },
        items: {
          include: { product: { select: { id: true, title: true, images: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(returns);
  } catch (error: any) {
    console.error("Fetch Returns Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — create a return for an order
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 });
    }
    const user = session.user as any;
    const userId = user.id;
    const role = user.role;
    const userEmail = user.email?.trim().toLowerCase();
    const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];

    const isAdmin = (userEmail && SUPER_ADMINS.includes(userEmail)) || ["ADMIN", "PACKING", "SHIPPING", "CUSTOMER_SERVICE", "INVENTORY", "DRIVER"].includes(role);
    const isVendor = role === "VENDOR";

    if (!isAdmin && !isVendor) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { orderId, reason, items, refundAmount, restock } = await req.json();
    if (!orderId || !reason) {
      return NextResponse.json({ error: "رقم الطلب وسبب الإرجاع مطلوبان" }, { status: 400 });
    }

    const raw = String(orderId).trim();
    const lc = raw.toLowerCase().replace("#", "");
    let order = await prisma.order.findUnique({ where: { id: raw }, include: { items: true } });
    if (!order) {
      order = await prisma.order.findFirst({ where: { id: { endsWith: lc } }, include: { items: true } });
    }
    if (!order) {
      return NextResponse.json({ error: "لم يتم العثور على طلب بهذا الرقم" }, { status: 404 });
    }

    // Check ownership if vendor
    let vendorId = order.items[0]?.vendorId || null;
    if (isVendor) {
      const vendor = await prisma.vendor.findUnique({
        where: { userId },
      });
      if (!vendor) {
        return NextResponse.json({ error: "لم يتم العثور على ملف التاجر" }, { status: 404 });
      }
      if (vendorId !== vendor.id) {
        return NextResponse.json({ error: "غير مصرح لك بإنشاء مرتجع لهذا الطلب" }, { status: 403 });
      }
    }

    // Default to all of the order's items when none are specified.
    const returnItems = items && items.length
      ? items
      : order.items.map((it) => ({ productId: it.productId, quantity: it.quantity }));

    const created = await prisma.return.create({
      data: {
        orderId: order.id,
        vendorId,
        customerId: order.customerId,
        reason,
        refundAmount: refundAmount ? Number(refundAmount) : 0,
        restock: restock !== false,
        status: "REQUESTED",
        items: {
          create: returnItems.map((it: any) => ({
            productId: it.productId,
            quantity: Number(it.quantity) || 1,
          })),
        },
      },
      include: { items: { include: { product: true } }, order: true },
    });

    await saveAuditLog({
      userId,
      action: "RETURN_CREATE",
      entityId: created.id,
      details: `تم إنشاء مرتجع #${created.id.slice(-6).toUpperCase()} للطلب #${order.id.slice(-8).toUpperCase()}. السبب: ${reason}.`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json(created);
  } catch (error: any) {
    console.error("Create Return Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — advance a return through its lifecycle
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 });
    }
    const user = session.user as any;
    const userId = user.id;
    const role = user.role;
    const userEmail = user.email?.trim().toLowerCase();
    const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];

    const isAdmin = (userEmail && SUPER_ADMINS.includes(userEmail)) || ["ADMIN", "PACKING", "SHIPPING", "CUSTOMER_SERVICE", "INVENTORY", "DRIVER"].includes(role);
    const isVendor = role === "VENDOR";

    if (!isAdmin && !isVendor) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { id, status, adminNote, refundAmount } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    const existing = await prisma.return.findUnique({ where: { id }, include: { items: true } });
    if (!existing) {
      return NextResponse.json({ error: "المرتجع غير موجود" }, { status: 404 });
    }

    // Check ownership if vendor
    if (isVendor) {
      const vendor = await prisma.vendor.findUnique({
        where: { userId },
      });
      if (!vendor) {
        return NextResponse.json({ error: "لم يتم العثور على ملف التاجر" }, { status: 404 });
      }
      if (existing.vendorId !== vendor.id) {
        return NextResponse.json({ error: "غير مصرح لك بتعديل هذا المرتجع" }, { status: 403 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const data: any = { status };
      if (adminNote !== undefined) data.adminNote = adminNote;
      if (refundAmount !== undefined) data.refundAmount = Number(refundAmount);
      if (["RECEIVED", "REFUNDED", "REJECTED"].includes(status)) data.resolvedAt = new Date();

      const ret = await tx.return.update({
        where: { id },
        data,
        include: { items: { include: { product: true } }, order: true },
      });

      // Restock when the goods are physically received back (once).
      if (status === "RECEIVED" && existing.restock && existing.status !== "RECEIVED") {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return ret;
    });

    await saveAuditLog({
      userId,
      action: "RETURN_UPDATE",
      entityId: id,
      details: `تحديث المرتجع #${String(id).slice(-6).toUpperCase()} إلى الحالة: ${status}.`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update Return Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
