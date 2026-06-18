import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SUDAN_CITIES_COORDS: Record<string, { lat: number; lng: number }> = {
  "الخرطوم": { lat: 15.5007, lng: 32.5599 },
  "أم درمان": { lat: 15.6500, lng: 32.4833 },
  "بحري": { lat: 15.6333, lng: 32.5333 },
  "بورتسودان": { lat: 19.6175, lng: 37.2158 },
  "ود مدني": { lat: 14.4012, lng: 33.5186 },
  "دنقلا": { lat: 19.1667, lng: 30.4667 },
  "عطبرة": { lat: 17.6947, lng: 33.9872 },
  "كسلا": { lat: 15.4507, lng: 36.4000 },
  "القضارف": { lat: 14.0349, lng: 35.3834 },
  "الأبيض": { lat: 13.1849, lng: 30.2014 },
  "كوستي": { lat: 13.1629, lng: 32.6635 },
  "سنار": { lat: 13.5691, lng: 33.5672 },
  "شندي": { lat: 16.6961, lng: 33.4294 },
  "حلفا": { lat: 21.7925, lng: 31.3325 },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

async function getCustomerCoords(city: string, district: string) {
  const cleanCity = city ? city.trim() : "";
  const cleanDistrict = district ? district.trim() : "";
  
  let lat = 15.5007; // Khartoum default
  let lng = 32.5599;
  
  for (const [name, coords] of Object.entries(SUDAN_CITIES_COORDS)) {
    if (cleanCity.includes(name) || name.includes(cleanCity)) {
      lat = coords.lat;
      lng = coords.lng;
      break;
    }
  }

  try {
    const query = `Sudan, ${cleanDistrict || cleanCity}`;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: { "User-Agent": "MersalStoreApp/1.0" },
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]) {
        lat = parseFloat(data[0].lat);
        lng = parseFloat(data[0].lon);
      }
    }
  } catch (err) {
    console.error("Nominatim geocoding failed, using fallback:", err);
  }

  return { lat, lng };
}

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

    let estimatedArrival = order.status === "DELIVERED" ? "تم التوصيل" : "اليوم قبل الساعة 6 مساءً";
    let distanceRemaining = null;

    if (order.status !== "DELIVERED" && order.driver?.lat && order.driver?.lng) {
      const customerCoords = await getCustomerCoords(order.city, order.district);
      const distance = calculateDistance(order.driver.lat, order.driver.lng, customerCoords.lat, customerCoords.lng);
      distanceRemaining = `${distance.toFixed(1)} كم`;
      const etaMinutes = Math.max(5, Math.round((distance / 30) * 60) + 5);
      estimatedArrival = `خلال ${etaMinutes} دقيقة تقريباً`;
    }

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
      trackingLat: order.driver?.lat || order.trackingLat,
      trackingLng: order.driver?.lng || order.trackingLng,
      driver: order.driver,
      distanceRemaining,
      estimatedArrival,
      history
    });
  } catch (error: any) {
    console.error("Order tracking api error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}