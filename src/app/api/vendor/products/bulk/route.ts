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
  const vendor = user?.vendorProfile;

  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  try {
    const { products } = await req.json();
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
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
              images: p.images || "",
              sku: p.sku || "",
              shortDescription: p.shortDescription || "",
              vendorId: vendor.id,
              status: "PENDING" // All imported products require admin approval
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
