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

/** Small RTL HTML wrapper for branded emails. */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<div dir="rtl" style="font-family:'Segoe UI',Tahoma,sans-serif;background:#f3f4f6;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #eee">
      <div style="background:#0F172A;padding:20px 24px;color:#fff">
        <span style="font-size:20px;font-weight:800">مرسال</span>
        <span style="color:#C5A021;font-size:12px;margin-inline-start:8px">Morsall</span>
      </div>
      <div style="padding:24px;color:#0F172A">
        <h2 style="margin:0 0 12px;font-size:18px">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding:16px 24px;background:#fafafa;color:#9ca3af;font-size:11px">
        مرسال • support@morsall.com
      </div>
    </div>
  </div>`;
}
