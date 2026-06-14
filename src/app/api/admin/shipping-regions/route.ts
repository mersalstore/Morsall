import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEFAULT_REGIONS = [
  { state: "الخرطوم", city: "الخرطوم", shippingRate: 5000, isActive: true },
  { state: "الخرطوم", city: "أم درمان", shippingRate: 5000, isActive: true },
  { state: "الخرطوم", city: "بحري", shippingRate: 5000, isActive: true },
  { state: "البحر الأحمر", city: "بورتسودان", shippingRate: 8000, isActive: true },
  { state: "نهر النيل", city: "شندي", shippingRate: 6000, isActive: true },
  { state: "نهر النيل", city: "عطبرة", shippingRate: 7000, isActive: true },
  { state: "الجزيرة", city: "ود مدني", shippingRate: 6000, isActive: true },
  { state: "شمال كردفان", city: "الأبيض", shippingRate: 7500, isActive: true },
  { state: "كسلا", city: "كسلا", shippingRate: 7500, isActive: true },
];

export async function GET(req: Request) {
  try {
    let regions = await prisma.shippingRegion.findMany({
      orderBy: { state: "asc" }
    });

    // Auto-seed default Sudan cities if empty
    if (regions.length === 0) {
      await prisma.shippingRegion.createMany({
        data: DEFAULT_REGIONS
      });
      regions = await prisma.shippingRegion.findMany({
        orderBy: { state: "asc" }
      });
    }

    return NextResponse.json(regions);
  } catch (error: any) {
    console.error("Fetch Shipping Regions Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session as any).user.role !== "ADMIN" && (session as any).user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { state, city, shippingRate, isActive } = await req.json();
    if (!state || !city) {
      return NextResponse.json({ error: "الولاية والمدينة مطلوبان" }, { status: 400 });
    }

    const region = await prisma.shippingRegion.create({
      data: {
        state,
        city,
        shippingRate: parseFloat(shippingRate) || 0,
        isActive: isActive !== false,
      }
    });

    return NextResponse.json(region);
  } catch (error: any) {
    console.error("Create Shipping Region Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session as any).user.role !== "ADMIN" && (session as any).user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, shippingRate, isActive } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID مطلوب للتحديث" }, { status: 400 });
    }

    const updateData: any = {};
    if (shippingRate !== undefined) updateData.shippingRate = parseFloat(shippingRate) || 0;
    if (isActive !== undefined) updateData.isActive = !!isActive;

    const region = await prisma.shippingRegion.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(region);
  } catch (error: any) {
    console.error("Update Shipping Region Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session as any).user.role !== "ADMIN" && (session as any).user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID مطلوب للحذف" }, { status: 400 });
    }

    await prisma.shippingRegion.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Shipping Region Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
