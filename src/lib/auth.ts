import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/db"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { logSecurity, isIpBlocked, autoBlockIfAbusive } from "@/lib/security-log"

function extractClientIp(req: any): string | null {
  if (!req) return null;
  const headers = req.headers || {};
  const get = (key: string) => {
    const v = headers[key] || headers[key.toLowerCase()];
    if (!v) return null;
    return Array.isArray(v) ? v[0] : v;
  };
  const candidates = [
    get('x-forwarded-for'),
    get('x-real-ip'),
    get('cf-connecting-ip'),
    get('x-client-ip'),
    req.socket?.remoteAddress,
    req.connection?.remoteAddress,
  ].filter(Boolean) as string[];
  for (const raw of candidates) {
    const ip = raw.split(',')[0].trim();
    if (ip) return ip.slice(0, 45); // IPv6 max length
  }
  return null;
}

async function recordLogin(userId: string, ip: string | null) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastIp: ip || undefined, lastLogin: new Date() },
    });
  } catch (e) {
    console.error('[AUTH] Failed to record login IP:', e);
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CUSTOMER",
          isOnboarded: false,
          emailVerified: profile.email_verified ? new Date() : null,
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
        }
        const clientIp = extractClientIp(req);
        const userAgent = (req as any)?.headers?.['user-agent'] || null;

        // Block authentication attempts from IPs flagged as abusive
        if (await isIpBlocked(clientIp)) {
          await logSecurity({
            type: "UNAUTHORIZED_ACCESS",
            severity: "CRITICAL",
            ip: clientIp,
            userEmail: credentials.email,
            userAgent,
            endpoint: "/api/auth/callback/credentials",
            method: "POST",
            message: "Blocked IP attempted login",
          });
          throw new Error('تم تعطيل هذا الـ IP مؤقتاً بسبب نشاط مشبوه. حاول لاحقاً.');
        }

        console.log("[AUTH] Login attempt for:", credentials.email);

        const emailLower = credentials.email.trim().toLowerCase();
        
        try {
          console.log("[AUTH] Database check for:", emailLower);
          const user = await prisma.user.findUnique({ 
            where: { email: emailLower },
            include: { vendorProfile: true }
          });

          if (!user) {
            console.log("[AUTH] User not found:", emailLower);
            // Log the failed attempt + maybe auto-block IP after too many
            logSecurity({
              type: "LOGIN_FAIL",
              severity: "WARN",
              ip: clientIp,
              userAgent,
              userEmail: emailLower,
              endpoint: "/api/auth/callback/credentials",
              method: "POST",
              message: "Login attempted for non-existent email",
            });
            autoBlockIfAbusive(clientIp, "LOGIN_FAIL");
            throw new Error('البريد الإلكتروني غير مسجل لدينا');
          }

          if (!user.password) {
            console.log("[AUTH] User has no password (maybe Google only?):", emailLower);
            throw new Error('هذا الحساب مسجل عبر جوجل، يرجى استخدامه للدخول');
          }

          console.log("[AUTH] Verifying password/code...");
          let isPasswordCorrect = false;
          let isCodeLogin = false;

          // Check if the password provided is a 6-digit OTP code
          if (/^\d{6}$/.test(credentials.password)) {
            const tokenRecord = await prisma.verificationToken.findFirst({
              where: {
                identifier: emailLower,
                token: credentials.password,
              },
            });
            if (tokenRecord && new Date() <= tokenRecord.expires) {
              isPasswordCorrect = true;
              isCodeLogin = true;

              // Clean up the token immediately
              await prisma.verificationToken.deleteMany({
                where: { identifier: emailLower },
              });

              // Mark email as verified if not already
              if (!user.emailVerified) {
                await prisma.user.update({
                  where: { id: user.id },
                  data: { emailVerified: new Date() },
                });
              }
            }
          }

          if (!isCodeLogin) {
            isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          }

          if (!isPasswordCorrect) {
            console.log("[AUTH] Invalid credentials for:", emailLower);
            logSecurity({
              type: "LOGIN_FAIL",
              severity: "ALERT",
              ip: clientIp,
              userAgent,
              userId: user.id,
              userEmail: emailLower,
              endpoint: "/api/auth/callback/credentials",
              method: "POST",
              message: "Wrong password or code",
            });
            autoBlockIfAbusive(clientIp, "LOGIN_FAIL");
            throw new Error('كلمة المرور أو رمز التحقق غير صحيح');
          }

          if (!isCodeLogin && !user.emailVerified) {
            console.log("[AUTH] User email is not verified:", emailLower);
            throw new Error('EMAIL_NOT_VERIFIED:الرجاء تفعيل الحساب أولاً. لقد تم إرسال رمز التحقق إلى بريدك الإلكتروني.');
          }

          const SUPER_ADMIN_EMAILS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
          const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(emailLower);

          console.log("[AUTH] Login SUCCESS for:", emailLower, "Role:", isSuperAdmin ? "ADMIN" : user.role, "IP:", clientIp);

          // Record IP + login time (fire-and-forget)
          recordLogin(user.id, clientIp);

          // Log successful login for audit trail
          logSecurity({
            type: "LOGIN_SUCCESS",
            severity: "INFO",
            ip: clientIp,
            userAgent,
            userId: user.id,
            userEmail: emailLower,
            endpoint: "/api/auth/callback/credentials",
            method: "POST",
            message: `Login success — role: ${isSuperAdmin ? "ADMIN" : user.role}`,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: isSuperAdmin ? "ADMIN" : user.role,
            permissions: isSuperAdmin ? null : (user.permissions as string[] || []),
            isOnboarded: user.isOnboarded,
            isVendor: !!user.vendorProfile,
            vendorId: user.vendorProfile?.id,
            vendorStatus: user.vendorProfile?.status
          };
        } catch (err: any) {
          console.error("[AUTH] Error during authorize:", err);
          // If it's a Prisma error, make it clear
          if (err.message?.includes('Prisma') || err.code) {
             throw new Error(`خطأ في قاعدة البيانات: ${err.message}`);
          }
          throw new Error(err.message || 'فشل تسجيل الدخول، يرجى المحاولة لاحقاً');
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // Capture IP via Next.js headers (available in server context)
      let clientIp: string | null = null;
      try {
        const { headers } = await import('next/headers');
        const h = await headers();
        clientIp = (
          h.get('x-forwarded-for')?.split(',')[0].trim() ||
          h.get('x-real-ip') ||
          h.get('cf-connecting-ip') ||
          h.get('x-client-ip') ||
          null
        );
      } catch {}

      if (account?.provider === "google" && profile?.email_verified) {
        // Ensure user has emailVerified set so account linking works
        if (!user.emailVerified) {
          await prisma.user.update({
            where: { email: user.email },
            data: { emailVerified: new Date() }
          });
        }
      }

      // Record IP and lastLogin for any successful sign-in (Google + Credentials)
      if (user?.email) {
        try {
          const data: any = { lastLogin: new Date() };
          if (clientIp) data.lastIp = clientIp.slice(0, 45);
          await prisma.user.updateMany({
            where: { email: user.email.trim().toLowerCase() },
            data,
          });
          console.log('[AUTH] signIn IP recorded:', clientIp, 'for', user.email);
        } catch (e) {
          console.error('[AUTH] Failed to record signIn IP:', e);
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.isOnboarded = user.isOnboarded;
        token.isVendor = user.isVendor;
        token.vendorId = user.vendorId;
        token.vendorStatus = user.vendorStatus;
      }
      
      if (token.email) {
        try {
          const emailLower = token.email.trim().toLowerCase();
          const SUPER_ADMIN_EMAILS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
          
          if (SUPER_ADMIN_EMAILS.includes(emailLower)) {
            token.role = "ADMIN";
            token.permissions = null; // Full access
          } else {
            // Check Employee table for role and permissions sync
            const employee = await prisma.employee.findUnique({
              where: { email: emailLower },
              select: { role: true, isActive: true, permissions: true }
            });
            if (employee && employee.isActive) {
              token.role = employee.role;
              token.permissions = employee.permissions;
              // Also sync to User table
              await prisma.user.updateMany({
                where: { email: emailLower },
                data: { 
                  role: employee.role,
                  permissions: (employee.permissions as any) || null
                }
              });
            }
          }
        } catch (e) {}
      }

      if (trigger === "update" && session) {
        if (session.role) token.role = session.role;
        if (session.permissions) token.permissions = session.permissions;
        if (session.isOnboarded !== undefined) token.isOnboarded = session.isOnboarded;
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        (session.user as any).isVendor = token.isVendor;
        (session.user as any).vendorId = token.vendorId;
        (session.user as any).vendorStatus = token.vendorStatus;
        (session.user as any).isOnboarded = token.isOnboarded;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', 
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
        // Temporarily comment domain to see if it fixes Hostinger session loss
        // domain: ".morsall.com" 
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "MersalEliteSecret2026_Fallback",
  debug: true,
};
