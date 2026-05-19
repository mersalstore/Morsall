import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const toNum = (v: any): number | null => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};

// GET — جلب منتجات مع فلاتر (البحث المتقدم)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const emailLower = (session as any)?.user?.email?.trim().toLowerCase();
    const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
    
    if (!emailLower || (!SUPER_ADMINS.includes(emailLower) && (session as any).user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "pending" | "all"
    const search = searchParams.get("search");
    const vendorId = searchParams.get("vendorId");
    const categoryId = searchParams.get("categoryId");
    const stockStatus = searchParams.get("stockStatus"); // "IN_STOCK", "OUT_OF_STOCK", "LOW_STOCK"
    const productStatus = searchParams.get("productStatus");

    const where: any = {};
    if (type === "pending") where.status = "PENDING";
    else if (productStatus) where.status = productStatus;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { sku: { contains: search } }
      ];
    }
    if (vendorId) where.vendorId = vendorId;
    if (categoryId) where.categoryId = categoryId;
    
    if (stockStatus === "OUT_OF_STOCK") where.stock = 0;
    else if (stockStatus === "LOW_STOCK") where.stock = { gt: 0, lte: 10 };
    else if (stockStatus === "IN_STOCK") where.stock = { gt: 0 };

    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: { select: { id: true, storeName: true, location: true, userId: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST — إضافة منتج جديد من الأدمن مباشرة (يُنشر فوراً APPROVED)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const emailLower = (session as any)?.user?.email?.trim().toLowerCase();
    const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
    
    if (!emailLower || (!SUPER_ADMINS.includes(emailLower) && (session as any).user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, price, stock, images, categoryId, vendorId, sizes, colors, action, id, brand, range, discountPrice, discountType } = body;

    // لو عندنا action (موافقة/رفض)
    if (action && id) {
      const updated = await prisma.product.update({
        where: { id },
        data: {
          status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          rejectionReason: action === 'REJECT' ? body.reason || null : null,
          ...(body.price !== undefined && { price: toNum(body.price) || 0 }),
          ...(body.stock !== undefined && { stock: toNum(body.stock) || 0 }),
        } as any,
      });
      return NextResponse.json(updated);
    }

    // إضافة منتج جديد
    if (!title || !price || !vendorId) {
      return NextResponse.json({ error: "الاسم والسعر والمتجر مطلوبون" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description: description || "",
        price: toNum(price) || 0,
        stock: toNum(stock) || 0,
        images: Array.isArray(images) ? images.join(",") : images || "",
        sizes: Array.isArray(sizes) ? sizes.join(",") : sizes || null,
        colors: Array.isArray(colors) ? colors.join(",") : colors || null,
        vendorId,
        categoryId: categoryId || null,
        brand: brand || null,
        range: range || null,
        type: body.type || "SIMPLE",
        sku: body.sku || null,
        shortDescription: body.shortDescription || null,
        weight: toNum(body.weight),
        length: toNum(body.length),
        width: toNum(body.width),
        height: toNum(body.height),
        ram: body.ram || null,
        storage: body.storage || null,
        screenSize: body.screenSize || null,
        bundleData: body.bundleData || null,
        discountPrice: toNum(discountPrice),
        discountType: discountType || null,
        status: "APPROVED", 
      } as any,
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Admin Product POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — تعديل بيانات منتج موجود
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const emailLower = (session as any)?.user?.email?.trim().toLowerCase();
    const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
    
    if (!emailLower || (!SUPER_ADMINS.includes(emailLower) && (session as any).user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, description, price, stock, images, categoryId, vendorId, status, brand, range, type, sku, shortDescription, weight, length, width, height, ram, storage, screenSize, bundleData, discountPrice, discountType } = body;

    if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: toNum(price) || 0 }),
        ...(stock !== undefined && { stock: toNum(stock) || 0 }),
        ...(images !== undefined && { images: Array.isArray(images) ? images.join(",") : images }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(vendorId && { vendorId }),
        ...(status && { status }),
        ...(brand !== undefined && { brand: brand || null }),
        ...(range !== undefined && { range: range || null }),
        ...(type !== undefined && { type }),
        ...(sku !== undefined && { sku: sku || null }),
        ...(shortDescription !== undefined && { shortDescription: shortDescription || null }),
        ...(weight !== undefined && { weight: toNum(weight) }),
        ...(length !== undefined && { length: toNum(length) }),
        ...(width !== undefined && { width: toNum(width) }),
        ...(height !== undefined && { height: toNum(height) }),
        ...(ram !== undefined && { ram: ram || null }),
        ...(storage !== undefined && { storage: storage || null }),
        ...(screenSize !== undefined && { screenSize: screenSize || null }),
        ...(bundleData !== undefined && { bundleData: bundleData || null }),
        ...(discountPrice !== undefined && { discountPrice: toNum(discountPrice) }),
        ...(discountType !== undefined && { discountType: discountType || null }),
      } as any,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — حذف منتج أو مجموعة منتجات
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const emailLower = (session as any)?.user?.email?.trim().toLowerCase();
    const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
    
    if (!emailLower || (!SUPER_ADMINS.includes(emailLower) && (session as any).user.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, ids } = await req.json();
    if (ids && Array.isArray(ids)) {
      await prisma.product.deleteMany({ where: { id: { in: ids } } });
    } else if (id) {
      await prisma.product.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "No id provided" }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
