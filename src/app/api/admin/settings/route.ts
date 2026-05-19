import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user?.email || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });

    return NextResponse.json({ settings, admins });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user?.email || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();

    const updatedSettings = await prisma.settings.upsert({
      where: { id: 'global' },
      update: {
        maintenanceMode: data.maintenanceMode,
        maintenanceMessage: data.maintenanceMessage,
        platformCommission: data.platformCommission,
        exchangeRate: data.exchangeRate,
        codEnabled: data.codEnabled,
        bankTransferEnabled: data.bankTransferEnabled,
        bankName: data.bankName,
        bankAccountNumber: data.bankAccountNumber,
        bankAccountName: data.bankAccountName,
        logo: data.logo,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        whatsappNumber: data.whatsappNumber,
        facebookUrl: data.facebookUrl,
        instagramUrl: data.instagramUrl,
        siteTitle: data.siteTitle,
        siteDescription: data.siteDescription,
        bankAccounts: data.bankAccounts,
      },
      create: {
        id: 'global',
        maintenanceMode: data.maintenanceMode || false,
        maintenanceMessage: data.maintenanceMessage || "هناك خطأ تقني يجري إصلاحه",
        platformCommission: data.platformCommission || 10.0,
        exchangeRate: data.exchangeRate || 1.0,
        codEnabled: data.codEnabled ?? true,
        bankTransferEnabled: data.bankTransferEnabled ?? true,
        bankName: data.bankName || "",
        bankAccountNumber: data.bankAccountNumber || "",
        bankAccountName: data.bankAccountName || "",
        logo: data.logo,
        primaryColor: data.primaryColor || "#1089A4",
        secondaryColor: data.secondaryColor || "#F29124",
        siteTitle: data.siteTitle || "مرسال - تسوق بذكاء",
        siteDescription: data.siteDescription || "أكبر منصة تسوق في السودان",
        bankAccounts: data.bankAccounts || "",
      }
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// For adding new admins
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user?.email || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email, role } = await req.json();
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: role || 'ADMIN' }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
