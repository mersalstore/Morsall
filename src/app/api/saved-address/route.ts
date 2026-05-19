import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const db = prisma as any;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const savedAddress = await db.savedAddress.findFirst({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });

    return NextResponse.json(savedAddress || null);
  } catch (error: any) {
    console.error("Saved address GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    if (!userId) {
      return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const { city, district, street, label = "المنزل" } = await req.json();

    if (!city || !street) {
      return NextResponse.json({ error: "المدينة والشارع مطلوبان" }, { status: 400 });
    }

    // Set other addresses to not default if this one will be default
    await db.savedAddress.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    const savedAddress = await db.savedAddress.create({
      data: {
        userId,
        city: city.trim(),
        district: (district || city).trim(),
        street: street.trim(),
        label,
        isDefault: true
      }
    });

    return NextResponse.json({ success: true, savedAddress });
  } catch (error: any) {
    console.error("Saved address POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
