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
            userId: true,
            slug: true
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

    const settings = await prisma.settings.findUnique({ where: { id: "global" } });
    const rate = settings?.exchangeRate || 1.0;

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Map to the interface expected by the UI (similar to Mock Product)
    const p = product as any;
    const mappedProduct = {
      id: p.id,
      title: p.title,
      price: p.price * rate,
      description: p.description,
      stock: p.stock,
      image: p.images ? p.images.split(",")[0] : "",
      images: p.images ? p.images.split(",") : [],
      category: p.category?.name || "غير مصنف",
      categoryId: p.categoryId || "others",
      vendor: p.vendor.storeName,
      vendorSlug: p.vendor.slug || null,
      vendorLocation: p.vendor.location || "السودان",
      vendorId: p.vendorId,
      rating: 4.5, // Default for now
      reviews: 12, // Default for now
      specs: (() => {
        if (!p.specifications) return {};
        try {
          const parsed = typeof p.specifications === 'string' ? JSON.parse(p.specifications) : p.specifications;
          if (Array.isArray(parsed)) {
            const obj: Record<string, string> = {};
            parsed.forEach((s: any) => {
              if (s && s.key) {
                if (Array.isArray(s.values)) {
                  obj[s.key] = s.values.filter(Boolean).join(", ");
                } else if (s.value !== undefined) {
                  obj[s.key] = String(s.value);
                }
              }
            });
            return obj;
          } else if (typeof parsed === 'object') {
            return parsed;
          }
          return {};
        } catch (e) {
          return {};
        }
      })(),
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
        price: v.price ? v.price * rate : null,
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
