import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const regions = await prisma.shippingRegion.findMany({
      where: { isActive: true },
      orderBy: { state: "asc" }
    });
    return NextResponse.json(regions);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
