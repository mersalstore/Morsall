import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key) {
    const config = await prisma.siteConfig.findUnique({ where: { key } });
    return NextResponse.json(config ? JSON.parse(config.value) : null);
  }

  const configs = await prisma.siteConfig.findMany();
  const result: any = {};
  configs.forEach(c => {
    try {
      result[c.key] = JSON.parse(c.value);
    } catch {
      result[c.key] = c.value;
    }
  });
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "Key is required" }, { status: 400 });

  const config = await prisma.siteConfig.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });

  return NextResponse.json(config);
}
