import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { saveAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminId = (session.user as any).id;

  try {
    const { supplierId, orders } = await req.json();

    if (!supplierId || !orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // Look up vendor to verify it exists and get name
    const vendor = await prisma.vendor.findUnique({
      where: { id: supplierId },
      select: { id: true, storeName: true }
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // For linking order items, find a product owned by this vendor, or create a default one
    let product = await prisma.product.findFirst({
      where: { vendorId: supplierId },
      select: { id: true }
    });

    if (!product) {
      // Create a fallback product for this vendor to represent external import
      product = await prisma.product.create({
        data: {
          title: "شحنة خارجية مستوردة",
          description: "تم إنشاؤه تلقائياً لدعم نظام الاستيراد اللوجستي",
          price: 0,
          stock: 9999,
          vendorId: supplierId,
          status: "APPROVED"
        },
        select: { id: true }
      });
    }

    // Create the orders in a transaction
    const createdOrders = await prisma.$transaction(
      orders.map((o: any) => {
        const qty = parseInt(o.quantity) || 1;
        const prc = parseFloat(o.price) || 0;
        const total = prc * qty;
        const notesStr = [o.notes, o.barcode ? `باركود: ${o.barcode}` : ""].filter(Boolean).join(" | ") || null;

        return prisma.order.create({
          data: {
            customerId: adminId,
            customerName: o.customerName,
            phone: String(o.phone || "").trim(),
            city: String(o.city || "").trim(),
            district: String(o.district || o.city || "").trim(),
            street: String(o.street || "—").trim(),
            notes: notesStr,
            paymentMethod: "COD",
            totalAmount: total,
            shippingCost: parseFloat(o.shippingPrice) || 0,
            status: "PENDING",
            source: "EXTERNAL_IMPORT",
            ...(o.driverId ? { driverId: o.driverId } : {}),
            items: {
              create: {
                productId: product!.id,
                vendorId: supplierId,
                quantity: qty,
                priceAtTime: prc
              }
            }
          }
        });
      })
    );

    // Save Audit trail
    await saveAuditLog({
      userId: adminId,
      action: "ORDERS_IMPORT",
      entityId: supplierId,
      details: `استيراد جماعي لعدد ${createdOrders.length} شحنة للمورد: ${vendor.storeName}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1"
    });

    return NextResponse.json({ success: true, count: createdOrders.length });
  } catch (error: any) {
    console.error("Batch import error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
