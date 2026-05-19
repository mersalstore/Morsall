import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import ShopFilters from "@/components/ShopFilters";
import ProductCard from "@/components/ProductCard";
import ShopClientControls from "@/components/ShopClientControls";

export const dynamic = "force-dynamic";

export default async function ShopPage(props: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const sp = await props.searchParams;
  const query    = sp.q;
  const category = sp.category;
  const sort     = sp.sort;

  const orderBy: any = sort === "price_asc"
    ? { price: "asc" }
    : sort === "price_desc"
    ? { price: "desc" }
    : sort === "new"
    ? { createdAt: "desc" }
    : { purchaseCount: "desc" };

  const dbProducts = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      vendor: {
        status: "APPROVED"
      },
      ...(query && {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      }),
    },
    orderBy,
    include: { vendor: { select: { storeName: true, location: true } } },
    take: 48,
  });

  const products = dbProducts.map((p: any) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    vendor: p.vendor.storeName,
    vendorLocation: p.vendor.location ?? "",
    image: p.images?.split(",")[0] || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800",
    badge: p.purchaseCount > 5 ? "الأكثر مبيعاً" : undefined,
    stock: p.stock,
  }));

  return (
    <div className="min-h-screen bg-[#F3F4F6]" dir="rtl">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-3">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <nav className="text-xs text-gray-400 font-bold flex items-center gap-2">
            <Link href="/" className="hover:text-[#C5A021]">الرئيسية</Link>
            <span>/</span>
            <span className="text-[#0F172A]">{query ? `نتائج: "${query}"` : "كل المنتجات"}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Sidebar */}
        <aside className="lg:col-span-2 hidden lg:block">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-28">
            <ShopFilters />
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-10 space-y-3">

          {/* Toolbar & Mobile Filters */}
          <ShopClientControls 
            resultCount={products.length} 
            query={query || ""} 
            initialSort={sort || ""}
          />

          {/* Delivery notice */}
          <div className="bg-[#FFF8F0] border border-[#F29124]/30 rounded-lg p-3 flex items-center gap-2 text-sm text-[#0F172A] font-bold">
            <span className="material-symbols-rounded text-[#F29124]">local_shipping</span>
            توصيل مجاني للطلبات فوق 50,000 ج.س داخل الخرطوم 🚀
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {products.map((p: any) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
              <span className="material-symbols-rounded text-6xl text-gray-200 block mb-4">search_off</span>
              <h2 className="text-xl font-black text-[#0F172A] mb-2">لم نجد نتائج</h2>
              <p className="text-gray-400 text-sm mb-6">جرب كلمات بحث مختلفة</p>
              <Link href="/shop" className="inline-flex items-center gap-2 bg-[#F29124] text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-[#D97B10] transition-colors">
                عرض كل المنتجات
              </Link>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
