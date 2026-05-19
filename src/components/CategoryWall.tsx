"use client"

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export default function CategoryWall() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(console.error);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "l" | "r") => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const move = clientWidth * 0.7;
    scrollRef.current.scrollTo({
      left: dir === "l" ? scrollLeft - move : scrollLeft + move,
      behavior: "smooth"
    });
  };

  return (
    <section className="bg-white py-10" dir="rtl">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">

        {/* ── Category Slider Header ── */}
        <div className="flex items-center justify-end mb-6 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#A89F91]">تسوق حسب الفئات</h2>
        </div>

        {/* ── Circular Category Slider ── */}
        <div className="relative group/slider">
          {/* Nav Buttons */}
          <button
            onClick={() => scroll("r")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity translate-x-1/2 hidden md:flex hover:bg-gray-50"
          >
            <span className="material-symbols-rounded text-gray-400">arrow_forward</span>
          </button>
          <button
            onClick={() => scroll("l")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity -translate-x-1/2 hidden md:flex hover:bg-gray-50"
          >
            <span className="material-symbols-rounded text-gray-400">arrow_back</span>
          </button>

          {/* Scrollable Area */}
          <div
            ref={scrollRef}
            className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-none snap-x snap-mandatory px-4 pb-4 items-start"
          >
            {categories.map((cat, i) => {
              // Assign random pastel background colors if no image, or just use it as container background
              const bgColors = ["bg-[#1E1E1E]", "bg-[#EAEAEA]", "bg-[#E5D7CE]", "bg-[#E5E7E9]", "bg-[#F3E5AB]", "bg-[#D5BDB0]", "bg-[#D5E1E6]"];
              const bgColor = bgColors[i % bgColors.length];

              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className="flex flex-col items-center gap-4 min-w-[100px] md:min-w-[130px] snap-center group"
                >
                  <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex items-center justify-center text-4xl shadow-sm transition-transform duration-300 group-hover:scale-105 ${bgColor}`}>
                    {cat.icon && (cat.icon.startsWith("http") || cat.icon.startsWith("/")) ? (
                      <Image
                        src={cat.icon}
                        alt={cat.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className={cn(
                        !cat.icon || cat.icon.length > 2 ? "material-symbols-rounded" : ""
                      )}>
                        {cat.icon || "category"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-[#333] group-hover:text-[#A89F91] transition-colors text-center w-full truncate px-2">
                    {cat.name}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
