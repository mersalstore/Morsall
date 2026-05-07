
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch withdrawal history for the logged-in vendor
export async function GET() {
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

    const withdrawals = await prisma.withdrawal.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json(withdrawals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new withdrawal request
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

    // 1. Calculate available balance
    const orderItems = await prisma.orderItem.findMany({
      where: {
        vendorId: vendor.id,
        order: {
          status: { in: ["APPROVED", "PACKING", "SHIPPED", "DELIVERED"] }
        }
      },
      select: { priceAtTime: true, quantity: true }
    });

    const totalEarned = orderItems.reduce((acc, item) => acc + (item.priceAtTime * item.quantity), 0);
    const grossProfit = totalEarned * (1 - vendor.commissionRate / 100) - vendor.fixedFee;

    const withdrawals = await prisma.withdrawal.findMany({
      where: { vendorId: vendor.id, status: { not: "REJECTED" } },
      select: { amount: true }
    });

    const totalWithdrawn = withdrawals.reduce((acc, w) => acc + w.amount, 0);
    const availableBalance = grossProfit - totalWithdrawn;

    // 2. Check if amount is valid
    const body = await req.json();
    const amount = parseFloat(body.amount);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (amount > availableBalance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // 3. Fetch min withdrawal from settings
    const settings = await prisma.settings.findUnique({ where: { id: "global" } });
    const minWithdrawal = (settings as any)?.minWithdrawal || 1000;

    if (amount < minWithdrawal) {
      return NextResponse.json({ error: `الحد الأدنى للسحب هو ${minWithdrawal} ج.س` }, { status: 400 });
    }

    // 4. Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        vendorId: vendor.id,
        amount,
        status: "PENDING"
      }
    });

    return NextResponse.json(withdrawal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
