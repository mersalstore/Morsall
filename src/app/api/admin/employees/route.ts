import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";

const db = prisma;

// GET — جلب قائمة الموظفين
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const employees = await db.employee.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(employees);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — إضافة موظف جديد ومزامنة الدور مع جدول المستخدمين
export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { name, email, role, password, permissions } = await req.json();
    if (!name || !email || !role) {
      return NextResponse.json({ error: "الاسم والبريد والدور مطلوبة" }, { status: 400 });
    }

    const lowerEmail = email.toLowerCase();

    // 1. التحقق من وجود الموظف مسبقاً
    const existing = await db.employee.findUnique({ where: { email: lowerEmail } });
    if (existing) {
      return NextResponse.json({ error: "هذا البريد الإلكتروني مسجل كموظف بالفعل" }, { status: 400 });
    }

    // 2. التحقق من وجود حساب User — إذا لم يكن موجوداً نصنعه
    const bcrypt = await import("bcryptjs");
    const tempPassword = password || `Morsall@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const existingUser = await db.user.findUnique({ where: { email: lowerEmail } });

    if (!existingUser) {
      await db.user.create({
        data: {
          name,
          email: lowerEmail,
          password: hashedPassword,
          role,
          permissions: permissions || null,
          isOnboarded: true,
        },
      });
    } else {
      // تحديث الدور فقط إذا كان الحساب موجوداً
      await db.user.update({
        where: { email: lowerEmail },
        data: {
          role,
          permissions: permissions || null,
          name: existingUser.name || name,
          ...(password ? { password: hashedPassword } : {}),
        },
      });
    }

    // 3. إنشاء الموظف في جدول الموظفين
    const employee = await db.employee.create({ data: { name, email: lowerEmail, role, permissions: permissions || null } });

    return NextResponse.json({
      ...employee,
      tempPassword: existingUser ? null : tempPassword, // نرسل الباسورد المؤقتة للعرض
      userCreated: !existingUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — تحديث بيانات الموظف
export async function PATCH(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { id, name, role, isActive, permissions } = await req.json();
    if (!id) return NextResponse.json({ error: "ID مطلوب" }, { status: 400 });

    const employee = await db.employee.update({
      where: { id },
      data: { 
        ...(name && { name }), 
        ...(role && { role }), 
        ...(isActive !== undefined && { isActive }),
        ...(permissions !== undefined && { permissions })
      },
    });

    // مزامنة الدور والخصوصيات الجديد مع جدول المستخدمين
    if (employee.email) {
      await db.user.updateMany({
        where: { email: employee.email.toLowerCase() },
        data: { 
          ...(role && { role }),
          ...(permissions !== undefined && { permissions })
        }
      });
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — حذف الموظف وإعادة رتبة المستخدم إلى CUSTOMER
export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return adminOnlyResponse();

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID مطلوب" }, { status: 400 });

    const employee = await db.employee.findUnique({ where: { id } });
    
    if (employee) {
      // إعادة المستخدم لرتبة عميل عادي عند حذفه من الموظفين
      await db.user.updateMany({
        where: { email: employee.email.toLowerCase() },
        data: { role: "CUSTOMER" }
      });
      
      await db.employee.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
