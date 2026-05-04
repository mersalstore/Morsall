import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const banners = await prisma.siteBanner.findMany({
      orderBy: { order: "asc" }
    });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const data = await req.json();
    const banner = await prisma.siteBanner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl,
        type: data.type || "HOME_HERO",
        link: data.link,
        targetId: data.targetId,
        isActive: data.isActive ?? true,
        order: data.order || 0
      }
    });

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const banner = await prisma.siteBanner.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.siteBanner.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
