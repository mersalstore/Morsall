import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import * as XLSX from 'xlsx';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session as any)?.user?.email || (session as any).user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch Sales Data
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            vendor: true,
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Flatten data for Excel
    const reportData = orders.map(order => ({
      'رقم الطلب': order.id,
      'العميل': order.customer?.name || order.customer?.email || "—",
      'الهاتف': order.phone,
      'المدينة': order.city,
      'المبلغ الإجمالي': order.totalAmount,
      'تاريخ الطلب': order.createdAt.toLocaleDateString('ar-EG'),
      'حالة الطلب': order.status,
      'المتاجر': Array.from(new Set(order.items.map((item: any) => item.vendor?.storeName))).join(', ')
    }));

    const format = new URL(req.url).searchParams.get("format");
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    
    if (format === "csv") {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="Mersal_Sales.csv"'
        }
      });
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Mersal_Monthly_Report.xlsx"'
      }
    });

  } catch (error) {
    console.error("Excel Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
