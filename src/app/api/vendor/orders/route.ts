
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

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

    // Fetch orders that have items belonging to this vendor
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: { vendorId: vendor.id }
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          where: { vendorId: vendor.id },
          include: {
            product: { select: { title: true, images: true } },
            variation: true
          }
        }
      }
    });

    // Map to a more vendor-friendly format
    const vendorOrders = orders.map(order => ({
      id: order.id,
      customerName: order.customerName,
      phone: order.phone,
      city: order.city,
      status: order.status,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount, // Note: This is the total order amount, maybe vendor just wants their portion?
      vendorItems: order.items.map(item => ({
        id: item.id,
        productTitle: item.product.title,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime,
        image: item.variation?.image || item.product.images?.split(",")[0],
        size: item.size,
        color: item.color,
        variationCombination: item.variation ? item.variation.combination : null
      }))
    }));

    return NextResponse.json(vendorOrders);
  } catch (error: any) {
    console.error("Vendor Orders API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
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
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId and status are required" }, { status: 400 });
    }

    // Verify the order belongs to this vendor
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: { vendorId: vendor.id }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 });
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Vendor Order Patch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
