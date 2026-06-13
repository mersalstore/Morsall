import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const db = prisma as any;

// Only this email (the Vixcell build team) may edit custom vendor sites.
const SITE_EDITOR_EMAIL = "zomatube2012@gmail.com";

async function requireSiteEditor() {
  const session = await getServerSession(authOptions);
  const email = (session?.user as any)?.email?.trim().toLowerCase();
  if (!email || email !== SITE_EDITOR_EMAIL) return null;
  return session;
}

function readCustomSite(storeDesign: string | null) {
  if (!storeDesign) return { html: "", css: "", enabled: false };
  try {
    const parsed = JSON.parse(storeDesign);
    return {
      html: parsed?.customSite?.html ?? "",
      css: parsed?.customSite?.css ?? "",
      enabled: !!parsed?.customSite?.enabled,
    };
  } catch {
    return { html: "", css: "", enabled: false };
  }
}

// GET — list Custom Design vendors OR load one vendor's custom site (?vendorId=)
export async function GET(req: NextRequest) {
  const session = await requireSiteEditor();
  if (!session) return NextResponse.json({ error: "غير مصرح — هذه الصفحة لفريق Vixcell فقط" }, { status: 403 });

  const vendorId = new URL(req.url).searchParams.get("vendorId");

  if (vendorId) {
    const vendor = await db.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true, storeName: true, slug: true, tier: true, storeDesign: true },
    });
    if (!vendor) return NextResponse.json({ error: "التاجر غير موجود" }, { status: 404 });
    return NextResponse.json({ vendor: { ...vendor, customSite: readCustomSite(vendor.storeDesign) } });
  }

  // List all Custom Design vendors
  const vendors = await db.vendor.findMany({
    where: { tier: "CUSTOM_DESIGN" },
    select: { id: true, storeName: true, slug: true, tier: true, storeDesign: true, status: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    vendors: vendors.map((v: any) => ({
      id: v.id,
      storeName: v.storeName,
      slug: v.slug,
      status: v.status,
      hasCustomSite: readCustomSite(v.storeDesign).enabled,
    })),
  });
}

// POST — save custom HTML/CSS for a vendor's site
export async function POST(req: NextRequest) {
  const session = await requireSiteEditor();
  if (!session) return NextResponse.json({ error: "غير مصرح — هذه الصفحة لفريق Vixcell فقط" }, { status: 403 });

  const { vendorId, html, css, enabled } = await req.json();
  if (!vendorId) return NextResponse.json({ error: "vendorId مطلوب" }, { status: 400 });

  const vendor = await db.vendor.findUnique({ where: { id: vendorId }, select: { storeDesign: true } });
  if (!vendor) return NextResponse.json({ error: "التاجر غير موجود" }, { status: 404 });

  let design: any = {};
  if (vendor.storeDesign) {
    try { design = JSON.parse(vendor.storeDesign); } catch { design = {}; }
  }

  design.customSite = {
    html: (html ?? "").toString(),
    css: (css ?? "").toString(),
    enabled: !!enabled,
    updatedAt: new Date().toISOString(),
    updatedBy: SITE_EDITOR_EMAIL,
  };

  await db.vendor.update({
    where: { id: vendorId },
    data: { storeDesign: JSON.stringify(design) },
  });

  return NextResponse.json({ success: true, customSite: design.customSite });
}
