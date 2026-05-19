"use client"

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const vendors = [
  { 
    id: "v1", 
    name: "تكنو زون للنظم الحديثة", 
    category: "إلكترونيات", 
    rating: 4.9, 
    reviews: 1240, 
    products: 156, 
    since: "2021",
    logo: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=200", 
    banner: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600",
    verified: true,
    badge: "بائع بلاتيني"
  },
  { 
    id: "v2", 
    name: "عالم الموضة والأزياء", 
    category: "ملابس", 
    rating: 4.7, 
    reviews: 850, 
    products: 320, 
    since: "2022",
    logo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200", 
    banner: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=600",
    verified: true,
    badge: "توصيل سريع"
  },
  { 
    id: "v3", 
    name: "مبتكرون للديكور والمنزل", 
    category: "منزل", 
    rating: 4.8, 
    reviews: 620, 
    products: 89, 
    since: "2023",
    logo: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=200", 
    banner: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600",
    verified: false,
    badge: "ديكور عصري"
  },
  { 
    id: "v4", 
    name: "نخبة الساعات السودانية", 
    category: "إكسسوارات", 
    rating: 5.0, 
    reviews: 310, 
    products: 45, 
    since: "2020",
    logo: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200", 
    banner: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
    verified: true,
    badge: "الأكثر مبيعاً"
  }
];

export default function TopVendorsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* 1. Elite Hero Hub */}
      <section className="bg-[#0F172A] pt-44 pb-24 px-12 relative overflow-hidden">
         <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
            <div className="space-y-8 text-right">
               <div className="flex items-center justify-end gap-3 text-[10px] font-black uppercase tracking-[0.6em] text-[#C5A021]">
                  ELITE PARTNER NETWORK <span className="w-12 h-1 bg-[#F29124] rounded-full" />
               </div>
               <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.9] font-heading">
                  اكتشف أقوى <br /> <span className="text-[#C5A021]">المـواردين</span> فـي الـسـودان
               </h1>
               <p className="text-white/40 text-xl font-medium max-w-xl leading-relaxed">
                  نخبة من أفضل المتاجر والماركات العالمية والمحلية الموثقة لدينا، نمنحك تجربة تسوق آمنة وموثوقة بنسبة 100%.
               </p>
            </div>
            
            <div className="w-full md:w-[600px] bg-white/5 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/10 shadow-3xl">
               <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">ابحث عن متجر محدد</h3>
               <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="اسم المتجر أو التخصص..." 
                    className="w-full bg-white px-12 py-7 rounded-[2.5rem] outline-none text-[#0F172A] font-black text-sm shadow-2xl focus:ring-4 ring-[#C5A021]/30 transition-all placeholder:text-[#0F172A]/20"
                  />
                  <span className="material-symbols-rounded absolute left-8 top-1/2 -translate-y-1/2 text-3xl text-[#C5A021] group-focus-within:rotate-[-45deg] transition-transform">search</span>
               </div>
               <div className="mt-10 flex flex-wrap gap-3">
                  {["إلكترونيات", "أزياء", "أثاث", "ساعات"].map((tag) => (
                    <span key={tag} className="px-6 py-2 bg-white/10 text-white/60 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#F29124] hover:text-white cursor-pointer transition-all">{tag}</span>
                  ))}
               </div>
            </div>
         </div>
         {/* Background Visuals */}
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#C5A021]/10 blur-[200px] rounded-full animate-pulse" />
      </section>

      {/* 2. Main Vendor Grid */}
      <main className="max-w-[1920px] mx-auto px-6 md:px-12 py-24">
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12">
            {vendors.map((vendor, i) => (
              <VendorCard key={vendor.id} vendor={vendor} index={i} />
            ))}
         </div>
         
         {/* Load More Button */}
         <div className="flex justify-center mt-24">
            <button className="flex items-center gap-6 bg-white border-4 border-muted/50 px-16 py-7 rounded-[3rem] font-black text-xs uppercase tracking-[0.4em] text-[#0F172A] shadow-2xl hover:bg-[#C5A021] hover:text-white hover:border-[#C5A021] transition-all group active:scale-95">
               تحميل المزيد من المتاجر <span className="material-symbols-rounded group-hover:rotate-45 transition-transform">refresh</span>
            </button>
         </div>
      </main>
    </div>
  );
}

function VendorCard({ vendor, index }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      className="group bg-white rounded-[3.5rem] overflow-hidden shadow-xl border border-border/5 hover:shadow-[0_50px_100px_rgba(0,0,0,0.08)] transition-all duration-700 hover:-translate-y-4"
    >
       {/* Store Banner */}
       <div className="relative h-44 overflow-hidden">
          <Image src={vendor.banner} alt="Banner" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-6 right-6">
             {vendor.verified && (
               <span className="bg-green-500/20 backdrop-blur-xl border border-green-500/30 text-green-500 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <span className="material-symbols-rounded text-base">verified</span> موثق
               </span>
             )}
          </div>
       </div>

       {/* Store Info */}
       <div className="relative px-10 pb-12 pt-16 flex flex-col items-center">
          {/* Logo Overlay */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-3xl bg-white p-3 shadow-2xl border-4 border-white overflow-hidden group-hover:scale-110 transition-transform duration-500">
             <Image src={vendor.logo} alt="Logo" fill className="object-cover rounded-2xl" />
          </div>

          <div className="text-center space-y-4 mb-10 w-full">
             <div className="flex items-center justify-center gap-2 text-[#F29124] text-[9px] font-black uppercase tracking-[0.4em]">
                {vendor.badge}
             </div>
             <h2 className="text-3xl font-black text-[#0F172A] tracking-tight group-hover:text-[#C5A021] transition-colors font-heading">{vendor.name}</h2>
             <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5 bg-[#F29124]/5 px-3 py-1.5 rounded-xl">
                   <span className="material-symbols-rounded text-base text-[#F29124]">star</span>
                   <span className="text-sm font-black text-[#F29124]">{vendor.rating}</span>
                </div>
                <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">({vendor.reviews} مراجعة)</span>
             </div>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 w-full gap-4 mb-10">
             <div className="bg-muted/30 p-6 rounded-3xl text-center space-y-1">
                <p className="text-[#0F172A] font-black text-xl leading-none">{vendor.products}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#0F172A]/30">منتج معروض</p>
             </div>
             <div className="bg-muted/30 p-6 rounded-3xl text-center space-y-1">
                <p className="text-[#0F172A] font-black text-xl leading-none">{vendor.since}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#0F172A]/30">عضو منذ</p>
             </div>
          </div>

          <Link 
            href={`/shop?vendor=${vendor.id}`}
            className="w-full bg-[#C5A021] text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-[#0F172A] transition-all shadow-xl shadow-[#C5A021]/20 group/btn"
          >
             زيارة المتجر <span className="material-symbols-rounded group-hover/btn:translate-x-[-10px] transition-transform">trending_flat</span>
          </Link>
       </div>
    </motion.div>
  );
}
