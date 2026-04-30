import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: {
          select: { 
            storeName: true, 
            location: true,
            userId: true
          }
        },
        category: {
          select: { 
            id: true, 
            name: true 
          }
        },
        variations: true,
        attributes: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Map to the interface expected by the UI (similar to Mock Product)
    const p = product as any;
    const mappedProduct = {
      id: p.id,
      title: p.title,
      price: p.price,
      description: p.description,
      stock: p.stock,
      image: p.images ? p.images.split(",")[0] : "",
      images: p.images ? p.images.split(",") : [],
      category: p.category?.name || "غير مصنف",
      categoryId: p.categoryId || "others",
      vendor: p.vendor.storeName,
      vendorLocation: p.vendor.location || "السودان",
      vendorId: p.vendorId,
      rating: 4.5, // Default for now
      reviews: 12, // Default for now
      specs: {}, // Can be expanded if stored in JSON
      colors: p.colors ? p.colors.split(",").map((c: any) => ({ name: c, hex: "#ccc" })) : [],
      sizes: p.sizes ? p.sizes.split(",") : [],
      brand: p.brand || undefined,
      range: p.range || undefined,
      sku: p.sku || undefined,
      shortDescription: p.shortDescription || undefined,
      weight: p.weight || undefined,
      length: p.length || undefined,
      width: p.width || undefined,
      height: p.height || undefined,
      ram: p.ram || undefined,
      storage: p.storage || undefined,
      screenSize: p.screenSize || undefined,
      bundleData: (() => {
        try {
          return (p.bundleData && p.bundleData !== "null" && p.bundleData.trim() !== "") ? JSON.parse(p.bundleData) : undefined;
        } catch (e) {
          console.error("Invalid bundleData JSON:", p.bundleData);
          return undefined;
        }
      })(),
      type: p.type || "SIMPLE",
      variations: p.variations?.map((v: any) => ({
        ...v,
        combination: JSON.parse(v.combination)
      })) || [],
      productAttributes: p.attributes || []
    };

    return NextResponse.json(mappedProduct);
  } catch (error) {
    console.error("Fetch Product Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
