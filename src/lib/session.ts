import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  
  const HARDCODED_ADMINS = ["hazem@mersal.com", "Blackhatsd.sd@gmail.com"];
  
  if (session?.user?.email && HARDCODED_ADMINS.includes(session.user.email)) {
    return session;
  }

  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }
  
  return session;
}

export function adminOnlyResponse() {
  return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
}
