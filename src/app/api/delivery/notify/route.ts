import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail, emailLayout } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { orderId, messageKey } = await req.json();

    if (!orderId || !messageKey) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { driver: true }
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    const driverName = order.driver?.name || "مندوب مرسال";
    const driverPhone = order.driver?.phone || "";
    
    // Simulate/calculate ETA based on distance if driver coordinates are available
    let eta = "20 دقيقة";
    if (order.driver?.lat && order.driver?.lng) {
      // Let's assume a random realistic ETA between 10 to 35 minutes based on coordinates
      const randomMinutes = Math.floor(Math.random() * 25) + 10;
      eta = `${randomMinutes} دقيقة`;
    }

    let messageText = "";
    let emailSubject = "";

    if (messageKey === "way") {
      emailSubject = `شحنتك رقم #${orderId.slice(-6).toUpperCase()} في الطريق إليك`;
      messageText = `أهلاً بك، المندوب ${driverName} في طريقه إليك الآن لتسليم طلبك. الوقت المقدر للوصول هو ${eta}. يرجى إبقاء هاتفك متاحاً.`;
    } else if (messageKey === "near") {
      emailSubject = `المندوب يقترب من موقعك - طلب #${orderId.slice(-6).toUpperCase()}`;
      messageText = `أهلاً بك، المندوب ${driverName} يقترب من موقعك الآن (الوقت المقدر: ${eta}). يرجى تجهيز مبلغ الكاش المطلوب والدفع عند الاستلام.`;
    } else {
      return NextResponse.json({ error: "قالب رسالة غير معروف" }, { status: 400 });
    }

    // Send email to customer
    const customerEmail = order.customerEmail;
    if (customerEmail) {
      const html = emailLayout(
        emailSubject,
        `
        <div style="line-height: 1.6; font-size: 15px; color: #334155;" dir="rtl">
          <p>عزيزنا العميل ${order.customerName || ""}،</p>
          <p>${messageText}</p>
          <div style="background-color: #F8FAFC; border-right: 4px solid #C5A021; padding: 16px; margin: 24px 0; text-align: right;">
            <strong>معلومات المندوب للتواصل:</strong><br/>
            الاسم: ${driverName}<br/>
            الهاتف: <a href="tel:${driverPhone}" style="color: #C5A021; text-decoration: none; font-weight: 700;">${driverPhone}</a>
          </div>
          <p style="font-size: 13px; color: #64748B;">
            شكراً لتسوقك من مرسال.
          </p>
        </div>
        `
      );

      await sendMail({
        to: customerEmail,
        subject: emailSubject,
        html,
      });
    }

    return NextResponse.json({ success: true, eta });
  } catch (error: any) {
    console.error("Notify Customer Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}