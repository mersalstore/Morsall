import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";

export default async function StoreShowcase() {
  const vendors = await prisma.vendor.findMany({
    where: { status: 'APPROVED' },
    take: 8,
    include: {
      _count: {
        select: { products: true }
      },
      reviews: true
    }
  });

  if (vendors.length === 0) return null;

  return (
    <section className="px-6 md:px-12 py-20 bg-muted/30">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 text-right">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#F29124]">
              <span className="w-8 h-0.5 bg-[#C5A021]" /> ELITE VENDORS
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-tight font-heading">
              تسوق من <span className="text-[#C5A021]">أفضل المتاجر الموثوقة</span>
            </h2>
            <p className="text-sm text-gray-400 font-bold">متاجر معتمدة ومقيّمة من آلاف العملاء</p>
          </div>
          <Link
            href="/stores"
            className="shrink-0 inline-flex items-center gap-2 bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-[#C5A021] transition-all duration-300 shadow-lg"
          >
            استكشف كافة المتاجر
            <span className="material-symbols-rounded text-base">arrow_back</span>
          </Link>
        </div>

        {/* Store cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {vendors.map((vendor) => {
            const reviewsCount = vendor.reviews?.length || 0;
            const avgRating = reviewsCount > 0
              ? (vendor.reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewsCount).toFixed(1)
              : "5.0";

            return (
              <Link
                key={vendor.id}
                href={`/store/${vendor.slug || vendor.id}`}
                className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              >
                {/* Logo or branded initial (no random stock photos) */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-1 ring-gray-100 group-hover:scale-105 transition-transform duration-300 mb-4 flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#C5A021]">
                  {vendor.storeLogo ? (
                    <Image src={vendor.storeLogo} alt={vendor.storeName} fill className="object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-white">{vendor.storeName?.trim()?.[0] || "م"}</span>
                  )}
                </div>

                <h3 className="text-base font-black text-[#0F172A] truncate max-w-full group-hover:text-[#C5A021] transition-colors">
                  {vendor.storeName}
                </h3>

                <p className="text-[11px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                  <span className="material-symbols-rounded text-[13px] text-[#F29124]">location_on</span>
                  {vendor.location || "متجر معتمد"}
                </p>

                {/* Stats: rating + product count */}
                <div className="flex items-center gap-2 mt-4 w-full">
                  <div className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-amber-50 rounded-lg">
                    <span className="material-symbols-rounded text-[#F29124] text-sm fill-1">star</span>
                    <span className="text-xs font-black text-[#0F172A]">{avgRating}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-50 rounded-lg">
                    <span className="material-symbols-rounded text-[#0F172A] text-sm">inventory_2</span>
                    <span className="text-xs font-black text-[#0F172A]">{vendor._count?.products ?? 0}</span>
                  </div>
                </div>

                <span className="mt-4 text-[11px] font-black text-[#C5A021] opacity-0 group-hover:opacity-100 transition-opacity">
                  زيارة المتجر ←
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
