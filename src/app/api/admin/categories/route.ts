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

  // كل الأقسام مع العدد
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  const { name, icon } = await req.json();
  if (!name) return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  const category = await prisma.category.create({ data: { name, icon } });
  return NextResponse.json(category);
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  const { id, name, icon } = await req.json();
  const category = await prisma.category.update({
    where: { id },
    data: { ...(name && { name }), ...(icon !== undefined && { icon }) },
  });
  return NextResponse.json(category);
}

export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();
  const { id } = await req.json();
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
