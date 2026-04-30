import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { vendorProfile: true }
  });

  if (!user?.vendorProfile) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

  return NextResponse.json(user.vendorProfile);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { vendorProfile: true }
  });

  if (!user?.vendorProfile) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

  const body = await req.json();
  const { 
    storeName, 
    storeDescription, 
    slug, 
    location, 
    address, 
    storeLogo, 
    storeBanner, 
    primaryColor, 
    secondaryColor, 
    facebookUrl, 
    instagramUrl, 
    whatsappNumber 
  } = body;

  try {
    const updated = await prisma.vendor.update({
      where: { id: user.vendorProfile.id },
      data: {
        storeName,
        storeDescription,
        slug: slug 
          ? slug.toLowerCase().trim()
              .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-+|-+$/g, "")
          : undefined,
        location,
        address,
        storeLogo,
        storeBanner,
        primaryColor,
        secondaryColor,
        facebookUrl,
        instagramUrl,
        whatsappNumber
      } as any
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Vendor Settings PATCH Error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "هذا الرابط (slug) مستخدم بالفعل، اختر رابطاً آخر" }, { status: 400 });
    }
    return NextResponse.json({ error: `فشل في حفظ البيانات: ${error.message}` }, { status: 500 });
  }
}
