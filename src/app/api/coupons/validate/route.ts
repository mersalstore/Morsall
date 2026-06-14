import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { code, items, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "رمز الكوبون مطلوب" }, { status: 400 });
    }

    // Find the coupon in the database
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "الكوبون غير صحيح أو غير موجود" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "هذا الكوبون غير نشط حالياً" }, { status: 400 });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: "عذراً، هذا الكوبون منتهي الصلاحية" }, { status: 400 });
    }

    // Parse targetIds if present
    let targets: string[] = [];
    if (coupon.targetIds) {
      try {
        const parsed = JSON.parse(coupon.targetIds);
        targets = Array.isArray(parsed) ? parsed : [coupon.targetIds];
      } catch {
        targets = coupon.targetIds.split(",").map(t => t.trim()).filter(Boolean);
      }
    }

    // Determine matching items subtotal
    let matchingSubtotal = 0;
    const scope = coupon.scope || "ALL";

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        let isMatch = false;

        if (scope === "ALL") {
          isMatch = true;
        } else if (scope === "PRODUCTS") {
          isMatch = targets.includes(item.productId);
        } else if (scope === "VENDORS") {
          isMatch = targets.includes(item.vendorId) || !!(coupon.vendorId && coupon.vendorId === item.vendorId);
        }

        if (isMatch) {
          matchingSubtotal += (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
        }
      }
    } else {
      // Fallback if items are not provided
      matchingSubtotal = parseFloat(subtotal) || 0;
    }

    if (matchingSubtotal <= 0) {
      return NextResponse.json({ error: "هذا الكوبون لا ينطبق على المنتجات الموجودة في السلة" }, { status: 400 });
    }

    // Enforce minOrderAmount
    const minAmount = coupon.minOrderAmount || 0;
    const currentSubtotal = parseFloat(subtotal) || matchingSubtotal;
    if (currentSubtotal < minAmount) {
      return NextResponse.json({ 
        error: `الحد الأدنى لاستخدام الكوبون هو ${minAmount.toLocaleString()} ج.س` 
      }, { status: 400 });
    }

    // Calculate discount value
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = matchingSubtotal * (coupon.discountValue / 100);
      const maxDiscount = coupon.maxDiscount || 0;
      if (maxDiscount > 0 && discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    } else {
      // FIXED value
      discountAmount = coupon.discountValue;
      if (discountAmount > matchingSubtotal) {
        discountAmount = matchingSubtotal;
      }
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      scope,
    });
  } catch (error: any) {
    console.error("Coupon Validation Error:", error);
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 });
  }
}
