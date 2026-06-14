"use client"

import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import ProductCard from "../../../components/ProductCard";
import Link from "next/link";
import Image from "next/image";

type SortKey = "default" | "price_asc" | "price_desc" | "new";

export default function CategoryPage() {
  const params = useParams();
  const id = params.id as string;

  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [search, setSearch] = useState("");

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

  const filtered = useMemo(() => {
    let list = [...products];
    // text search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    // price filter
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) list = list.filter(p => (p.discountPrice ?? p.price) >= min);
    if (!isNaN(max)) list = list.filter(p => (p.discountPrice ?? p.price) <= max);
    // sort
    if (sort === "price_asc") list.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    else if (sort === "price_desc") list.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    else if (sort === "new") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [products, sort, minPrice, maxPrice, search]);

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

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-10">

        {/* ── Filter & Sort Bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center gap-3">
          {/* Search inside category */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 gap-2 flex-1 min-w-[160px]">
            <span className="material-symbols-rounded text-gray-400 text-base">search</span>
            <input
              type="text"
              placeholder="بحث داخل القسم..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm font-bold text-[#0F172A] w-full placeholder:text-gray-400"
            />
          </div>

          {/* Sort buttons */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-1 py-1">
            {([
              { key: "default", label: "الأكثر مبيعاً" },
              { key: "new", label: "الأحدث" },
              { key: "price_asc", label: "السعر ↑" },
              { key: "price_desc", label: "السعر ↓" },
            ] as { key: SortKey; label: string }[]).map(s => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${sort === s.key ? "bg-[#C5A021] text-white" : "text-gray-500 hover:bg-gray-100"}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Price range */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="أدنى سعر"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="w-24 border border-gray-200 rounded-xl px-2 py-2 text-xs font-bold outline-none focus:border-[#C5A021] text-right"
            />
            <span className="text-gray-400 font-black">—</span>
            <input
              type="number"
              placeholder="أعلى سعر"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="w-24 border border-gray-200 rounded-xl px-2 py-2 text-xs font-bold outline-none focus:border-[#C5A021] text-right"
            />
            <span className="text-[10px] font-bold text-gray-400">ج.س</span>
          </div>

          {/* Reset filters */}
          {(search || minPrice || maxPrice || sort !== "default") && (
            <button
              onClick={() => { setSearch(""); setMinPrice(""); setMaxPrice(""); setSort("default"); }}
              className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-rounded text-base">close</span>
              مسح الفلاتر
            </button>
          )}

          {/* Product count */}
          <div className="mr-auto text-xs font-black text-gray-400">
            عرض <span className="text-[#C5A021]">{filtered.length}</span> من {products.length} منتج
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              price={p.price}
              discountPrice={p.discountPrice}
              image={p.images?.split(",")?.[0] || "/placeholder.png"}
              vendor={p.vendor?.storeName || "متجر مرسال"}
              vendorLocation={p.vendor?.city || ""}
              vendorId={p.vendorId}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-32 text-center space-y-6">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto shadow-inner">
                <span className="material-symbols-rounded text-5xl text-[#C5A021]/20">inventory_2</span>
              </div>
              <h3 className="text-3xl font-black text-[#0F172A]">لا توجد منتجات حالياً</h3>
              <p className="text-[#0F172A]/40 max-w-sm mx-auto">جرب تغيير الفلاتر أو العودة للتصفح الكامل</p>
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
