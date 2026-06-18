
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { scanForAttacks, logSecurity, isIpBlocked, autoBlockIfAbusive, extractIp } from "@/lib/security-log";

// POST — إنشاء طلب جديد من صفحة الـ Checkout
export async function POST(req: Request) {
  try {
    const clientIp = extractIp(req);
    
    // 1. Check if IP is blocked
    if (await isIpBlocked(clientIp)) {
      await logSecurity({
        type: "UNAUTHORIZED_ACCESS",
        severity: "CRITICAL",
        ip: clientIp,
        endpoint: "/api/orders",
        method: "POST",
        message: "Blocked IP attempted checkout",
      });
      return NextResponse.json(
        { error: "تم تعطيل الوصول لهذا الـ IP بسبب نشاط مشبوه. للاستفسار تواصل مع الدعم." },
        { status: 403 }
      );
    }

    const session = await getServerSession(authOptions);
    const customerId = (session?.user as any)?.id as string | undefined;

    if (!customerId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً لإتمام الطلب" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // 2. Scan request payload for SQL injection / XSS
    const attack = scanForAttacks(body);
    if (attack) {
      await logSecurity({
        type: attack,
        severity: "CRITICAL",
        ip: clientIp,
        userId: customerId,
        endpoint: "/api/orders",
        method: "POST",
        message: `Threat payload detected: ${JSON.stringify(body).slice(0, 1000)}`,
        details: { body },
      });
      await autoBlockIfAbusive(clientIp, attack, 3, 24); // Block after 3 threat attempts
      return NextResponse.json(
        { error: "تم رفض الطلب لوجود محتوى غير صالح أو محاولة اختراق." },
        { status: 400 }
      );
    }

    // 3. Checkout Rate Limiting (max 10 orders per 10 minutes per user/IP)
    const since = new Date(Date.now() - 10 * 60 * 1000);
    const recentOrdersCount = await prisma.order.count({
      where: {
        customerId,
        createdAt: { gte: since },
      },
    });

    if (recentOrdersCount >= 10) {
      await logSecurity({
        type: "RATE_LIMIT",
        severity: "ALERT",
        ip: clientIp,
        userId: customerId,
        endpoint: "/api/orders",
        method: "POST",
        message: `Brute force order creation: ${recentOrdersCount} orders created in 10m`,
      });
      await autoBlockIfAbusive(clientIp, "RATE_LIMIT", 1, 12); // Auto-block IP for 12h
      return NextResponse.json(
        { error: "لقد تجاوزت الحد الأقصى لإنشاء الطلبات. يرجى المحاولة لاحقاً." },
        { status: 429 }
      );
    }

    const {
      name,
      phone,
      email,
      city,
      district,
      street,
      notes,
      paymentMethod = "COD",
      paymentScreenshot,
      items,
      subtotal,
      shippingCost,
      couponCode,
      discountAmount = 0,
      source = "STORE",
      status = "PENDING_APPROVAL",
      vendorId
    } = body;

    // ── Validation ────────────────────────────────────────
    if (!phone || !city || !street) {
      return NextResponse.json(
        { error: "الهاتف والمدينة والعنوان مطلوبة" },
        { status: 400 }
      );
    }
    if (source !== "EXTERNAL_IMPORT" && paymentMethod === "BANK_TRANSFER" && !paymentScreenshot) {
      return NextResponse.json(
        { error: "يرجى رفع صورة إيصال التحويل لإتمام الطلب" },
        { status: 400 }
      );
    }

    const isExternalImport = source === "EXTERNAL_IMPORT";
    let finalItems: any[] = [];
    
    // Fetch global exchangeRate
    const settings = await prisma.settings.findUnique({ where: { id: "global" } });
    const rate = settings?.exchangeRate || 1.0;

    let calculatedSubtotal = 0;
    let finalShippingCost = parseFloat(shippingCost) || 0;

    if (isExternalImport) {
      const totalAmount = parseFloat(body.totalAmount) || 0;
      let selectedProduct = await prisma.product.findFirst({
        where: vendorId ? { vendorId } : {},
        select: { id: true, vendorId: true }
      });

      if (!selectedProduct) {
        selectedProduct = await prisma.product.findFirst({ select: { id: true, vendorId: true } });
      }

      if (!selectedProduct) {
        let targetVendorId = vendorId;
        if (!targetVendorId) {
          const firstVendor = await prisma.vendor.findFirst({ select: { id: true } });
          targetVendorId = firstVendor?.id;
        }

        if (targetVendorId) {
          selectedProduct = await prisma.product.create({
            data: {
              title: "شحنة خارجية مستوردة",
              description: "تم إنشاؤه تلقائياً لدعم نظام الاستيراد اللوجستي",
              price: totalAmount,
              stock: 9999,
              vendorId: targetVendorId,
              status: "APPROVED"
            },
            select: { id: true, vendorId: true }
          });
        }
      }

      if (selectedProduct) {
        finalItems.push({
          productId: selectedProduct.id,
          vendorId: selectedProduct.vendorId,
          quantity: Math.max(1, parseInt(body.quantity) || 1),
          priceAtTime: totalAmount,
          size: null,
          color: null,
        });
      } else {
        return NextResponse.json(
          { error: "لا يمكن إتمام الاستيراد لعدم وجود أي مورد نشط في النظام" },
          { status: 422 }
        );
      }
    } else {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: "السلة فارغة — يجب إضافة منتج واحد على الأقل" },
          { status: 400 }
        );
      }

      // ── Validate & enrich items from DB using actual USD rates translated to local currency ──
      const productIds = items.map((i: any) => i.productId).filter(Boolean);
      const dbProducts = productIds.length > 0
        ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, vendorId: true, price: true, discountPrice: true, title: true, stock: true },
        })
        : [];

      const productMap = Object.fromEntries(dbProducts.map((p: any) => [p.id, p]));

      finalItems = items.map((item: any) => {
        const dbProduct = productMap[item.productId];
        if (!dbProduct) return null;
        
        // Secure price calculation server-side (use discountPrice if smaller than price)
        const basePrice = (dbProduct.discountPrice !== null && dbProduct.discountPrice !== undefined && dbProduct.discountPrice < dbProduct.price)
          ? dbProduct.discountPrice
          : dbProduct.price;

        const localPrice = basePrice * rate;
        calculatedSubtotal += localPrice * (parseInt(item.quantity) || 1);

        return {
          productId: dbProduct.id,
          vendorId: dbProduct.vendorId,
          quantity: Math.max(1, parseInt(item.quantity) || 1),
          priceAtTime: localPrice,
          size: item.size || null,
          color: item.color || null,
        };
      }).filter(Boolean) as any[];
    }

    if (finalItems.length === 0) {
      return NextResponse.json(
        { error: "حدث خطأ — لا يوجد منتجات صالحة في النظام لإتمام الطلب" },
        { status: 422 }
      );
    }

    // ── Server-side Coupon validation & recalculation ──
    let validatedDiscount = 0;
    if (couponCode && !isExternalImport) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() }
      });
      if (coupon && coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date())) {
        if (calculatedSubtotal >= (coupon.minOrderAmount || 0)) {
          let targets: string[] = [];
          if (coupon.targetIds) {
            try {
              const parsed = JSON.parse(coupon.targetIds);
              targets = Array.isArray(parsed) ? parsed : [coupon.targetIds];
            } catch {
              targets = coupon.targetIds.split(",").map(t => t.trim()).filter(Boolean);
            }
          }

          let matchingSubtotal = 0;
          const scope = coupon.scope || "ALL";

          for (const item of finalItems) {
            let isMatch = false;
            if (scope === "ALL") {
              isMatch = true;
            } else if (scope === "PRODUCTS") {
              isMatch = targets.includes(item.productId);
            } else if (scope === "VENDORS") {
              isMatch = targets.includes(item.vendorId) || !!(coupon.vendorId && coupon.vendorId === item.vendorId);
            }

            if (isMatch) {
              matchingSubtotal += item.priceAtTime * item.quantity;
            }
          }

          if (matchingSubtotal > 0) {
            if (coupon.discountType === "PERCENTAGE") {
              validatedDiscount = matchingSubtotal * (coupon.discountValue / 100);
              const maxDiscount = coupon.maxDiscount || 0;
              if (maxDiscount > 0 && validatedDiscount > maxDiscount) {
                validatedDiscount = maxDiscount;
              }
            } else {
              validatedDiscount = Math.min(coupon.discountValue, matchingSubtotal);
            }
          }
        }
      }
    }

    // Programmatic Free Shipping: If Total > 50,000 SDG -> Shipping = 0 (Module 6)
    if (!isExternalImport) {
      if (calculatedSubtotal > 50000) {
        finalShippingCost = 0;
      }
    }

    const codFee = (paymentMethod === "COD" && settings?.codExtraFee) ? settings.codExtraFee : 0;
    const finalSubtotal = isExternalImport ? (parseFloat(subtotal) || 0) : calculatedSubtotal;
    const totalAmount = isExternalImport ? (parseFloat(body.totalAmount) || 0) : Math.max(0, finalSubtotal + finalShippingCost + codFee - validatedDiscount);

    // ── Create the order ─────────────────────────────────
    const order = await (prisma.order as any).create({
      data: {
        customerId,
        customerName: name || (session?.user as any)?.name || "",
        customerEmail: email || (session?.user as any)?.email || "",
        phone: phone.trim(),
        city: city.trim(),
        district: (district || city).trim(),
        street: street.trim(),
        notes: notes || null,
        paymentMethod,
        paymentScreenshot: paymentScreenshot || null,
        totalAmount,
        shippingCost: finalShippingCost,
        couponCode: couponCode || null,
        discountAmount: validatedDiscount,
        status: isExternalImport ? status : "PENDING_APPROVAL",
        source,
        // Logistics fields carried over from an external (e.g. far-mile) import
        ...(isExternalImport ? {
          trackingNumber: body.trackingNumber || null,
          packageContent: body.packageContent || null,
          weight: body.weight !== undefined && body.weight !== null && body.weight !== ""
            ? (parseFloat(body.weight) || null)
            : null,
          otherFees: parseFloat(body.otherFees) || 0,
          additionalFees: parseFloat(body.additionalFees) || 0,
          consignmentNumber: body.consignmentNumber || null,
          providerConsignmentNumber: body.providerConsignmentNumber || null,
          customerReference: body.customerReference || null,
          pendingAttempts: parseInt(body.pendingAttempts) || 0,
          shipmentType: body.shipmentType || null,
        } : {}),
        items: {
          create: finalItems,
        },
      },
      include: {
        items: {
          include: {
            product: { select: { title: true } },
            vendor: { select: { storeName: true } },
          },
        },
      },
    });

    // ── Save address in platform database if not already saved (الباب الرابع - المتطلب الثامن) ──
    if (customerId && !isExternalImport) {
      try {
        const existingAddress = await (prisma as any).savedAddress.findFirst({
          where: { userId: customerId }
        });
        if (!existingAddress) {
          await (prisma as any).savedAddress.create({
            data: {
              userId: customerId,
              city: city.trim(),
              district: (district || city).trim(),
              street: street.trim(),
              isDefault: true,
              label: "المنزل"
            }
          });
        }
      } catch (addrErr) {
        console.error("Failed to automatically save address:", addrErr);
      }
    }

    // Notify admins and vendors about new order (skipped for bulk external imports to avoid spam)
    if (!isExternalImport) {
      try {
        const { notifyAdmins, notifyVendor } = await import("@/lib/notification");
        notifyAdmins(
          "📦 طلب جديد",
          `طلب جديد #${order.id.slice(-8)} بمبلغ ${totalAmount.toLocaleString()} ج.س`,
          "order",
          "/admin/dashboard"
        );
        for (const item of finalItems) {
          if (item.vendorId) {
            notifyVendor(
              item.vendorId,
              "📦 طلب جديد في متجرك",
              `لديك طلب جديد #${order.id.slice(-8)} بقيمة ${totalAmount.toLocaleString()} ج.س`,
              "order",
              "/vendor/dashboard"
            );
          }
        }
      } catch {}
    }

    // Send an order confirmation email from support@morsall.com (fire-and-forget)
    if (!isExternalImport) {
      const customerEmailAddr = order.customerEmail || (session?.user as any)?.email;
      if (customerEmailAddr) {
        import("@/lib/mail").then(({ sendMail, emailLayout }) =>
          sendMail({
            to: customerEmailAddr,
            subject: `تأكيد طلبك #${order.id.slice(-8).toUpperCase()} - مرسال`,
            html: emailLayout(
              "تم استلام طلبك بنجاح 🎉",
              `<p style="margin:0 0 12px;line-height:1.8">شكراً لطلبك من مرسال. رقم الطلب: <b>#${order.id.slice(-8).toUpperCase()}</b></p>
               <p style="margin:0 0 12px;line-height:1.8">الإجمالي: <b>${totalAmount.toLocaleString()} ج.س</b></p>
               <p style="margin:0;line-height:1.8">سنخطرك عند تجهيز الطلب وشحنه. يمكنك متابعة حالة طلبك من حسابك.</p>`
            ),
          })
        ).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      itemCount: (order as any).items?.length || finalItems.length,
      totalAmount: order.totalAmount,
    });

  } catch (error: any) {
    console.error("❌ Order creation error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الطلب: " + (error.message || "unknown error") },
      { status: 500 }
    );
  }
}

// GET — جلب طلبات المستخدم الحالي
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const customerId = (session?.user as any)?.id as string | undefined;

    if (!customerId) {
      return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const orders = await (prisma.order as any).findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
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
    console.error("❌ Orders GET error:", error);
    return NextResponse.json(
      { error: "فشل جلب الطلبات: " + error.message },
      { status: 500 }
    );
  }
}
