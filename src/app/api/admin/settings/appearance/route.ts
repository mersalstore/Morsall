import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "global" } });
    const banners = await prisma.siteBanner.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ settings, banners });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, ...data } = body;

    if (type === "BANNER") {
      const banner = await prisma.siteBanner.upsert({
        where: { id: data.id || "new" },
        update: data,
        create: data,
      });
      return NextResponse.json(banner);
    }

    const settings = await prisma.settings.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data },
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
