import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

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
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

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
    const payload = body.settings || data;
    const updateSettings: any = {};
    if (payload.siteTitle !== undefined) updateSettings.siteTitle = payload.siteTitle;
    if (payload.siteDescription !== undefined) updateSettings.siteDescription = payload.siteDescription;
    if (payload.logo !== undefined) updateSettings.logo = payload.logo;
    if (payload.primaryColor !== undefined) updateSettings.primaryColor = payload.primaryColor;
    if (payload.secondaryColor !== undefined) updateSettings.secondaryColor = payload.secondaryColor;
    if (payload.whatsappNumber !== undefined) updateSettings.whatsappNumber = payload.whatsappNumber;
    if (payload.facebookUrl !== undefined) updateSettings.facebookUrl = payload.facebookUrl;
    if (payload.instagramUrl !== undefined) updateSettings.instagramUrl = payload.instagramUrl;
    if (payload.codExtraFee !== undefined) updateSettings.codExtraFee = payload.codExtraFee;
    if (payload.bankAccounts !== undefined) updateSettings.bankAccounts = payload.bankAccounts;
    if (payload.platformCommission !== undefined) updateSettings.platformCommission = payload.platformCommission;
    if (payload.commissionType !== undefined) updateSettings.commissionType = payload.commissionType;
    if (payload.fixedCommission !== undefined) updateSettings.fixedCommission = payload.fixedCommission;

    const settings = await prisma.settings.upsert({
      where: { id: "global" },
      update: updateSettings,
      create: { 
        id: "global",
        siteTitle: payload.siteTitle || "مرسال",
        siteDescription: payload.siteDescription || "",
        logo: payload.logo,
        primaryColor: payload.primaryColor || "#1089A4",
        secondaryColor: payload.secondaryColor || "#F29124",
        whatsappNumber: payload.whatsappNumber,
        facebookUrl: payload.facebookUrl,
        instagramUrl: payload.instagramUrl,
        codExtraFee: payload.codExtraFee || 0,
        bankAccounts: payload.bankAccounts || "",
        platformCommission: payload.platformCommission || 10.0,
        commissionType: payload.commissionType || "PERCENTAGE",
        fixedCommission: payload.fixedCommission || 0.0,
      },
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Appearance Update Error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
