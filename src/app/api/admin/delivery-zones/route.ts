import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();
    const zones = await prisma.deliveryZone.findMany({ orderBy: { toCity: "asc" } });
    return NextResponse.json(zones);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch zones" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();
    const { fromCity, toCity, fee, deliveryDays } = await req.json();
    if (!fromCity || !toCity || fee === undefined) {
      return NextResponse.json({ error: "البيانات غير مكتملة" }, { status: 400 });
    }
    const zone = await prisma.deliveryZone.create({ 
      data: { fromCity, toCity, fee: Number(fee), deliveryDays: Number(deliveryDays) || 1 } 
    });
    return NextResponse.json(zone);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create zone: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();
    const { id } = await req.json();
    await prisma.deliveryZone.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete zone" }, { status: 500 });
  }
}
