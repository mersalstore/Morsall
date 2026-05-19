"use client"

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  vendor: string;
  vendorLocation: string;
  discount?: number;
  badge?: string;
  sold?: number;
  vendorId?: string;
}

// Star rating helper
function Stars({ rating = 4.3, count = 128 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-1 text-xs mt-1">
      <span className="text-[#F29124] font-bold">{rating.toFixed(1)}</span>
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <span key={i} className={`text-sm ${i <= Math.round(rating) ? "text-[#F29124]" : "text-gray-300"}`}>★</span>
        ))}
      </div>
      <span className="text-gray-400 text-[10px]">({count})</span>
    </div>
  );
}

export default function ProductCard({ id, title, price, image, vendor, vendorLocation, discount, badge, vendorId }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { toggleFavorite, toggleCompare, isInFavorites, isInCompare } = useWishlist();

  const discountedPrice = discount ? Math.floor(price * (1 - discount / 100)) : price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, title, price: discountedPrice, image, vendor, vendorId, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Deterministic "fake" rating from product id to avoid hydration mismatch
  const idHash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const fakeRating = 4 + (idHash % 10) / 10;
  const fakeCount = 50 + (idHash % 251);

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-100/50 rounded-[2rem] overflow-hidden hover:shadow-[0_20px_50px_rgba(16,137,164,0.15)] hover:border-[#C5A021]/40 transition-all duration-500 group flex flex-col h-full relative">

      {/* Badges Overlay */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {discount && (
          <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-black px-3 py-1 rounded-xl shadow-lg shadow-red-500/30 uppercase tracking-widest">
            -{discount}%
          </span>
        )}
        {badge && (
          <span className="bg-[#0F172A] text-white text-[10px] font-black px-3 py-1 rounded-xl shadow-lg shadow-[#0F172A]/30 uppercase tracking-[0.2em]">
            {badge}
          </span>
        )}
      </div>

      {/* Quick Actions (Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
        <button
          onClick={(e) => { e.preventDefault(); toggleFavorite(id); }}
          className="w-10 h-10 bg-white shadow-xl rounded-2xl flex items-center justify-center hover:bg-[#F29124] hover:text-white transition-all transform active:scale-90"
          title="أضف للمفضلة"
        >
          <span className={`material-symbols-rounded text-xl ${isInFavorites(id) ? "text-red-500 fill-1" : "text-gray-400 group-hover/btn:text-white"}`}>
            favorite
          </span>
        </button>
        <button
          onClick={(e) => { e.preventDefault(); toggleCompare(id); }}
          className="w-10 h-10 bg-white shadow-xl rounded-2xl flex items-center justify-center hover:bg-[#C5A021] hover:text-white transition-all transform active:scale-90"
          title="مقارنة المنتج"
        >
          <span className={`material-symbols-rounded text-xl ${isInCompare(id) ? "text-[#C5A021] font-bold" : "text-gray-400"}`}>
            compare_arrows
          </span>
        </button>
      </div>

      {/* Image Container */}
      <Link href={`/product/${id}`} className="relative aspect-[4/5] block overflow-hidden bg-gradient-to-b from-gray-50/50 to-white">
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain p-6 group-hover:scale-110 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>

      {/* Product Content */}
      <div className="p-6 flex flex-col flex-grow text-right">
        <div className="mb-4">
           {/* Vendor Line */}
           <div className="flex items-center gap-2 mb-2">
             <span className="w-1.5 h-1.5 rounded-full bg-[#F29124]" />
             <span className="text-[10px] text-[#C5A021] font-black uppercase tracking-widest hover:underline cursor-pointer">{vendor}</span>
           </div>

           <Link href={`/product/${id}`} className="block">
             <h3 className="text-sm font-black text-[#0F172A] leading-relaxed line-clamp-2 min-h-[2.8em] group-hover:text-[#C5A021] transition-colors">
               {title}
             </h3>
           </Link>
        </div>

        <div className="mt-auto">
          <Stars rating={fakeRating} count={fakeCount} />

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-end justify-between">
               <div className="flex flex-col">
                  {discount && (
                    <span className="text-[11px] text-gray-400 line-through mb-1 opacity-50">{price.toLocaleString()} ج.س</span>
                  )}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-[#0F172A] tracking-tighter">{discountedPrice.toLocaleString()}</span>
                    <span className="text-[10px] text-[#C5A021] font-black uppercase tracking-widest">ج.س</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-1.5 text-green-600 bg-green-50/50 px-3 py-1.5 rounded-xl border border-green-100/50">
                 <span className="material-symbols-rounded text-base animate-pulse">local_shipping</span>
                 <span className="text-[9px] font-black uppercase tracking-tighter">شحن سريع</span>
               </div>
            </div>
            
            <button
              onClick={handleAdd}
              className={`relative overflow-hidden group/btn flex items-center justify-center h-14 rounded-2xl font-black text-xs transition-all duration-500 shadow-xl ${
                added
                  ? "bg-green-600 text-white shadow-green-500/20"
                  : "bg-[#0F172A] text-white shadow-gray-200/50 hover:bg-[#C5A021] hover:shadow-[#C5A021]/30 hover:scale-[1.02]"
              }`}
            >
              {added ? (
                <span className="flex items-center gap-2 animate-in zoom-in duration-300">
                  <span className="material-symbols-rounded text-xl">verified</span>
                  تمت الإضافة للسلة
                </span>
              ) : (
                <span className="flex items-center gap-3 transition-transform duration-500 group-hover/btn:translate-x-[-4px]">
                  <span className="material-symbols-rounded text-xl">shopping_cart_checkout</span>
                  أضف للسلة الآن
                </span>
              )}
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
