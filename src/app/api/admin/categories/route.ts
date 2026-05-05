import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

// GET — جلب الأقسام مع عدد المنتجات
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    // جلب قسم واحد مع منتجاته
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          include: { vendor: { select: { storeName: true } } },
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return NextResponse.json(category);
  }

  // كل الأقسام مع العدد والعلاقات
  const categories = await prisma.category.findMany({
    include: { 
      _count: { select: { products: true } },
      parent: { select: { name: true } },
      children: { select: { id: true, name: true } }
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  const { name, icon, image, parentId, showInNavbar } = await req.json();
  if (!name) return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  const category = await prisma.category.create({ 
    data: { 
      name, 
      icon, 
      image,
      parentId: parentId || null,
      showInNavbar: !!showInNavbar 
    } 
  });
  return NextResponse.json(category);
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  
  try {
    const { id, name, icon, image, parentId, showInNavbar } = await req.json();
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

    const category = await prisma.category.update({
      where: { id },
      data: { 
        ...(name && { name }), 
        ...(icon !== undefined && { icon }),
        ...(image !== undefined && { image }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(showInNavbar !== undefined && { showInNavbar })
      },
    });
    return NextResponse.json(category);
  } catch (err: any) {
    console.error("Category Update Error:", err);
    return NextResponse.json({ error: err.message || "فشل التحديث" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Category Delete Error:", err);
    return NextResponse.json({ error: "لا يمكن حذف هذا القسم لأنه يحتوي على منتجات أو أقسام فرعية" }, { status: 500 });
  }
}
