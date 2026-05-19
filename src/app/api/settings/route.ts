import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "global" },
      select: {
        bankTransferEnabled: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountName: true,
        codEnabled: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        siteTitle: true,
        siteDescription: true,
        contactEmail: true,
        contactPhone: true,
        whatsappNumber: true,
        bankAccounts: true,
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
