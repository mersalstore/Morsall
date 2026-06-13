import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  console.log("[FORGOT] Incoming forgot password request");

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
  }

  try {
    // 1. Verify user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true }
    });

    if (!user) {
      return NextResponse.json({ error: "البريد الإلكتروني غير مسجل لدينا" }, { status: 400 });
    }

    if (!user.password) {
      return NextResponse.json({ error: "هذا الحساب مسجل باستخدام جوجل، يرجى تسجيل الدخول بواسطة جوجل" }, { status: 400 });
    }

    // 2. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 3. Clear old tokens and save new one
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: code, expires }
    });

    // 4. Send email
    const emailSent = await sendVerificationEmail(email, code, "RESET");
    if (!emailSent) {
      return NextResponse.json({ error: "فشل إرسال كود استعادة الحساب. يرجى المحاولة لاحقاً." }, { status: 500 });
    }

    console.log(`[FORGOT] Password recovery code sent to: ${email}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[FORGOT] Error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء إرسال طلب استعادة الحساب",
      details: error.message 
    }, { status: 500 });
  }
}
