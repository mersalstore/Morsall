import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  console.log("[REG] Incoming registration request");
  
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const name = body.name?.trim();

  if (!email || !password || !name) {
    return NextResponse.json({ 
      error: `بيانات ناقصة: ${!name ? 'الاسم ' : ''}${!email ? 'البريد ' : ''}${!password ? 'كلمة المرور' : ''}` 
    }, { status: 400 });
  }

  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json({ error: "البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول" }, { status: 400 });
    }

    // 2. Hash password (8 rounds is faster and still secure enough for this scale)
    const hashedPassword = await bcrypt.hash(password, 8);

    // 3. Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "CUSTOMER",
        isOnboarded: false,
      },
    });

    console.log(`[REG] User created: ${user.id}`);
    return NextResponse.json({ success: true, userId: user.id });

  } catch (error: any) {
    console.error("[REG] Error:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "البريد الإلكتروني مسجل بالفعل" }, { status: 400 });
    }

    return NextResponse.json({ 
      error: "حدث خطأ في النظام أثناء إنشاء الحساب",
      details: error.message 
    }, { status: 500 });
  }
}
