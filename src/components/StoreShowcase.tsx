import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/db";

export default async function StoreShowcase() {
  const vendors = await prisma.vendor.findMany({
    where: { status: 'APPROVED' },
    take: 5,
    include: {
      _count: {
        select: { products: true }
      },
      reviews: true
    }
  });

  if (vendors.length === 0) return null;

  return (
    <section className="px-6 md:px-12 py-24 bg-muted/30">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 text-right underline-offset-8">
           <div className="space-y-4">
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-[#F29124]">
                 <span className="w-10 h-0.5 bg-[#C5A021]" /> ELITE VENDORS
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-[#0F172A] tracking-tighter font-heading">
                 تسوق من <br /> <span className="text-[#C5A021]">أفضل المتاجر الموثوقة</span>
              </h2>
           </div>
           <Link href="/stores" className="bg-white border-4 border-white text-[#0F172A] px-14 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-[#0F172A] hover:text-white transition-all duration-700">
              استكشف كافة المتاجر
           </Link>
        </div>

        <div className="relative group/slider">
          <div className="flex gap-8 overflow-x-auto scrollbar-none snap-x snap-mandatory px-4 pb-10">
            {vendors.map((vendor) => {
              const reviewsCount = vendor.reviews?.length || 0;
              const avgRating = reviewsCount > 0 
                ? (vendor.reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewsCount).toFixed(1)
                : "5.0";

              return (
              <Link 
                key={vendor.id}
                href={`/store/${vendor.slug || vendor.id}`}
                className="group bg-white rounded-[3rem] p-8 border-4 border-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden cursor-pointer block min-w-[300px] snap-center"
              >
                 <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-muted shadow-inner group-hover:scale-110 transition-all duration-500 ring-2 ring-white">
                       <Image src={vendor.storeLogo || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=300"} alt={vendor.storeName} fill className="object-cover" />
                    </div>
                    
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-[#0F172A] tracking-tight group-hover:text-[#C5A021] transition-colors">{vendor.storeName}</h3>
                       <p className="text-[9px] font-black text-[#0F172A]/20 uppercase tracking-[0.2em]">{vendor.location || "متجر معتمد"}</p>
                    </div>

                    <div className="flex items-center gap-2 py-2 px-4 bg-muted/50 rounded-xl">
                       <span className="material-symbols-rounded text-[#F29124] text-base fill-1">star</span>
                       <span className="text-xs font-black text-[#0F172A]">{avgRating}</span>
                    </div>
                 </div>
              </Link>
            )})}
          </div>
        </div>
      </div>
    </section>
  );
}
