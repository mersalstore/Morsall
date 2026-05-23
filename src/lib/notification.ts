import { prisma } from "./db";

interface CreateNotificationParams {
  userId?: string;
  role?: string;
  title: string;
  message: string;
  type: "order" | "withdrawal" | "payment" | "vendor" | "system" | "transfer";
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        role: params.role,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link,
      },
    });
  } catch (error) {
    console.error("Create Notification Error:", error);
    return null;
  }
}

export async function notifyAdmins(title: string, message: string, type: "order" | "withdrawal" | "payment" | "vendor" | "system" | "transfer", link?: string) {
  return createNotification({ role: "ADMIN", title, message, type, link });
}

export async function notifyVendor(vendorId: string, title: string, message: string, type: "order" | "withdrawal" | "payment" | "vendor" | "system" | "transfer", link?: string) {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { userId: true } });
  if (!vendor) return null;
  return createNotification({ userId: vendor.userId, title, message, type, link });
}

export async function notifyVendorByUserId(userId: string, title: string, message: string, type: "order" | "withdrawal" | "payment" | "vendor" | "system" | "transfer", link?: string) {
  return createNotification({ userId, title, message, type, link });
}
