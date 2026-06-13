import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  console.log("[RESET_PWD] Incoming reset password request");

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const code = body.code?.trim();
  const newPassword = body.newPassword;

  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "البريد الإلكتروني، رمز التحقق، وكلمة المرور الجديدة مطلوبة" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "كلمة المرور يجب أن لا تقل عن 6 أحرف" }, { status: 400 });
  }

  try {
    // 1. Find the token in database
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "رمز التحقق غير صحيح" }, { status: 400 });
    }

    // 2. Check if expired
    const isExpired = new Date() > tokenRecord.expires;
    if (isExpired) {
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: email,
          token: code,
        },
      });
      return NextResponse.json({ error: "رمز التحقق منتهي الصلاحية، يرجى طلب رمز جديد" }, { status: 400 });
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 8);

    // 4. Update password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        // Also verify the email since they succeeded in verifying their identity
        emailVerified: new Date()
      },
    });

    // 5. Clean up the token
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });

    console.log(`[RESET_PWD] Password reset successfully for: ${email}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[RESET_PWD] Error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء إعادة تعيين كلمة المرور",
      details: error.message 
    }, { status: 500 });
  }
}
