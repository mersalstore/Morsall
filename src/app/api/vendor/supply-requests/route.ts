import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    }

    const requests = await prisma.supplyRequest.findMany({
      where: { vendorId: vendor.id },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(requests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { items } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: "الرجاء تحديد منتجات لطلب التوريد" }, { status: 400 });
    }

    const totalItems = items.reduce((acc: number, item: any) => acc + Number(item.expectedQty), 0);

    const supplyRequest = await prisma.supplyRequest.create({
      data: {
        vendorId: vendor.id,
        totalItems,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            expectedQty: Number(item.expectedQty)
          }))
        }
      },
      include: {
        items: { include: { product: true } }
      }
    });

    return NextResponse.json(supplyRequest);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
