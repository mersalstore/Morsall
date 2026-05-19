import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ driverId: string }> }
) {
  try {
    const { driverId } = await params;
    const { isOnline } = await req.json();

    if (!driverId || isOnline === undefined) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const updated = await prisma.deliveryDriver.update({
      where: { id: driverId },
      data: { isOnline: Boolean(isOnline) }
    });

    return NextResponse.json({ success: true, driver: updated });
  } catch (error: any) {
    console.error("Driver patch status error:", error);
    return NextResponse.json({ error: "Failed to update driver status" }, { status: 500 });
  }
}
