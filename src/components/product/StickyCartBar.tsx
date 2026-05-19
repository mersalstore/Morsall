import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { Product } from "@/lib/mockData/products";

export default function StickyCartBar({ product }: { product: Product }) {
  const [isVisible, setIsVisible] = useState(false);
  const { addItem } = useCart();
  const { toggleFavorite, isInFavorites, toggleCompare, isInCompare } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024) {
        setIsVisible(true);
      } else {
        setIsVisible(window.scrollY > 800);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const discountedPrice = product.discount ? Math.floor(product.price * (1 - product.discount / 100)) : product.price;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-xl border-t border-gray-100 py-4 px-6 md:px-10 transition-all duration-700 transform shadow-[0_-10px_40px_rgba(0,0,0,0.05)]",
      isVisible ? "translate-y-0" : "translate-y-full"
    )} dir="rtl">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-6">
        
        {/* Product Brief */}
        <div className="hidden md:flex items-center gap-4">
           <div className="w-14 h-14 bg-gray-50 rounded-xl flex-shrink-0 border border-gray-200 overflow-hidden relative shadow-sm">
              <Image src={product.image} alt={product.title} fill className="object-cover" />
           </div>
           <div className="flex flex-col">
              <span className="font-black text-xs text-[#0F172A] line-clamp-1 max-w-[200px] lg:max-w-sm">{product.title}</span>
              <span className="text-[#CB2E26] font-black text-sm">{discountedPrice.toLocaleString()} ج.س</span>
           </div>
        </div>

        {/* Status Mini */}
        <div className="hidden lg:flex items-center gap-6 border-r border-gray-100 pr-6 ml-0 mr-auto">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">البائع:</span>
              <span className="text-[10px] font-black text-[#C5A021] hover:underline cursor-pointer">{product.vendor}</span>
           </div>
           <div className="flex items-center gap-2 border-r border-gray-100 pr-6">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-green-600 uppercase">متوفر حصرياً</span>
           </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
           <div className="hidden sm:flex items-center gap-4 border-l border-gray-100 pl-6 ml-0">
              <button 
                onClick={() => toggleFavorite(product.id)}
                className={cn("transition-all hover:scale-110", isInFavorites(product.id) ? "text-red-500" : "text-gray-300 hover:text-red-400")}
              >
                 <span className={cn("material-symbols-rounded text-xl", isInFavorites(product.id) && "fill-1")}>favorite</span>
              </button>
              <button 
                onClick={() => toggleCompare(product.id)}
                className={cn("transition-all hover:scale-110", isInCompare(product.id) ? "text-[#C5A021]" : "text-gray-300 hover:text-blue-400")}
              >
                 <span className="material-symbols-rounded text-xl">compare_arrows</span>
              </button>
           </div>
           
           <button 
             onClick={() => addItem({ id: product.id, title: product.title, price: discountedPrice, quantity: 1, vendor: product.vendor, image: product.image })}
             className="bg-[#C5A021] text-white w-full md:w-auto px-8 lg:px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#C5A021]/20 hover:bg-[#0D708E] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-white/10"
           >
              <span className="material-symbols-rounded !text-lg">shopping_basket</span> أضف للسلة
           </button>
        </div>
      </div>
    </div>
  );
}
