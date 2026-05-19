import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { vendorProfile: true }
  });

  try {
    const { products, adminOverrideVendorId } = await req.json();
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    let targetVendorId = user?.vendorProfile?.id;
    let statusToSet = "PENDING"; // vendor imports are pending

    if (user?.role === "ADMIN" || ["blackhatsd.sd@gmail.com", "system@mersal.com", "hazem@mersal.com", "zomatube2012@gmail.com"].includes(session.user.email.toLowerCase())) {
       if (adminOverrideVendorId) {
         targetVendorId = adminOverrideVendorId;
       }
       statusToSet = "APPROVED"; // admin imports are pre-approved
    }

    if (!targetVendorId) {
      return NextResponse.json({ error: "Vendor not found. If you are an Admin, please provide a Merchant ID." }, { status: 404 });
    }

    const created = await Promise.all(
      products.map(async (p) => {
        try {
          return await prisma.product.create({
            data: {
              title: p.title,
              description: p.description || p.shortDescription || p.title || "",
              price: parseFloat(p.price),
              stock: parseInt(p.stock),
              images: p.images || "", // optional images
              sku: p.sku || null, // manual sku support
              shortDescription: p.shortDescription || "",
              vendorId: targetVendorId,
              status: statusToSet 
            }
          });
        } catch (err) {
          console.error("Failed to create product:", err);
          return null;
        }
      })
    );

    const successfulCount = created.filter(c => c !== null).length;
    return NextResponse.json({ success: true, count: successfulCount });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
