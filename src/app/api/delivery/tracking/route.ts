import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { driverId, lat, lng } = await req.json();

    if (!driverId || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const updated = await prisma.deliveryDriver.update({
      where: { id: driverId },
      data: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        isOnline: true,
      },
    });

    return NextResponse.json({ success: true, driverId: updated.id });
  } catch (error: any) {
    console.error("GPS Tracking Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
