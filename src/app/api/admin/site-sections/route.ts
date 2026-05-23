import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: "site_sections" },
    });

    let sections: any[] = [];
    if (config?.value) {
      try {
        sections = JSON.parse(config.value);
      } catch {}
    }

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Fetch sections error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  try {
    const { sections } = await req.json();
    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "sections must be an array" }, { status: 400 });
    }

    await prisma.siteConfig.upsert({
      where: { key: "site_sections" },
      update: { value: JSON.stringify(sections) },
      create: { key: "site_sections", value: JSON.stringify(sections) },
    });

    // Clear cached data
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save sections error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
