"use client"

import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";

const SECTIONS = [
  { id: "new",    label: "وصل حديثاً", icon: "✨" },
  { id: "best",   label: "الأكثر مبيعاً", icon: "⭐" },
];

function ProductStrip({ title, products, icon }: { title: string, products: any[], icon: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "l" | "r") => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const move = clientWidth * 0.8;
    scrollRef.current.scrollTo({
      left: dir === "l" ? scrollLeft - move : scrollLeft + move,
      behavior: "smooth"
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8 last:mb-0 overflow-hidden">
      {/* Strip Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h2 className="font-black text-lg text-[#0F172A]">{title}</h2>
        </div>
        <Link href="/shop" className="text-xs font-bold text-[#C5A021] hover:underline flex items-center gap-1 group">
          عرض الكل
          <span className="material-symbols-rounded text-base group-hover:-translate-x-1 transition-transform">chevron_left</span>
        </Link>
      </div>

      {/* Slider Container */}
      <div className="relative group/slider px-4 pb-6">
        {/* Nav Buttons (Desktop) */}
        <button 
          onClick={() => scroll("r")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity translate-x-1/2 hidden md:flex"
        >
          <span className="material-symbols-rounded">chevron_right</span>
        </button>
        <button 
          onClick={() => scroll("l")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity -translate-x-1/2 hidden md:flex"
        >
          <span className="material-symbols-rounded">chevron_left</span>
        </button>

        {/* Scrollable Area */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4"
        >
          {products.map(p => (
            <div key={p.id} className="min-w-[200px] sm:min-w-[240px] md:min-w-[280px] snap-center">
              <ProductCard {...p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductTabHub({ filter }: { filter?: "new" | "best" }) {
  const [products, setProducts] = useState<any[]>([]);
  const [bestProducts, setBestProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products?sort=new")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(console.error);
      
    fetch("/api/products?sort=best")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBestProducts(data);
      })
      .catch(console.error);
  }, []);

  const tabProducts: Record<string, any[]> = {
    new: products.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      vendor: p.vendor?.storeName,
      vendorLocation: p.vendor?.location || "السودان",
      image: (p.images && p.images.trim().length > 0) 
        ? p.images.split(",")[0].trim() 
        : "https://placehold.co/800x1000/F3F4F6/1089A4?text=No+Image",
      badge: "جديد",
    })),
    best: bestProducts.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      vendor: p.vendor?.storeName,
      vendorLocation: p.vendor?.location || "السودان",
      image: (p.images && p.images.trim().length > 0) 
        ? p.images.split(",")[0].trim() 
        : "https://placehold.co/800x1000/F3F4F6/1089A4?text=No+Image",
      badge: "الأكثر مبيعاً",
    }))
  };

  return (
    <section className="bg-[#F3F4F6] py-10" dir="rtl">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">

        {/* ── Product Sections (Stacked Strips) ── */}
        <div className="flex flex-col">
          {SECTIONS.filter(sec => !filter || sec.id === filter).map(sec => tabProducts[sec.id]?.length > 0 && (
            <ProductStrip 
              key={sec.id}
              title={sec.label}
              products={tabProducts[sec.id]}
              icon={sec.icon}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
