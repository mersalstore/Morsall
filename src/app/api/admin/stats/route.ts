import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    // Get date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalVendors, totalSales, totalWithdrawals, pendingVendorsList, settings, dailySales] = await Promise.all([
      prisma.vendor.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      prisma.vendor.findMany({ 
        where: { status: 'PENDING' }, 
        include: { user: true },
        take: 5 
      }),
      prisma.settings.findUnique({ where: { id: 'global' } }),
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: sevenDaysAgo },
          status: 'DELIVERED'
        },
        _sum: { totalAmount: true }
      })
    ]);

    // Format daily sales for chart
    const chartData = dailySales.reduce((acc: any, curr: any) => {
      const date = new Date(curr.createdAt).toLocaleDateString('ar-EG', { weekday: 'short' });
      acc[date] = (acc[date] || 0) + (curr._sum.totalAmount || 0);
      return acc;
    }, {});

    const salesAmount = totalSales._sum.totalAmount || 0;
    const commission = settings?.platformCommission || 10;
    const netProfit = (salesAmount * commission) / 100;

    return NextResponse.json({
      stats: [
        { label: "إجمالي المتاجر", value: totalVendors.toString(), icon: "groups", color: "bg-gradient-to-br from-purple-600 to-purple-800" },
        { label: "مبيعات المنصة", value: `${salesAmount.toLocaleString()} ج.س`, icon: "payments", color: "bg-gradient-to-br from-[#1089A4] to-[#086F85]" },
        { label: "صافي أرباح الموقع", value: `${netProfit.toLocaleString()} ج.س`, icon: "trending_up", color: "bg-gradient-to-br from-[#021D24] to-[#010D11]" },
      ],
      pendingWithdrawals: totalWithdrawals,
      chartData: Object.entries(chartData).map(([name, value]) => ({ name, value })),
      pendingVendors: pendingVendorsList.map((v: any) => ({
        id: v.id,
        name: v.user?.name || "بدون اسم",
        store: v.storeName,
        city: v.location,
        docs: v.bankStatementUrl
      }))
    });

  } catch (error) {
    console.error("Admin Stats Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
