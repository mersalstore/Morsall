"use client"

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ProductGallery({ images }: { images: string[] }) {
  const [activeImage, setActiveImage] = useState(0);
  
  const displayImages = images && images.length > 0 ? images : [
    "https://placehold.co/1200x1200/F3F4F6/1089A4?text=No+Product+Image"
  ];

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-6 md:gap-8">
      {/* Thumbnails Sidebar */}
      <div className="flex lg:flex-col gap-4 md:gap-5 lg:w-28 overflow-x-auto lg:overflow-y-visible py-2 md:py-3 lg:py-0 no-scrollbar">
        {displayImages.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveImage(i)}
            className={cn(
              "w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-white rounded-2xl border-2 transition-all p-1.5 overflow-hidden group/thumb",
              activeImage === i ? "border-[#1089A4] shadow-lg shadow-[#1089A4]/10 scale-105" : "border-border/50 opacity-60 hover:opacity-100"
            )}
          >
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-muted font-heading">
               <Image 
                src={img} 
                alt={`Thumbnail ${i + 1}`} 
                fill 
                className="object-cover group-hover/thumb:scale-110 transition-transform duration-500"
               />
            </div>
          </button>
        ))}
      </div>

      {/* Main Image View */}
      <div className="flex-grow aspect-square md:aspect-auto md:h-[600px] bg-muted rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden group cursor-zoom-in border-4 border-white shadow-xl min-h-[350px]">
        <Image 
          src={displayImages[activeImage]} 
          alt="Product Main Image" 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-1000"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Hover zoom decoration */}
        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 bg-white/90 backdrop-blur-md px-5 py-2.5 md:px-6 md:py-3 rounded-2xl text-[11px] md:text-[12px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-xl shadow-black/5 border border-border/50 flex items-center gap-2 md:gap-3">
           <span className="material-symbols-rounded text-md md:text-lg text-[#1089A4]">zoom_in</span> اضغط لمشاهدة التفاصيل
        </div>
      </div>
    </div>
  );
}


