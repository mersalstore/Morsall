
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST — إنشاء طلب جديد من صفحة الـ Checkout
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const customerId = (session?.user as any)?.id as string | undefined;

    if (!customerId) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً لإتمام الطلب" },
        { status: 401 }
      );
    }

    const body = await req.json();
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
    const totalAmount = isExternalImport ? (parseFloat(body.totalAmount) || 0) : ((subtotal || 0) + (shippingCost || 0));

    if (isExternalImport) {
      // For external imports, we dynamically find or generate a product to link
      let selectedProduct = await prisma.product.findFirst({
        where: vendorId ? { vendorId } : {},
        select: { id: true, vendorId: true }
      });

      if (!selectedProduct) {
        // Fallback to any vendor product
        selectedProduct = await prisma.product.findFirst({ select: { id: true, vendorId: true } });
      }

      if (!selectedProduct) {
        // If absolutely no product exists, find a vendor to create one
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
          quantity: 1,
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

      // ── Validate & enrich items from DB ──────────────────
      const productIds = items.map((i: any) => i.productId).filter(Boolean);
      const dbProducts = productIds.length > 0
        ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, vendorId: true, price: true, title: true, stock: true },
        })
        : [];

      const productMap = Object.fromEntries(dbProducts.map((p: any) => [p.id, p]));
      let fallbackProduct = await prisma.product.findFirst({ select: { id: true, vendorId: true } });

      if (!fallbackProduct) {
        const someVendor = await prisma.vendor.findFirst({ select: { id: true } });
        if (someVendor) {
          fallbackProduct = await prisma.product.create({
            data: {
              title: "منتج تجريبي للطلبات",
              description: "تم إنشاؤه تلقائياً لدعم الطلبات التجريبية",
              price: items?.[0]?.price || 15000,
              stock: 999,
              vendorId: someVendor.id,
              status: "APPROVED"
            },
            select: { id: true, vendorId: true }
          });
        }
      }

      finalItems = items.map((item: any) => {
        const dbProduct = productMap[item.productId];
        if (!dbProduct && fallbackProduct) {
          return {
            productId: fallbackProduct.id,
            vendorId: fallbackProduct.vendorId,
            quantity: Math.max(1, parseInt(item.quantity) || 1),
            priceAtTime: item.price || 0,
            size: item.size || null,
            color: item.color || null,
          };
        }
        if (!dbProduct && !fallbackProduct) return null;
        return {
          productId: dbProduct!.id,
          vendorId: dbProduct!.vendorId,
          quantity: Math.max(1, parseInt(item.quantity) || 1),
          priceAtTime: dbProduct!.price || item.price || 0,
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
        shippingCost: isExternalImport ? 0 : (shippingCost || 0),
        status: isExternalImport ? status : "PENDING_APPROVAL",
        source,
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
