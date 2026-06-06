import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/mail";

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
      select: { id: true, emailVerified: true }
    });

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json({ error: "البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول" }, { status: 400 });
      }
      
      // Update unverified user details in case they want to fix typos or change password
      const hashedPassword = await bcrypt.hash(password, 8);
      await prisma.user.update({
        where: { email },
        data: { name, password: hashedPassword }
      });

      // Clear existing tokens and save new one
      await prisma.verificationToken.deleteMany({ where: { identifier: email } });
      await prisma.verificationToken.create({
        data: { identifier: email, token: code, expires }
      });

      // Send email
      const emailSent = await sendVerificationEmail(email, code, "VERIFY");
      if (!emailSent) {
        return NextResponse.json({ error: "فشل إرسال كود التحقق. يرجى المحاولة لاحقاً." }, { status: 500 });
      }

      console.log(`[REG] Verification code re-sent for unverified existing user: ${existingUser.id}`);
      return NextResponse.json({ success: true, userId: existingUser.id, needsVerification: true });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 8);

    // 3. Create unverified user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "CUSTOMER",
        isOnboarded: false,
        emailVerified: null,
      },
    });

    // Clear existing tokens and save new one
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: code, expires }
    });

    // Send email
    const emailSent = await sendVerificationEmail(email, code, "VERIFY");
    if (!emailSent) {
      return NextResponse.json({ error: "فشل إرسال كود التحقق. يرجى المحاولة لاحقاً." }, { status: 500 });
    }

    console.log(`[REG] User created (unverified): ${user.id}`);
    return NextResponse.json({ success: true, userId: user.id, needsVerification: true });

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
