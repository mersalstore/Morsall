import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/db"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
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
            throw new Error('البريد الإلكتروني غير مسجل لدينا');
          }

          if (!user.password) {
            console.log("[AUTH] User has no password (maybe Google only?):", emailLower);
            throw new Error('هذا الحساب مسجل عبر جوجل، يرجى استخدامه للدخول');
          }
          
          console.log("[AUTH] Verifying password...");
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordCorrect) {
            console.log("[AUTH] Invalid password for:", emailLower);
            throw new Error('كلمة المرور غير صحيحة');
          }

          const SUPER_ADMIN_EMAILS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
          const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(emailLower);

          console.log("[AUTH] Login SUCCESS for:", emailLower, "Role:", isSuperAdmin ? "ADMIN" : user.role);

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
      if (account?.provider === "google" && profile?.email_verified) {
        // Ensure user has emailVerified set so account linking works
        if (!user.emailVerified) {
          await prisma.user.update({
            where: { email: user.email },
            data: { emailVerified: new Date() }
          });
        }
        return true;
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
