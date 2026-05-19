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
  stock?: number;
}

// Star rating helper
function Stars({ rating = 4.3, count = 128 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-1 text-xs mt-1">
      <div className="flex text-[#FFA41C]">
        {[1,2,3,4,5].map(i => (
          <span key={i} className={`text-[13px] ${i <= Math.round(rating) ? "text-[#FFA41C]" : "text-gray-300"}`}>★</span>
        ))}
      </div>
      <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">{count}</span>
    </div>
  );
}

export default function ProductCard({ id, title, price, image, vendor, vendorLocation, discount, badge, vendorId, stock }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { toggleFavorite, toggleCompare, isInFavorites, isInCompare } = useWishlist();

  const discountedPrice = discount ? Math.floor(price * (1 - discount / 100)) : price;
  const isOutOfStock = stock !== undefined && stock <= 0;

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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors flex flex-row sm:flex-col h-full relative">
      
      {/* Image Container */}
      <div className="relative w-2/5 sm:w-full aspect-square sm:aspect-[4/5] bg-white p-4 shrink-0 flex items-center justify-center">
        <Link href={`/product/${id}`} className="block w-full h-full relative">
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain"
          />
        </Link>
        {discount && discount > 0 ? (
          <div className="absolute top-2 left-2 bg-[#CC0C39] text-white text-[10px] font-bold px-2 py-1 rounded-sm">
            خصم {discount}%
          </div>
        ) : badge ? (
          <div className="absolute top-2 left-2 bg-[#B12704] text-white text-[10px] font-bold px-2 py-1 rounded-sm">
            {badge}
          </div>
        ) : null}
      </div>

      {/* Product Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow text-right border-r sm:border-r-0 border-gray-100">
        <Link href={`/product/${id}`} className="block mb-1">
          <h3 className="text-sm font-normal text-[#007185] hover:text-[#C7511F] hover:underline line-clamp-2 leading-tight">
            {title}
          </h3>
        </Link>

        {/* Social Proof */}
        <div className="flex flex-col gap-0.5 mb-2">
          <Stars rating={fakeRating} count={fakeCount} />
          <span className="text-[11px] text-gray-500">تم شراء أكثر من 1K+ الشهر الماضي</span>
        </div>

        <div className="mt-auto">
          {/* Price Block */}
          <div className="flex items-baseline gap-1.5 mb-1">
            <div className="flex items-start text-[#0F172A]">
              <span className="text-xl font-bold">{discountedPrice.toLocaleString()}</span>
              <span className="text-[10px] mt-1 mr-0.5">ج.س</span>
            </div>
            {discount && discount > 0 && (
              <span className="text-xs text-gray-500 line-through">
                {price.toLocaleString()} ج.س
              </span>
            )}
          </div>

          {/* Fulfillment & Variants */}
          <div className="flex flex-col gap-0.5 mb-3">
            <span className="text-xs text-gray-800">توصيل <span className="font-bold">مجاني</span> غداً</span>
            <span className="text-[10px] text-gray-500">يباع بواسطة <span className="text-[#007185] hover:underline cursor-pointer">{vendor}</span></span>
            <span className="text-[10px] text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer mt-1">+4 ألوان/أنماط</span>
          </div>

          {/* Action Button */}
          <button
            disabled={isOutOfStock}
            onClick={handleAdd}
            className={`w-full py-1.5 rounded-full font-normal text-sm transition-colors shadow-sm ${
              isOutOfStock 
                ? "bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed" 
                : added 
                ? "bg-green-600 border border-green-700 text-white" 
                : "bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F172A] border border-[#FCD200] hover:border-[#F2C200]"
            }`}
          >
            {isOutOfStock ? "نفذ المخزون" : added ? "تمت الإضافة" : "أضف إلى العربة"}
          </button>
        </div>
      </div>
    </div>
  );
}
