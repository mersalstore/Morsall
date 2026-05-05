import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "all"; // today, week, month, all, custom
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();
    if (range === "today") {
      const start = new Date(now); start.setHours(0,0,0,0);
      const end = new Date(now); end.setHours(23,59,59,999);
      dateFilter = { createdAt: { gte: start, lte: end } };
    } else if (range === "week") {
      const start = new Date(now); start.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { gte: start } };
    } else if (range === "month") {
      const start = new Date(now); start.setDate(now.getDate() - 30);
      dateFilter = { createdAt: { gte: start } };
    } else if (range === "custom" && from && to) {
      dateFilter = { createdAt: { gte: new Date(from), lte: new Date(to + "T23:59:59") } };
    }

    const ALL_STATUSES = [
      "PENDING", "PENDING_CONFIRM", "CONFIRMED", "PROCESSING",
      "PENDING_PICKUP", "AT_BRANCH", "SHIPPED", "DELIVERED",
      "CANCELLED", "RETURNED", "NO_ANSWER", "POSTPONED"
    ];

    const [
      totalVendors,
      totalSales,
      pendingVendorsList,
      settings,
      dailySales,
      orderStatusCounts,
      deliveryByCity,
      activeDrivers
    ] = await Promise.all([
      prisma.vendor.count(),
      prisma.order.aggregate({ where: dateFilter, _sum: { totalAmount: true }, _count: true }),
      prisma.vendor.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
        take: 5
      }),
      prisma.settings.findUnique({ where: { id: 'global' } }),
      // Daily chart data
      prisma.order.findMany({
        where: {
          ...dateFilter,
          status: "DELIVERED"
        },
        select: { createdAt: true, totalAmount: true }
      }),
      // Count per status
      Promise.all(ALL_STATUSES.map(s =>
        prisma.order.count({ where: { ...dateFilter, status: s as any } }).then(count => ({ status: s, count }))
      )),
      // Delivery by city
      prisma.order.groupBy({
        by: ['city'],
        where: { ...dateFilter },
        _count: { id: true },
        _sum: { totalAmount: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      // Active drivers (has orders in SHIPPED status recently)
      prisma.deliveryDriver.count({ where: { isActive: true } }).catch(() => 0)
    ]);

    // Format daily chart
    const chartMap: Record<string, number> = {};
    dailySales.forEach((o: any) => {
      const date = new Date(o.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
      chartMap[date] = (chartMap[date] || 0) + (o.totalAmount || 0);
    });

    const salesAmount = totalSales._sum.totalAmount || 0;
    const commission = settings?.platformCommission || 10;
    const netProfit = (salesAmount * commission) / 100;

    const statusCountMap: Record<string, number> = {};
    orderStatusCounts.forEach(({ status, count }: any) => { statusCountMap[status] = count; });

    return NextResponse.json({
      stats: [
        { label: "إجمالي المتاجر", value: totalVendors.toString(), icon: "groups", color: "bg-gradient-to-br from-purple-600 to-purple-800", tab: "vendors" },
        { label: "مبيعات المنصة", value: `${salesAmount.toLocaleString()} ج.س`, icon: "payments", color: "bg-gradient-to-br from-[#1089A4] to-[#086F85]", tab: "finance" },
        { label: "صافي أرباح الموقع", value: `${netProfit.toLocaleString()} ج.س`, icon: "trending_up", color: "bg-gradient-to-br from-[#021D24] to-[#010D11]", tab: "finance" },
        { label: "إجمالي الطلبات", value: totalSales._count.toString(), icon: "shopping_bag", color: "bg-gradient-to-br from-[#F29124] to-orange-700", tab: "orders" },
      ],
      orderStatuses: statusCountMap,
      pendingWithdrawals: 0,
      chartData: Object.entries(chartMap).map(([name, value]) => ({ name, value })),
      pendingVendors: pendingVendorsList.map((v: any) => ({
        id: v.id,
        name: v.user?.name || "بدون اسم",
        store: v.storeName,
        city: v.location,
        docs: v.bankStatementUrl
      })),
      deliveryByCity: deliveryByCity.map((d: any) => ({
        city: d.city || "غير محدد",
        count: d._count.id,
        total: d._sum.totalAmount || 0
      })),
      activeDrivers
    });

  } catch (error) {
    console.error("Admin Stats Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
