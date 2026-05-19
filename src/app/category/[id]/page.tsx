"use client"

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import Image from "next/image";

export default function CategoryPage() {
  const params = useParams();
  const id = params.id as string;

  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/categories?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          setCategory(data);
          setProducts(data.products || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-[#C5A021] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const catName = category?.name || "قسم";
  const catIcon = category?.icon || "";

  return (
    <div className="min-h-screen bg-muted/20" dir="rtl">
      {/* Category Hero */}
      <section className="relative h-[380px] overflow-hidden bg-[#0F172A] shadow-2xl">
        {catIcon && (catIcon.startsWith("http") || catIcon.startsWith("/")) ? (
          <Image src={catIcon} alt={catName} fill className="object-cover opacity-25 scale-110 blur-sm" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent z-10" />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-24 h-24 bg-[#C5A021] rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl border-4 border-white/10 overflow-hidden">
            {catIcon && (catIcon.startsWith("http") || catIcon.startsWith("/")) ? (
              <Image src={catIcon} alt={catName} width={96} height={96} className="object-cover w-full h-full" />
            ) : (
              <span className="text-4xl">{catIcon || "📦"}</span>
            )}
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">{catName}</h1>
          <div className="flex items-center gap-4 text-white/50 text-sm font-black uppercase tracking-[0.3em]">
            <Link href="/" className="hover:text-[#F29124] transition-colors">الرئيسية</Link>
            <span className="text-[#C5A021]">/</span>
            <span>{catName}</span>
          </div>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16">
        {/* Count bar */}
        <div className="bg-white px-8 py-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between mb-10">
          <p className="text-[#0F172A]/50 text-sm font-black">
            عرض <span className="text-[#C5A021]">{products.length}</span> منتج في {catName}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              price={p.price}
              image={p.images?.split(",")?.[0] || "/placeholder.png"}
              vendor={p.vendor?.storeName || "متجر مرسال"}
              vendorLocation={p.vendor?.city || ""}
              vendorId={p.vendorId}
            />
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-32 text-center space-y-6">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto shadow-inner">
                <span className="material-symbols-rounded text-5xl text-[#C5A021]/20">inventory_2</span>
              </div>
              <h3 className="text-3xl font-black text-[#0F172A]">لا توجد منتجات حالياً</h3>
              <p className="text-[#0F172A]/40 max-w-sm mx-auto">نعمل على إضافة منتجات لهذا القسم قريباً</p>
              <Link href="/" className="inline-block bg-[#C5A021] text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-[#C5A021]/20">
                العودة للرئيسية
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
