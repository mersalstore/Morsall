import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  
  const SUPER_ADMINS = ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"];
  
  const userEmail = session?.user?.email?.trim().toLowerCase();
  if (userEmail && SUPER_ADMINS.includes(userEmail)) {
    if (session && session.user) (session.user as any).role = "ADMIN";
    return session;
  }

  const role = (session?.user as any)?.role;
  const permissions = (session?.user as any)?.permissions;
  const hasCustomPermissions = Array.isArray(permissions) && permissions.length > 0;
  const ALLOWED_ROLES = ["ADMIN", "PACKING", "SHIPPING", "CUSTOMER_SERVICE", "INVENTORY", "DRIVER"];

  // Allow staff roles, OR any account that has explicit custom permissions granted
  if (!session || (!ALLOWED_ROLES.includes(role) && !hasCustomPermissions)) {
    return null;
  }
  
  return session;
}

export function adminOnlyResponse() {
  return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
}
