import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: { isActive: true }
    });
    return NextResponse.json(zones);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch delivery zones" }, { status: 500 });
  }
}
