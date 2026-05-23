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

  let design = null;
  if (user.vendorProfile.storeDesign) {
    try { design = JSON.parse(user.vendorProfile.storeDesign); } catch { design = null; }
  }

  // Get design pricing from site config
  const dp = await prisma.siteConfig.findUnique({ where: { key: "designPricing" } });
  const designPricing = dp ? JSON.parse(dp.value) : {
    basic: { price: 0, label: "مجاني", sections: 4 },
    premium: { price: 15000, label: "بريميوم", sections: 10 },
    custom: { price: 35000, label: "مخصص", sections: 20 },
  };

  return NextResponse.json({ design, designPricing, vendor: user.vendorProfile });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { vendorProfile: true }
  });

  if (!user?.vendorProfile) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

  const body = await req.json();
  const { sections, designTier } = body;

  try {
    await prisma.vendor.update({
      where: { id: user.vendorProfile.id },
      data: {
        storeDesign: JSON.stringify({ sections: sections || [], designTier: designTier || "basic", updatedAt: new Date().toISOString() })
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
