"use client";

import { useRef } from "react";
import { Product } from "@/lib/mockData/products";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

interface ProductCarouselProps {
  title: string;
  products: Product[];
  subtitle?: string;
}

export default function ProductCarousel({ title, products, subtitle }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-12 relative group/carousel">
      {/* Header with Navigation */}
      <div className="flex items-end justify-between border-b-4 border-border/30 pb-10">
        <div className="space-y-2">
            <h3 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase">
                {title.split(' ').map((word, i) => i === 1 ? <span key={i} className="text-[#C5A021]">{word} </span> : word + ' ')}
            </h3>
            {subtitle && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{subtitle}</p>}
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={() => scroll("right")}
                className="w-14 h-14 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-[#C5A021] hover:text-[#C5A021] transition-all bg-white shadow-sm hover:shadow-lg active:scale-95"
            >
                <span className="material-symbols-rounded">chevron_right</span>
            </button>
            <button 
                onClick={() => scroll("left")}
                className="w-14 h-14 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-[#C5A021] hover:text-[#C5A021] transition-all bg-white shadow-sm hover:shadow-lg active:scale-95"
            >
                <span className="material-symbols-rounded">chevron_left</span>
            </button>
        </div>
      </div>

      {/* Horizontal Scroll Interface */}
      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 -mx-4 px-4 mask-fade-edges"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <motion.div 
            key={product.id}
            className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start"
            whileHover={{ y: -5 }}
          >
            <ProductCard {...product} />
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
    </div>
  );
}
