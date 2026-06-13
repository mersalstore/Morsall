import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  console.log("[VERIFY] Incoming verification request");

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const code = body.code?.trim();

  if (!email || !code) {
    return NextResponse.json({ error: "البريد الإلكتروني والرمز مطلوبان" }, { status: 400 });
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
      // Clean up expired token
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: email,
          token: code,
        },
      });
      return NextResponse.json({ error: "رمز التحقق منتهي الصلاحية، يرجى طلب رمز جديد" }, { status: 400 });
    }

    // 3. Activate the user
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    });

    // 4. Clean up the token
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });

    console.log(`[VERIFY] Email verified successfully for: ${email}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[VERIFY] Error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء عملية التحقق",
      details: error.message 
    }, { status: 500 });
  }
}
