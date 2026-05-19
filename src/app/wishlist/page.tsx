"use client"

import { useWishlist } from "@/lib/WishlistContext";
import { getProductById } from "@/lib/mockData/products";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function WishlistPage() {
  const { favorites } = useWishlist();
  const products = favorites.map(id => getProductById(id));

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen pt-44 pb-20 px-6 flex flex-col items-center justify-center text-center space-y-8">
         <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
            <span className="material-symbols-rounded text-6xl text-gray-300">favorite</span>
         </div>
         <div className="space-y-4">
            <h1 className="text-3xl font-black text-[#0F172A]">المفضلة فارغة حالياً 💖</h1>
            <p className="text-gray-400 font-bold max-w-sm mx-auto">لم تضف أي منتجات لمفضلتك بعد. استكشف آلاف المنتجات العالمية وأضف ما يعجبك!</p>
         </div>
         <Link href="/shop" className="bg-[#C5A021] text-white px-10 py-5 rounded-2xl font-black text-sm hover:shadow-xl transition-all shadow-[#C5A021]/20 border-b-4 border-black/10">
            ابدأ رحلة التسـوق
         </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-44 pb-20 px-6 lg:px-12 bg-muted/10" dir="rtl">
      <div className="max-w-[1600px] mx-auto space-y-12">
        <div className="border-b-2 border-gray-100 pb-10 space-y-2">
           <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tighter">قائمة <span className="text-[#CB2E26]">المفضلة</span></h1>
           <p className="text-gray-400 text-sm font-bold">المنتجات التي خطفت قلبك وتنتظر الشراء 🛒✨</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
}
