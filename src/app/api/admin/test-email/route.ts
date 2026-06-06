import { NextResponse } from "next/server";
import { getAdminSession, adminOnlyResponse } from "@/lib/session";
import { sendMail, isMailConfigured, emailLayout } from "@/lib/mail";

// POST — إرسال بريد اختباري للتأكد أن الإرسال من support@morsall.com يعمل
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return adminOnlyResponse();

  if (!isMailConfigured()) {
    return NextResponse.json(
      { error: "لم يتم ضبط SMTP_PASS في إعدادات السيرفر (.env) بعد. أضف كلمة مرور support@morsall.com ثم أعد التشغيل." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const to = body.to || (session.user as any)?.email;
  if (!to) {
    return NextResponse.json({ error: "لا يوجد بريد للإرسال إليه" }, { status: 400 });
  }

  const result = await sendMail({
    to,
    subject: "اختبار إرسال البريد من مرسال ✅",
    html: emailLayout(
      "تم الإرسال بنجاح ✅",
      `<p style="margin:0;line-height:1.8">هذه رسالة اختبارية من نظام مرسال، أُرسلت من العنوان <b>support@morsall.com</b>. إذا وصلتك هذه الرسالة فإعدادات البريد تعمل بشكل صحيح.</p>`
    ),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error || "فشل الإرسال" }, { status: 500 });
  }
  return NextResponse.json({ success: true, to });
}
