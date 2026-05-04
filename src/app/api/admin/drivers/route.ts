import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const drivers = await prisma.deliveryDriver.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { orders: { where: { status: "SHIPPED" } } }
        }
      }
    });

    return NextResponse.json(drivers);
  } catch (error: any) {
    console.error("GET Drivers Error:", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const body = await req.json();
    const { name, phone, vehicleType } = body;

    if (!name || !phone || !vehicleType) {
      return NextResponse.json({ error: "البيانات غير مكتملة" }, { status: 400 });
    }

    const driver = await prisma.deliveryDriver.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        vehicleType: vehicleType.trim(),
        isActive: true,
      }
    });

    return NextResponse.json(driver);
  } catch (error: any) {
    console.error("POST Driver Error:", error);
    return NextResponse.json({ error: "Failed to create driver: " + error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { id, isActive, action } = await req.json();
    if (!id) return NextResponse.json({ error: "ID Required" }, { status: 400 });

    const updated = await prisma.deliveryDriver.update({
      where: { id },
      data: { 
        isActive: action === 'APPROVE' ? true : (isActive !== undefined ? isActive : undefined)
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID Required" }, { status: 400 });

    await prisma.deliveryDriver.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
