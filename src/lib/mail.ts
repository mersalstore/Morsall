import nodemailer from "nodemailer";

// Outgoing mail configuration. Credentials come from the server environment
// (.env). The sender identity defaults to support@morsall.com.
const SMTP_HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER || "support@morsall.com";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || `"مرسال Morsall" <${SMTP_USER}>`;

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!SMTP_PASS) return null; // not configured yet — caller decides what to do
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // implicit TLS/SSL on 465, STARTTLS otherwise
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

/** True when SMTP credentials are present, i.e. the app can actually send mail. */
export function isMailConfigured(): boolean {
  return !!SMTP_PASS;
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

/**
 * Sends an email from support@morsall.com (or SMTP_FROM). Never throws —
 * returns { ok } so callers can fire-and-forget without breaking the request.
 */
export async function sendMail(opts: SendMailOptions): Promise<{ ok: boolean; error?: string }> {
  const tx = getTransporter();
  if (!tx) {
    console.warn("[mail] SMTP_PASS not set — skipping email to", opts.to);
    return { ok: false, error: "SMTP not configured (missing SMTP_PASS)" };
  }
  try {
    await tx.sendMail({
      from: SMTP_FROM,
      to: Array.isArray(opts.to) ? opts.to.join(",") : opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text || (opts.html ? undefined : opts.subject),
      replyTo: opts.replyTo || SMTP_USER,
    });
    return { ok: true };
  } catch (err: any) {
    console.error("[mail] send failed:", err?.message || err);
    return { ok: false, error: err?.message || "send failed" };
  }
}

/**
 * Premium RTL HTML wrapper for branded emails.
 */
export function emailLayout(title: string, bodyHtml: string): string {
  return `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8FAFC; padding: 40px 20px; text-align: right;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        
        <!-- Header -->
        <div style="background-color: #0F172A; padding: 24px 32px; border-bottom: 3px solid #C5A021;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="direction: rtl;">
            <tr>
              <td align="right" valign="middle">
                <img src="https://morsall.com/logo.png" alt="مرسال" style="height: 48px; display: inline-block; vertical-align: middle; margin-left: 12px;" />
                <span style="font-size: 22px; font-weight: 800; color: #FFFFFF; vertical-align: middle; font-family: system-ui, -apple-system, sans-serif;">مرسال</span>
                <span style="color: #C5A021; font-size: 13px; margin-right: 6px; font-weight: 700; vertical-align: middle; font-family: system-ui, -apple-system, sans-serif;">Morsall</span>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Content Body -->
        <div style="padding: 36px 32px; color: #1E293B;">
          <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; color: #0F172A; line-height: 1.4;">${title}</h2>
          ${bodyHtml}
        </div>
        
        <!-- Footer -->
        <div style="padding: 24px 32px; background-color: #F1F5F9; border-top: 1px solid #E2E8F0; text-align: center; color: #64748B; font-size: 12px; font-weight: 600;">
          منصة مرسال لخدمات البيع والشحن المتكاملة<br />
          <a href="mailto:support@morsall.com" style="color: #C5A021; text-decoration: none; font-weight: 700;">support@morsall.com</a>
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Sends a verification or password reset OTP email using the premium HTML template.
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  type: "VERIFY" | "RESET"
): Promise<boolean> {
  const isReset = type === "RESET";
  const title = isReset ? "استعادة كلمة المرور للحساب" : "تأكيد الحساب وتفعيله";
  
  const bodyHtml = `
    <div style="line-height: 1.6; font-size: 15px; color: #334155;">
      <p style="margin: 0 0 16px 0;">مرحباً بك،</p>
      <p style="margin: 0 0 24px 0;">
        ${isReset 
          ? "لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في مرسال. يرجى استخدام رمز التحقق التالي لإكمال العملية:" 
          : "شكراً لتسجيلك في منصة مرسال. يرجى استخدام رمز التحقق التالي لتفعيل حسابك والبدء في استخدامه:"}
      </p>
      
      <!-- OTP Box -->
      <div style="background-color: #F8FAFC; border: 2px dashed #C5A021; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 8px 0; font-family: system-ui, -apple-system, sans-serif;">رمز التحقق (صالح لمدة 15 دقيقة)</p>
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; color: #0f172a; letter-spacing: 0.15em; display: inline-block; padding-left: 0.15em;">${code}</span>
      </div>
      
      <p style="margin: 24px 0 0 0; font-size: 13px; color: #64748B;">
        إذا لم تكن قد طلبت هذا الرمز، فيرجى تجاهل هذا البريد الإلكتروني بأمان.
      </p>
    </div>
  `;

  const html = emailLayout(title, bodyHtml);
  
  const res = await sendMail({
    to: email,
    subject: title,
    html,
  });
  
  return res.ok;
}
