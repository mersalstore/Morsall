import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import * as XLSX from 'xlsx';

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const products = await prisma.product.findMany({
      include: {
        vendor: true,
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const reportData = products.map(p => ({
      'ID': p.id,
      'المنتج': p.title,
      'السعر': p.price,
      'المخزون': p.stock,
      'الحالة': p.status,
      'المتجر': p.vendor?.storeName || '—',
      'القسم': p.category?.name || '—',
      'SKU': p.sku || '—',
      'تاريخ الإضافة': p.createdAt.toLocaleDateString('ar-EG')
    }));

    const format = new URL(req.url).searchParams.get("format");
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Report");
    
    if (format === "csv") {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="Mersal_Inventory.csv"'
        }
      });
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Mersal_Inventory_Report.xlsx"'
      }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
