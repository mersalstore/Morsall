import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

const db = prisma as any;

export const dynamic = "force-dynamic";

// GET — جلب كل كوبونات المنصة (التي ينشئها الأدمن، vendorId = null)
export async function GET() {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  try {
    const coupons = await db.coupon.findMany({
      where: { vendorId: null },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(coupons);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — إنشاء كوبون على مستوى المنصة
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  const body = await req.json();
  const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiryDate, scope, targetIds } = body;

  if (!code || !discountType || discountValue == null || discountValue === "") {
    return NextResponse.json({ error: "الكود ونوع وقيمة الخصم مطلوبة" }, { status: 400 });
  }

  try {
    const coupon = await db.coupon.create({
      data: {
        code: String(code).trim().toUpperCase(),
        discountType, // PERCENTAGE | FIXED
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : 0,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        vendorId: null,
        scope: scope || "ALL",
        targetIds: Array.isArray(targetIds) && targetIds.length > 0 ? JSON.stringify(targetIds) : null,
      },
    });
    return NextResponse.json(coupon);
  } catch (error: any) {
    if (error.code === "P2002") return NextResponse.json({ error: "كود الكوبون مستخدم بالفعل" }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — تفعيل / تعطيل كوبون
export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  const { id, isActive } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  try {
    const coupon = await db.coupon.update({ where: { id }, data: { isActive } });
    return NextResponse.json(coupon);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — حذف كوبون
export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  try {
    await db.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
