import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { key: "site_sections" },
    });

    let sections: any[] = [];
    if (config?.value) {
      try {
        sections = JSON.parse(config.value);
        sections = sections.filter((s: any) => s.isActive !== false);
        sections.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
      } catch {}
    }

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Fetch public sections error:", error);
    return NextResponse.json({ sections: [] });
  }
}
