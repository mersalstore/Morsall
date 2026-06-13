import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  console.log("[RESEND] Incoming resend verification request");

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const type = body.type || "VERIFY"; // VERIFY or RESET

  if (!email) {
    return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
  }

  try {
    // 1. Verify user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true, password: true }
    });

    if (!user) {
      return NextResponse.json({ error: "البريد الإلكتروني غير مسجل لدينا" }, { status: 400 });
    }

    if (type === "VERIFY" && user.emailVerified) {
      return NextResponse.json({ error: "البريد الإلكتروني مفعّل بالفعل، يرجى تسجيل الدخول" }, { status: 400 });
    }

    if (type === "RESET" && !user.password) {
      return NextResponse.json({ error: "هذا الحساب مسجل باستخدام جوجل ولا يمكن تعيين كلمة مرور له" }, { status: 400 });
    }

    // 2. Generate new OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 3. Clear old tokens and save new one
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: code, expires }
    });

    // 4. Send email
    const emailSent = await sendVerificationEmail(email, code, type);
    if (!emailSent) {
      return NextResponse.json({ error: "فشل إرسال كود التحقق. يرجى المحاولة لاحقاً." }, { status: 500 });
    }

    console.log(`[RESEND] New code sent to ${email} (Type: ${type})`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[RESEND] Error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء إرسال الرمز",
      details: error.message 
    }, { status: 500 });
  }
}
