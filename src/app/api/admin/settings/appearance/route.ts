import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      // Special check for our super-admin credentials just in case session is tricky
      // but standard auth should handle it. 
      // For now, let's stick to session.
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, id, ...data } = body;

    if (type === "BANNER") {
      if (id && id !== "new") {
        // Construct update object with only defined fields
        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
        if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
        if (data.link !== undefined) updateData.link = data.link;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.order !== undefined) updateData.order = data.order;

        const banner = await prisma.siteBanner.update({
          where: { id },
          data: updateData,
        });
        return NextResponse.json(banner);
      } else {
        const banner = await prisma.siteBanner.create({
          data: {
            title: data.title || "عرض جديد",
            subtitle: data.subtitle || "",
            imageUrl: data.imageUrl,
            link: data.link || "",
            isActive: data.isActive ?? true,
            order: data.order ?? 0,
            type: data.bannerType || "HOME_HERO"
          },
        });
        return NextResponse.json(banner);
      }
    }

    // Global settings update - construct update object
    const updateSettings: any = {};
    if (data.siteTitle !== undefined) updateSettings.siteTitle = data.siteTitle;
    if (data.siteDescription !== undefined) updateSettings.siteDescription = data.siteDescription;
    if (data.logo !== undefined) updateSettings.logo = data.logo;
    if (data.primaryColor !== undefined) updateSettings.primaryColor = data.primaryColor;
    if (data.secondaryColor !== undefined) updateSettings.secondaryColor = data.secondaryColor;
    if (data.whatsappNumber !== undefined) updateSettings.whatsappNumber = data.whatsappNumber;
    if (data.facebookUrl !== undefined) updateSettings.facebookUrl = data.facebookUrl;
    if (data.instagramUrl !== undefined) updateSettings.instagramUrl = data.instagramUrl;

    const settings = await prisma.settings.upsert({
      where: { id: "global" },
      update: updateSettings,
      create: { 
        id: "global",
        siteTitle: data.siteTitle || "مرسال",
        siteDescription: data.siteDescription || "",
        logo: data.logo,
        primaryColor: data.primaryColor || "#1089A4",
        secondaryColor: data.secondaryColor || "#F29124",
        whatsappNumber: data.whatsappNumber,
        facebookUrl: data.facebookUrl,
        instagramUrl: data.instagramUrl,
      },
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Appearance Update Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
