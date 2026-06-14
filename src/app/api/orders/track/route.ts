import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "رقم الطلب مطلوب" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: id },
          { trackingNumber: id }
        ]
      },
      include: {
        driver: {
          select: {
            name: true,
            phone: true,
            vehicleType: true,
            lat: true,
            lng: true,
            isOnline: true
          }
        },
        items: {
          include: {
            product: { select: { title: true, images: true } }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "لم يتم العثور على هذا الطلب" }, { status: 404 });
    }

    const history: any[] = [];
    if (order.createdAt) {
      history.push({ time: new Date(order.createdAt).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }), event: "تم استلام الطلب وتجهيزه" });
    }
    if (order.assignedAt) {
      history.push({ time: new Date(order.assignedAt).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }), event: "تم تعيين المندوب لتوصيل الشحنة" });
    }
    if (order.pickedUpAt) {
      history.push({ time: new Date(order.pickedUpAt).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }), event: "خرجت الشحنة مع المندوب" });
    }
    if (order.deliveredAt) {
      history.push({ time: new Date(order.deliveredAt).toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }), event: "تم تسليم الشحنة للعميل بنجاح" });
    }

    history.reverse();

    let statusLabel = "تحت المراجعة";
    if (order.status === "APPROVED") statusLabel = "تمت الموافقة";
    if (order.status === "PACKING") statusLabel = "جاري التجهيز";
    if (order.status === "SHIPPED") statusLabel = "خارج للتوصيل";
    if (order.status === "DELIVERED") statusLabel = "تم التسليم";
    if (order.status === "CANCELLED") statusLabel = "ملغي";
    if (order.status === "FAILED") statusLabel = "فشلت محاولة التوصيل";
    if (order.status === "RETURNED") statusLabel = "مرتجع";

    return NextResponse.json({
      id: order.id,
      status: order.status,
      statusLabel,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      phone: order.phone,
      city: order.city,
      district: order.district,
      street: order.street,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      shippingCost: order.shippingCost,
      discountAmount: order.discountAmount,
      trackingLat: order.trackingLat,
      trackingLng: order.trackingLng,
      driver: order.driver,
      history,
      estimatedArrival: order.status === "DELIVERED" ? "تم التوصيل" : "اليوم قبل الساعة 6 مساءً"
    });
  } catch (error: any) {
    console.error("Order tracking api error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}