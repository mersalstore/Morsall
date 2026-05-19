"use client"

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const allCategories = [
  { id: "electronics", name: "إلكترونيات والموبايل", items: "1,240+ منتج", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800", icon: "smartphone" },
  { id: "fashion", name: "الأزياء والملابس", items: "2,500+ منتج", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800", icon: "apparel" },
  { id: "home", name: "المنزل والمطبخ", items: "3,100+ منتج", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800", icon: "home" },
  { id: "beauty", name: "الجمال والعناية", items: "850+ منتج", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800", icon: "content_cut" },
  { id: "toys", name: "ألعاب الأطفال", items: "1,100+ منتج", image: "https://images.unsplash.com/photo-1532330393533-443990a51d10?auto=format&fit=crop&q=80&w=800", icon: "toys" },
  { id: "sports", name: "الرياضة واللياقة", items: "600+ منتج", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800", icon: "fitness_center" },
  { id: "books", name: "الكتب والمكتبة", items: "4,000+ منتج", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800", icon: "menu_book" },
  { id: "automotive", name: "إكسسوارات السيارات", items: "450+ منتج", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800", icon: "directions_car" }
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-44">
      {/* 1. Categories Hero */}
      <section className="bg-white pt-44 pb-20 px-12 border-b border-border/50 relative overflow-hidden">
         <div className="max-w-[1920px] mx-auto flex flex-col items-center text-center space-y-8 relative z-10">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.6em] text-[#C5A021]">
               <span className="w-12 h-1 bg-[#F29124] rounded-full" /> BROWSE BY DEPARTMENT
            </div>
            <h1 className="text-7xl md:text-9xl font-black text-[#0F172A] tracking-tighter leading-none font-heading">
               اخـتر <span className="text-[#C5A021]">تـصنيفك</span> المـفضل
            </h1>
            <p className="text-[#0F172A]/40 text-2xl font-medium max-w-2xl leading-relaxed">
               نحن نقوم بتنظيم آلاف المنتجات العالمية والمحلية في أقسام دقيقة لتسهيل رحلة تسوقك في مرسال.
            </p>
         </div>
         {/* Background washer */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C5A021]/5 blur-[200px] rounded-full pointer-events-none" />
      </section>

      {/* 2. Full Categories Grid */}
      <main className="max-w-[1920px] mx-auto px-6 md:px-12 py-32">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {allCategories.map((cat, i) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
              >
                <Link href={`/category/${cat.id}`} className="group relative block aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-white shadow-xl hover:shadow-4xl transition-all duration-700 hover:-translate-y-4">
                   <Image src={cat.image} alt={cat.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-black/20 to-transparent" />
                   
                   <div className="absolute inset-0 p-12 flex flex-col justify-end text-right space-y-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white mb-6 group-hover:bg-[#C5A021] group-hover:rotate-[-10deg] transition-all">
                         <span className="material-symbols-rounded text-3xl">{cat.icon}</span>
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-tight leading-none font-heading">{cat.name}</h3>
                      <div className="flex items-center justify-end gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                         {cat.items} <span className="w-6 h-0.5 bg-[#F29124] rounded-full" />
                      </div>
                      <button className="text-white text-[10px] font-black uppercase tracking-[0.4em] pt-6 flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">تصفح الآن <span className="material-symbols-rounded">trending_flat</span></button>
                   </div>
                </Link>
              </motion.div>
            ))}
         </div>
      </main>
    </div>
  );
}
